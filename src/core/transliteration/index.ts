/**
 * Public API for the transliteration core.
 *
 * Layer order (highest priority first):
 * 1. corrections.ts   — exact-match fixes for known-degraded inputs
 * 2. dictionary.ts    — curated Latin → Arabic compound/name data
 * 3. dictionaryMatcher.ts — greedy longest-match lookup over the dictionary
 * 4. brill/ (engine.ts) — the character-level Brill regex engine. Ported
 *                         from legacyEngine.mjs (retired — see ADR-010)
 *                         into typed, data-driven modules; still treat its
 *                         rules as load-bearing scholarly convention — do
 *                         not casually edit them (see ADR-003, ADR-010).
 * 5. bracketSanitizer.ts — repairs stray brackets; preserves well-formed ones
 * 6. arabicHouseStyle.ts  — post-processing (yā-sukūn convention, etc.)
 *
 * Callers should import only from this file, not from the sub-modules
 * directly. That keeps the internal layering invisible to consumers and
 * lets the implementation evolve without breaking call sites.
 */
import {
  fixAlDashAndBracket,
  replaceFilterNameOrder,
  transliterationToArabicHarakat
} from './brill/index.js';
import {
  BracketFixOptions,
  DEFAULT_BRACKET_FIX_OPTIONS,
  sanitizeBrackets
} from './bracketSanitizer.js';
import { dictionaryTransliterate, reassembleDictionaryTokens } from './dictionaryMatcher.js';
import { applyYaSukunHouseStyle } from './arabicHouseStyle.js';
import { TRANSLITERATION_CORRECTIONS } from './corrections.js';
import { generateLatinFromArabic } from './arabicToLatin.js';
import { applyIbnAlifRule, applyElidedArticleRule } from './orthographyNormalization.js';

export { looksFullyDiacritized } from './arabicToLatin.js';

export { applyIbnAlifRule, applyElidedArticleRule } from './orthographyNormalization.js';

export { sanitizeBrackets, DEFAULT_BRACKET_FIX_OPTIONS } from './bracketSanitizer.js';
export type { BracketFix, BracketFixOptions } from './bracketSanitizer.js';
export { TRANSLITERATION_DICTIONARY, DICTIONARY_BY_FIRST_WORD } from './dictionary.js';
export type { DictionaryCandidate } from './dictionary.js';
export type { DictionaryToken, DictionaryMatchResult } from './dictionaryMatcher.js';
export { dinToBrill, brillToDin, containsDin31635Chars } from './din31635.js';

/**
 * Bumped whenever the rules change in a way that would alter output for
 * any existing input. Used for documentation and audit trail purposes.
 */
export const TRANSLITERATION_RULE_VERSION = 'dictionary-v1-legacy-fallback-2.0.4';

export interface TransliterationOptions {
  bracketFix?: Partial<BracketFixOptions>;
}

export interface TransliterationResult {
  /** The Latin input after al- / bracket normalisation. */
  normalizedName: string;
  /** ASCII-safe sort key (diacritics and ʿayn/hamza stripped). */
  nameOrder: string;
  /** Arabic script without diacritics. */
  arabic: string;
  /** Arabic script with full diacritics (harakat). */
  arabicHarakat: string;
}

// Legacy's own removeHarakat() strips anything outside a letter/digit/space
// whitelist — which used to be harmless (brackets never survived this far),
// but now that well-formed brackets/"?" are deliberately preserved through
// generateArabicHarakat(), that whitelist would silently drop them too.
// This strips only the harakat diacritic marks themselves (U+064B–U+0652).
export function stripHarakatDiacritics(text: string): string {
  return text.replace(/[ً-ْ]/g, '');
}

function fallbackWord(word: string): string {
  const raw = String(transliterationToArabicHarakat(word) ?? '').trim();
  // Dictionary spans are already correct per the house-style audit and must
  // not be reprocessed; only the legacy engine's raw output needs this pass.
  return applyYaSukunHouseStyle(raw);
}

/** Normalise trailing ", al-" / bracket patterns in a transliterated name. */
export function normalizeTransliteratedName(
  value: string,
  options?: TransliterationOptions
): string {
  const bracketFixOptions: BracketFixOptions = {
    ...DEFAULT_BRACKET_FIX_OPTIONS,
    ...options?.bracketFix
  };
  const { text } = sanitizeBrackets(value.trim(), bracketFixOptions);
  return String(fixAlDashAndBracket(text) ?? '').trim();
}

/** Build an ASCII sort key for a transliterated name. */
export function createNameOrder(value: string): string {
  return String(replaceFilterNameOrder(value) ?? '')
    .trim()
    .replace(/\s+/g, ' ');
}

/** Generate Arabic with diacritics from a Brill-transliterated name. */
export function generateArabicHarakat(value: string, options?: TransliterationOptions): string {
  // Exact-match corrections take absolute priority.
  const correction = TRANSLITERATION_CORRECTIONS[value.trim()];
  if (correction !== undefined) return correction;

  const normalized = normalizeTransliteratedName(value, options);
  const withOrthographyFixes = applyIbnAlifRule(applyElidedArticleRule(normalized));
  const matchResult = dictionaryTransliterate(withOrthographyFixes);
  return reassembleDictionaryTokens(matchResult, fallbackWord).trim();
}

/** Generate Arabic without diacritics from a Brill-transliterated name. */
export function generateArabic(value: string, options?: TransliterationOptions): string {
  return stripHarakatDiacritics(generateArabicHarakat(value, options)).trim();
}

/**
 * Reverse direction: convert fully-diacritised Arabic script to Brill Latin.
 * Undiacritised input is ambiguous (see docs/METHODOLOGY.md) — callers
 * should check `looksFullyDiacritized()` first and warn the user rather
 * than trusting this output blindly for undotted text.
 */
export function generateLatin(value: string): string {
  return generateLatinFromArabic(value);
}

/** Full conversion: returns all four derived forms in one call. */
export function generateTransliteration(
  value: string,
  options?: TransliterationOptions
): TransliterationResult {
  const normalizedName = normalizeTransliteratedName(value, options);
  const arabicHarakat = generateArabicHarakat(normalizedName, options);
  return {
    normalizedName,
    nameOrder: createNameOrder(normalizedName),
    arabic: stripHarakatDiacritics(arabicHarakat).trim(),
    arabicHarakat
  };
}
