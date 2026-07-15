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
