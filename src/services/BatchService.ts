/**
 * Orchestrates batch conversion from a CSV/TSV file.
 * Uses Papa Parse for CSV parsing (imported lazily to keep initial bundle small).
 * Designed to process large files without blocking the main thread via
 * chunked processing with progress callbacks.
 */
import type {
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
  /** Called after each row is processed. */
  onProgress?: (processed: number, total: number) => void;
}

/**
 * Process a CSV/TSV File object and return a BatchReport.
 * Imports Papa Parse lazily — no bundle cost on pages that don't use batch.
 */
export async function processCsvFile(file: File, options: BatchOptions = {}): Promise<BatchReport> {
  const Papa = await import('papaparse');
  const scheme = options.scheme ?? 'brill';
  const skipEmpty = options.skipEmpty ?? true;

  return new Promise((resolve, reject) => {
    const rows: BatchRowResult[] = [];
    let rowIndex = 0;
    let headerResolved = false;
    let columnIndex = 0;

    Papa.default.parse<string[]>(file, {
      delimiter: options.delimiter ?? '',
      skipEmptyLines: true,
      header: false,
      step(result) {
        const record = result.data;

        // Resolve column index from header row
        if (!headerResolved) {
          headerResolved = true;
          if (typeof options.column === 'string') {
            const headerIdx = record.findIndex(
              (h) => h.trim().toLowerCase() === (options.column as string).toLowerCase()
            );
            columnIndex = headerIdx === -1 ? 0 : headerIdx;
          } else {
            columnIndex = options.column ?? 0;
          }
          return; // skip header row
        }

        rowIndex++;
        const raw = record[columnIndex]?.trim() ?? '';

        if (!raw && skipEmpty) {
          rows.push({ status: 'skipped', input: raw, rowIndex, reason: 'empty cell' });
          options.onProgress?.(rowIndex, rowIndex);
          return;
        }

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

        options.onProgress?.(rowIndex, rowIndex);
      },
      complete() {
        const report: BatchReport = {
          totalRows: rows.length,
          successCount: rows.filter((r) => r.status === 'ok').length,
          errorCount: rows.filter((r) => r.status === 'error').length,
          skippedCount: rows.filter((r) => r.status === 'skipped').length,
          rows,
          processedAt: nowIso()
        };
        resolve(report);
      },
      error(err) {
        reject(new Error(err.message));
      }
    });
  });
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
