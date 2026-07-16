/**
 * Orchestrates batch conversion from a CSV/TSV file.
 * Uses Papa Parse for CSV parsing (imported lazily to keep initial bundle small).
 *
 * The whole file is read and parsed upfront (via `file.text()` + a
 * synchronous `Papa.parse(text, ...)` call) rather than streamed through
 * Papa Parse's own File-reading path. Two reasons:
 *   1. It's the only way to know the true total row count upfront, for
 *      accurate progress reporting — a `step()`-based stream doesn't know
 *      the total until it's already finished.
 *   2. Papa Parse's File-streaming path relies on `FileReader`/
 *      `FileReaderSync`, the latter of which is worker-only and unavailable
 *      in a plain Node test environment — parsing a string works
 *      identically in the browser and in Vitest.
 * The main-thread-blocking concern that motivated streaming in the first
 * place is instead addressed by yielding to the event loop every
 * `YIELD_EVERY_N_ROWS` rows — real batch inputs here are name lists, not
 * multi-gigabyte files, so parsing fully into memory first is fine.
 */
import type {
  BatchPreview,
  BatchPreviewWarning,
  BatchReport,
  BatchRowResult,
  ConversionOutput,
  TransliterationScheme
} from '@shared/types.js';
import { nowIso } from '@shared/utils.js';
import { transliterationService } from './TransliterationService.js';

export interface BatchOptions {
  /** CSV column name or 0-based index containing the Latin names. Default: 0. */
  column?: string | number;
  /** Delimiter. Default: auto-detect. */
  delimiter?: string;
  /** Transliteration scheme to apply. Default: 'brill'. */
  scheme?: TransliterationScheme;
  /** Skip rows where the input cell is empty. Default: true. */
  skipEmpty?: boolean;
  /**
   * Whether the file's first row is a header row: skipped during
   * processing, and — if `column` is a string — matched against to resolve
   * the column index. Default: `true`.
   *
   * Set this to `false` for headerless CSV/TSV files. A string `column`
   * combined with `hasHeader: false` is a caller error (there's no header
   * row to match against) and throws immediately rather than guessing.
   */
  hasHeader?: boolean;
  /**
   * Called after each row is processed. `total` is the true total data-row
   * count, computed upfront.
   */
  onProgress?: (processed: number, total: number) => void;
}

const YIELD_EVERY_N_ROWS = 50;
const PREVIEW_ROW_COUNT = 5;

/** Parses the file's full text content into rows. Never streams the File object directly — see module docstring. */
async function parseAllRows(
  file: File,
  delimiter?: string
): Promise<{ rows: string[][]; delimiter: string }> {
  const Papa = await import('papaparse');
  const text = await file.text();
  const result = Papa.default.parse<string[]>(text, {
    delimiter: delimiter ?? '',
    skipEmptyLines: true,
    header: false
  });

  const fatalError = result.errors.find((e) => e.code !== 'UndetectableDelimiter');
  if (fatalError) {
    throw new Error(fatalError.message);
  }

  return { rows: result.data, delimiter: result.meta.delimiter };
}

/** Resolves a caller-supplied column (name or index) against an optional header row. */
function resolveColumnIndex(
  column: string | number | undefined,
  headerRow: string[] | null
): number {
  if (typeof column === 'string') {
    if (!headerRow) {
      throw new Error(
        `A named column ("${column}") requires a header row. Pass hasHeader: true, or use a 0-based numeric column index instead.`
      );
    }
    const idx = headerRow.findIndex((h) => h.trim().toLowerCase() === column.toLowerCase());
    if (idx === -1) {
      throw new Error(`Column "${column}" was not found in the header row.`);
    }
    return idx;
  }
  return column ?? 0;
}

/**
 * Process a CSV/TSV File object and return a BatchReport.
 * Imports Papa Parse lazily — no bundle cost on pages that don't use batch.
 */
