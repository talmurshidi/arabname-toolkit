/**
 * Pure utility functions with no DOM or Node.js dependencies.
 * Safe to use in core, services, and ui layers.
 */

/** Generate a UUID using the Web Crypto API (browser) or crypto module (Node/Vitest). */
export function generateId(): string {
  // crypto.randomUUID() is available in all modern browsers and in Node ≥ 19.
  return crypto.randomUUID();
}

/** Returns an ISO 8601 timestamp string for the current moment. */
export function nowIso(): string {
  return new Date().toISOString();
}

/** Clamp a number between min and max (inclusive). */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Truncate a string to `maxLength` characters, appending `suffix` if
 * truncation occurred. The total length of the result is at most `maxLength`.
 */
export function truncate(text: string, maxLength: number, suffix = '…'): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * Returns true if the string contains at least one Arabic Unicode character
 * (basic Arabic block U+0600–U+06FF).
 */
export function containsArabic(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text);
}

/**
 * Returns true if the string contains diacritic characters commonly used in
 * Brill/ALA-LC transliteration (macrons, underdots, ʿayn, hamza marks).
 */
export function containsTransliterationDiacritics(text: string): boolean {
  return /[āūīḥṣḍṭẓĀŪĪḤṢḌṬẒʿʾ]/.test(text);
}

/** Strip Arabic diacritics (harakat, U+064B–U+0652) from an Arabic string. */
export function stripHarakat(text: string): string {
  return text.replace(/[ً-ْ]/g, '');
}
