/**
 * The Brill consonant table, as {latin unit, Arabic base letter} pairs.
 *
 * Mechanically extracted and cross-validated against every individual
 * regex rule in the original legacyEngine.mjs (now retired — see
 * ADR-010): a Node script parsed each `txt.replaceAll(/PATTERN/gi,
 * 'REPLACEMENT')` call, derived a candidate {latin, arabic} table, then
 * *regenerated* the full rule set from that table via the same templates
 * `consonantTemplates.ts` uses and diffed it byte-for-byte against the
 * original 531 rules. All four tables below matched exactly before this
 * file was written — see the validation log in ADR-010 / the PR that
 * introduced this file. No entry here was hand-transcribed.
 *
 * Order matters: each array preserves the exact sequence rules were
 * applied in the original file, since later rules can depend on earlier
 * ones having already consumed part of the input.
 */

export interface ConsonantUnit {
  /** The Brill Latin spelling for this consonant (e.g. "b", "th", "ḫ"). */
  latin: string;
  /** The bare Arabic letter, with no vowel mark or sukūn/shadda (e.g. "ب"). */
  arabic: string;
}

// Digraphs whose *doubled* Latin form (e.g. "thth") represents a geminated
// (shadda) consonant — checked before any single-occurrence rule, so a
// later single-digraph or single-letter rule never mis-splits a doubled
// pair. "ūw" is the w/wāw doubling written as doubled ū (see ADR-010).
export const GEMINATION_DIGRAPHS: ConsonantUnit[] = [
  { latin: 'ūw', arabic: 'و' },
  { latin: 'th', arabic: 'ث' },
  { latin: 'dj', arabic: 'ج' },
  { latin: 'dh', arabic: 'ذ' },
  { latin: 'kh', arabic: 'خ' },
  { latin: 'sh', arabic: 'ش' },
  { latin: 'ch', arabic: 'ش' },
  { latin: 'gh', arabic: 'غ' }
];

// Single Latin letters whose doubled form (e.g. "bb") represents a
// geminated consonant.
export const GEMINATION_LETTERS: ConsonantUnit[] = [
  { latin: 'b', arabic: 'ب' },
  { latin: 't', arabic: 'ت' },
  { latin: 'ḥ', arabic: 'ح' },
  { latin: 'd', arabic: 'د' },
  { latin: 'r', arabic: 'ر' },
  { latin: 'z', arabic: 'ز' },
  { latin: 's', arabic: 'س' },
  { latin: 'ṣ', arabic: 'ص' },
  { latin: 'ḍ', arabic: 'ض' },
  { latin: 'ṭ', arabic: 'ط' },
  { latin: 'ẓ', arabic: 'ظ' },
  { latin: 'ʿ', arabic: 'ع' },
  { latin: 'f', arabic: 'ف' },
  { latin: 'q', arabic: 'ق' },
  { latin: 'k', arabic: 'ك' },
  { latin: 'l', arabic: 'ل' },
  { latin: 'm', arabic: 'م' },
  { latin: 'n', arabic: 'ن' },
  { latin: 'h', arabic: 'ه' },
  { latin: 'w', arabic: 'و' },
  { latin: 'ū', arabic: 'و' },
  { latin: 'y', arabic: 'ي' },
  { latin: 'ī', arabic: 'ي' },
  { latin: 'ǧ', arabic: 'ج' },
  { latin: 'j', arabic: 'ج' },
  { latin: 'ḫ', arabic: 'خ' },
  { latin: 'š', arabic: 'ش' },
  { latin: 'ġ', arabic: 'غ' }
];

// Digraphs mapped to a single (non-doubled) Arabic consonant.
export const SINGLE_DIGRAPHS: ConsonantUnit[] = [
  { latin: 'th', arabic: 'ث' },
  { latin: 'dh', arabic: 'ذ' },
  { latin: 'kh', arabic: 'خ' },
  { latin: 'ḫ', arabic: 'خ' },
  { latin: 'sh', arabic: 'ش' },
  { latin: 'ch', arabic: 'ش' },
  { latin: 'gh', arabic: 'غ' }
];

// Single Latin letters mapped to a single (non-doubled) Arabic consonant.
// w/y/ū/ī are deliberately excluded here — their single-occurrence rules
// have extra irregular lines (glide/hamza fusions) and are kept as an
// explicit rule list in irregularRules.ts instead of this template.
export const SINGLE_LETTERS: ConsonantUnit[] = [
  { latin: 'b', arabic: 'ب' },
  { latin: 't', arabic: 'ت' },
  { latin: 'ḥ', arabic: 'ح' },
  { latin: 'j', arabic: 'ج' },
  { latin: 'd', arabic: 'د' },
  { latin: 'r', arabic: 'ر' },
  { latin: 'z', arabic: 'ز' },
  { latin: 's', arabic: 'س' },
  { latin: 'ṣ', arabic: 'ص' },
  { latin: 'ḍ', arabic: 'ض' },
  { latin: 'ṭ', arabic: 'ط' },
  { latin: 'ẓ', arabic: 'ظ' },
  { latin: 'ʿ', arabic: 'ع' },
  { latin: 'f', arabic: 'ف' },
  { latin: 'q', arabic: 'ق' },
  { latin: 'k', arabic: 'ك' },
  { latin: 'l', arabic: 'ل' },
  { latin: 'm', arabic: 'م' },
  { latin: 'n', arabic: 'ن' },
  { latin: 'h', arabic: 'ه' }
];