export async function processCsvFile(file: File, options: BatchOptions = {}): Promise<BatchReport> {
  const scheme = options.scheme ?? 'brill';
  const skipEmpty = options.skipEmpty ?? true;
  const hasHeader = options.hasHeader ?? true;

  const { rows: allRows } = await parseAllRows(file, options.delimiter);

  const headerRow = hasHeader ? (allRows[0] ?? null) : null;
  const dataRows = hasHeader ? allRows.slice(1) : allRows;
  const columnIndex = resolveColumnIndex(options.column, headerRow);

  const rows: BatchRowResult[] = [];
  const total = dataRows.length;

  for (let i = 0; i < dataRows.length; i++) {
    const rowIndex = i + 1;
    const raw = dataRows[i]?.[columnIndex]?.trim() ?? '';

    if (!raw && skipEmpty) {
      rows.push({ status: 'skipped', input: raw, rowIndex, reason: 'empty cell' });
    } else {
      try {
        const output: ConversionOutput = transliterationService.convert({ text: raw, scheme });
        rows.push({ status: 'ok', input: raw, rowIndex, output });
      } catch (err) {
        rows.push({
          status: 'error',
          input: raw,
          rowIndex,
          error: err instanceof Error ? err.message : String(err)
        });
      }
    }

    options.onProgress?.(rowIndex, total);

    if (rowIndex % YIELD_EVERY_N_ROWS === 0) {
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }

  return {
    totalRows: rows.length,
    successCount: rows.filter((r) => r.status === 'ok').length,
    errorCount: rows.filter((r) => r.status === 'error').length,
    skippedCount: rows.filter((r) => r.status === 'skipped').length,
    rows,
    processedAt: nowIso()
  };
}

/**
 * Cheap upfront look at a CSV/TSV file, meant to be called as soon as the
 * user selects a file (and again if they change the column/hasHeader
 * options), so the UI can show a preview and surface validation problems
 * *before* the user commits to processing the whole file.
 */
export async function previewCsvFile(
  file: File,
  options: Pick<BatchOptions, 'column' | 'delimiter' | 'hasHeader'> = {}
): Promise<BatchPreview> {
  const hasHeader = options.hasHeader ?? true;
  const warnings: BatchPreviewWarning[] = [];

  const { rows: allRows, delimiter } = await parseAllRows(file, options.delimiter);

  if (allRows.length === 0) {
    warnings.push({ code: 'empty-file', message: 'The file has no rows.' });
    return {
      headerRow: null,
      sampleRows: [],
      columnIndex: 0,
      totalDataRows: 0,
      delimiter,
      warnings
    };
  }

  const headerRow = hasHeader ? (allRows[0] ?? null) : null;
  const dataRows = hasHeader ? allRows.slice(1) : allRows;

  if (dataRows.length === 0) {
    warnings.push({
      code: 'no-data-rows',
      message: hasHeader
        ? 'The file only has a header row and no data rows.'
        : 'The file has no rows.'
    });
  }

  let columnIndex = 0;
  try {
    columnIndex = resolveColumnIndex(options.column, headerRow);
  } catch (err) {
    warnings.push({
      code: 'column-not-found',
      message: err instanceof Error ? err.message : String(err)
    });
  }

  const sampleForWidthCheck = dataRows.slice(0, 20);
  const widestRow = Math.max(
    headerRow?.length ?? 0,
    ...sampleForWidthCheck.map((r) => r.length),
    0
  );

  if (widestRow <= 1) {
    warnings.push({
      code: 'single-column-detected',
      message:
        'Only one column was detected across this file — check the delimiter if it should have multiple columns.'
    });
  }
  if (widestRow > 0 && columnIndex >= widestRow) {
    warnings.push({
      code: 'column-out-of-range',
      message: `Column index ${columnIndex} is out of range; this file has ${widestRow} column(s).`
    });
  }

  return {
    headerRow,
    sampleRows: dataRows.slice(0, PREVIEW_ROW_COUNT),
    columnIndex,
    totalDataRows: dataRows.length,
    delimiter,
    warnings
  };
}

/**
 * Export a BatchReport to CSV string with columns:
 * row, input, arabic_harakat, arabic, name_order, status, error
 */
export function exportReportToCsv(report: BatchReport): string {
  const headers = ['row', 'input', 'arabic_harakat', 'arabic', 'name_order', 'status', 'error'];
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;

  const dataRows = report.rows.map((r) => {
    if (r.status === 'ok') {
      return [
        r.rowIndex,
        escape(r.input),
        escape(r.output.arabicHarakat),
        escape(r.output.arabic),
        escape(r.output.nameOrder),
        'ok',
        ''
      ].join(',');
    }
    if (r.status === 'error') {
      return [r.rowIndex, escape(r.input), '', '', '', 'error', escape(r.error)].join(',');
    }
    return [r.rowIndex, escape(r.input), '', '', '', 'skipped', escape(r.reason)].join(',');
  });

  return [headers.join(','), ...dataRows].join('\n');
}
