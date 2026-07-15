/**
 * DIN 31635 ⇄ Brill conversion layer.
 *
 * DIN 31635 ("Information und Dokumentation – Umschrift des arabischen
 * Alphabets", Deutsches Institut für Normung e.V., 2011-07) is the German
 * Oriental Society's Arabic transliteration standard (used in, e.g.,
 * Brockelmann's _Geschichte der arabischen Litteratur_). It shares Brill's
 * macron/underdot letters (ā ḥ ṣ ḍ ṭ ẓ ʿ ʾ) but uses single Unicode letters
 * — ǧ š ġ ḏ ṯ ẖ ẗ — where Brill uses digraphs (j/dj, sh, gh, dh, th, kh,
 * bare -a). See docs/METHODOLOGY.md and ADR-007 for the full write-up.
 *
 * This module is a pre/post-processing layer around the existing Brill
 * pipeline in index.ts. It never edits the Brill engine's rules in brill/
 * (ADR-003, ADR-010): DIN input is converted to Brill *before* entering
 * the pipeline (`dinToBrill`), and Brill output is converted back to DIN
 * spelling only for display (`brillToDin`). The underlying conversion is
 * always Brill; DIN is a spelling convention layered on top.
 *
 * Verified against the regression suite in tests/core/din31635.test.ts —
 * every mapping below round-trips through the real engine, not just this
 * module in isolation.
 */

// Single DIN 31635 letter -> Brill digraph. Order matters only in that this
// list must be applied before the plain "j" pass below (so "ǧ" always
// becomes "j", never gets double-processed).
const DIN_SINGLE_TO_BRILL: Array<[string, string]> = [
  ['ǧ', 'j'],
  ['Ǧ', 'J'],
  ['š', 'sh'],
  ['Š', 'Sh'],
  ['ġ', 'gh'],
  ['Ġ', 'Gh'],
  ['ḏ', 'dh'],
  ['Ḏ', 'Dh'],
  ['ṯ', 'th'],
  ['Ṯ', 'Th'],
  ['ẖ', 'kh'],
  ['H\u0331', 'Kh'] // capital ẖ has no precomposed Unicode form; DIN renders it as H + combining macron below (U+0331)
];

// DIN's tāʾ marbūṭa marker. Always word-final; maps to this project's Brill
// convention of a bare trailing "a" (see docs/METHODOLOGY.md — the engine
// renders any word-final bare "a" as ة).
const DIN_TA_MARBUTA = 'ẗ';

/** True if the text contains any character that is specific to DIN 31635 (not shared with Brill). */
export function containsDin31635Chars(text: string): boolean {
  return DIN_SINGLE_TO_BRILL.some(([din]) => text.includes(din)) || text.includes(DIN_TA_MARBUTA);
}

/**
 * Convert DIN 31635-spelled Latin text to Brill-spelled Latin, so it can be
 * fed into the existing Brill → Arabic pipeline unchanged.
 */
export function dinToBrill(text: string): string {
  let out = text;
  for (const [din, brill] of DIN_SINGLE_TO_BRILL) {
    out = out.split(din).join(brill);
  }
  return out.split(DIN_TA_MARBUTA).join('a');
}

// Brill digraph -> DIN single letter, longest-first so e.g. "dh" isn't
// partially matched by a shorter pattern. "dj" is folded into ǧ too (an
// EI2-style spelling of the same letter as "j"), even though "dj" itself is
// not reliable Brill input (see docs/METHODOLOGY.md) — if it appears in
// text we still render it faithfully as DIN's ǧ.
const BRILL_DIGRAPH_TO_DIN: Array<[RegExp, string]> = [
  [/dj/g, 'ǧ'],
  [/Dj/g, 'Ǧ'],
  [/DJ/g, 'Ǧ'],
  [/th/g, 'ṯ'],
  [/Th/g, 'Ṯ'],
  [/TH/g, 'Ṯ'],
  [/dh/g, 'ḏ'],
  [/Dh/g, 'Ḏ'],
  [/DH/g, 'Ḏ'],
  [/kh/g, 'ẖ'],
  [/Kh/g, 'H\u0331'],
  [/KH/g, 'H\u0331'],
  [/sh/g, 'š'],
  [/Sh/g, 'Š'],
  [/SH/g, 'Š'],
  [/gh/g, 'ġ'],
  [/Gh/g, 'Ġ'],
  [/GH/g, 'Ġ'],
  [/j/g, 'ǧ'],
  [/J/g, 'Ǧ']
];

/**
 * Convert Brill-spelled Latin text (as produced/accepted by this project's
 * engine) to DIN 31635 spelling, for display alongside the Brill form.
 * Operates purely on Latin spelling — does not touch Arabic script.
 */
export function brillToDin(text: string): string {
  let out = text;
  for (const [pattern, din] of BRILL_DIGRAPH_TO_DIN) {
    out = out.replace(pattern, din);
  }
  // Word-final bare "a" (not the macron ā) is this project's Brill
  // convention for tāʾ marbūṭa — render it as DIN's ẗ. Matches "a" directly
  // before whitespace, a hyphen, or the end of the string.
  out = out.replace(/a(?=[\s-]|$)/g, DIN_TA_MARBUTA);
  return out;
}
