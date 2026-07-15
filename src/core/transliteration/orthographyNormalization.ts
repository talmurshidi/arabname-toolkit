/**
 * Word-position-aware orthographic normalisations, applied to Brill Latin
 * input *before* dictionary matching and the Brill engine run. Both rules
 * here fix a mismatch between what a single whole-word substitution can
 * express (no position awareness) and standard Arabic orthographic
 * convention (which the forward engine's own word-level rules for "Ibn"
 * and "al-" don't otherwise account for). Neither touches the Brill
 * engine's rules in brill/ (see ADR-003, ADR-010) — see
 * docs/METHODOLOGY.md for the full write-up and
 * tests/core/orthographyNormalization.test.ts for verification.
 */

/**
 * ابن ("ibn", son of) keeps its alif only as the very first word of a name
 * (e.g. "Ibn Khaldūn" -> ابْن خَلْدُون). Between two names — the patronymic
 * position, and by far the more common case in personal names (e.g.
 * "Muḥammad ibn ʿAbdallāh") — the alif is elided in standard Arabic
 * orthography: the connecting hamza (hamzat al-waṣl) is silent, and
 * conventionally dropped in writing, whenever "ibn" is preceded by another
 * word. This project's dictionary maps "Ibn"/"ibn" to ابْن (with alif)
 * unconditionally, since dictionary matching has no position awareness —
 * this function corrects that before the word ever reaches the dictionary
 * layer.
 *
 * Verified: "bn" (without the leading i) already produces the correct بْن
 * through the ordinary character-level engine with no dictionary entry at
 * all — so the fix is simply to rewrite non-initial "Ibn"/"ibn" to "bn"
 * before dictionary matching runs; initial occurrences are left untouched
 * so the existing "Ibn" -> ابْن dictionary entry still applies to them.
 *
 * "Bint" (daughter of) is NOT affected — it never takes an alif in Arabic
 * regardless of position, and the existing dictionary entry already
 * reflects that correctly.
 */
export function applyIbnAlifRule(text: string): string {
  return text.replace(/\bibn\b/gi, (match, offset: number) => {
    const precededByWord = text.slice(0, offset).trim().length > 0;
    return precededByWord ? 'bn' : match;
  });
}

/**
 * Brill sources sometimes spell the definite article, after a preceding
 * vowel, in its elided pronunciation form — "l-" or "'l-" (the apostrophe
 * standing in for the silent hamzat al-waṣl) — e.g. "Abū l-Qāsim" or
 * "Abū 'l-Qāsim" instead of "Abū al-Qāsim". This reflects *pronunciation*
 * only: Arabic ORTHOGRAPHY always writes the article's alif regardless of
 * whether it is pronounced in connected speech (unlike "ibn" above, whose
 * alif-elision is a genuine writing convention, not just a pronunciation
 * note). This project's engine only recognises the literal string "al-",
 * so an elided "l-"/"'l-" spelling was previously left untransliterated.
 * This function normalises both spellings to "al-" before anything else
 * runs, so sun-letter assimilation and everything downstream behaves
 * exactly as it would for an explicitly-written "al-".
 */
export function applyElidedArticleRule(text: string): string {
  return text.replace(/(^|\s)['ʼʾ]?[Ll]-/g, '$1al-');
}
