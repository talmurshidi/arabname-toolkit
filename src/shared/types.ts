/**
 * Types shared across all layers (core, services, ui).
 * Nothing in this file may import from any other src/ module.
 */

// ---------------------------------------------------------------------------
// Transliteration
// ---------------------------------------------------------------------------

export type TransliterationScheme = 'brill' | 'din31635';
// Future: | 'ala-lc' | 'iso-233-3'

export type ConversionDirection = 'latin-to-arabic' | 'arabic-to-latin';

export interface ConversionInput {
  text: string;
  scheme: TransliterationScheme;
}

export interface ConversionOutput {
  input: string;
  normalizedName: string;
  nameOrder: string;
  arabic: string;
  arabicHarakat: string;
  /** Canonical Brill Latin spelling — always present, regardless of `scheme`. */
  brillLatin: string;
  /** DIN 31635 spelling, derived from `brillLatin` — always present. */
  dinLatin: string;
  /**
   * For `latin-to-arabic`: the scheme the input was typed in.
   * For `arabic-to-latin`: the user's preferred/primary output scheme
   * (both `brillLatin` and `dinLatin` are always populated either way).
   */
  scheme: TransliterationScheme;
  direction: ConversionDirection;
  ruleVersion: string;
  timestamp: string;
}

// ---------------------------------------------------------------------------
// History
// ---------------------------------------------------------------------------

/** A single conversion stored in browser history. */
export interface HistoryEntry extends ConversionOutput {
  id: string;
}

// ---------------------------------------------------------------------------
// Batch processing
// ---------------------------------------------------------------------------

export interface BatchRow {
  /** Original value as read from the CSV. */
  original: string;
  /** Row index (1-based) in the source file. */
  rowIndex: number;
}

export type BatchRowResult =
  | { status: 'ok'; input: string; rowIndex: number; output: ConversionOutput }
  | { status: 'error'; input: string; rowIndex: number; error: string }
  | { status: 'skipped'; input: string; rowIndex: number; reason: string };

export interface BatchReport {
  totalRows: number;
  successCount: number;
  errorCount: number;
  skippedCount: number;
  rows: BatchRowResult[];
  processedAt: string;
}

/**
 * A non-fatal issue found while previewing a batch file, surfaced to the
 * user before they commit to processing the whole file.
 */
export interface BatchPreviewWarning {
  code:
    | 'empty-file'
    | 'no-data-rows'
    | 'column-out-of-range'
    | 'column-not-found'
    | 'single-column-detected';
  message: string;
}

/**
 * Cheap upfront look at a CSV/TSV file: header row (if any), a handful of
 * sample data rows, the resolved column index, the total data-row count,
 * and any validation warnings — all computed from a single parse of the
 * whole file, before the user commits to processing it.
 */
export interface BatchPreview {
  /** Header row, present only when `hasHeader` is true and the file isn't empty. */
  headerRow: string[] | null;
  /** First few data rows (post-header), for display before processing. */
  sampleRows: string[][];
  /** Resolved 0-based column index that processing will use. */
  columnIndex: number;
  /** Total number of data rows (post-header) in the whole file. */
  totalDataRows: number;
  /** Delimiter Papa Parse detected (or the caller-supplied one). */
  delimiter: string;
  warnings: BatchPreviewWarning[];
}

// ---------------------------------------------------------------------------
// User dictionary
// ---------------------------------------------------------------------------

/** A user-supplied Latin → Arabic override. Stored in localStorage. */
export interface UserDictionaryEntry {
  id: string;
  latin: string;
  arabicHarakat: string;
  arabic: string;
  notes?: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// UI / i18n
// ---------------------------------------------------------------------------

export type Locale = 'ar' | 'en';
