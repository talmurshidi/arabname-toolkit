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
 * exactly as it would for an explicitly-written "al-". Real bibliographic
 * sources often typeset the elision apostrophe as a typographic curly
 * quote (‘/’) rather than an ASCII one — both are accepted here too.
 */
export function applyElidedArticleRule(text: string): string {
  return text.replace(/(^|\s)['ʼʾ‘’]?[Ll]-/g, '$1al-');
}

/**
 * Brill sources commonly spell the definite article, before a "sun letter"
 * (ت ث د ذ ر ز س ش ص ض ط ظ ل ن), in its *assimilated pronunciation* form —
 * the article's lām is pronounced as (and, in Latin transliteration,
 * spelled as) the following consonant instead: "ar-Raḥmān", "as-Sābī",
 * "ash-Shāfiʿī", "adh-Dhahabī", "az-Zahrāwī", "at-Ṭabarī", "an-Nawawī",
 * etc. — one assimilated spelling per sun letter (lām itself needs no
 * separate spelling: "al-" already reads as a doubled lām for that one).
 * Each also has an elided-vowel variant with no leading "a" (an apostrophe
 * standing in for the silent hamzat al-waṣl, exactly as
 * `applyElidedArticleRule()` handles for "l-"/"'l-"): "r-", "'s-", etc.
 *
 * Arabic ORTHOGRAPHY always writes the article's alif+lām regardless of
 * this pronunciation-driven Latin spelling variation (the assimilation is a
 * spoken/Latin-transliteration convention, not a written one — the Arabic
 * shadda that results is added automatically downstream by
 * `applySunLetterAssimilation()`, once the canonical "al-" form reaches the
 * engine). This project's engine only recognises the literal string "al-",
 * so any of these assimilated spellings were previously read as two
 * unrelated words (e.g. "as-Sābī" → "as" + "Sābī"). This function rewrites
 * all of them back to "al-" before anything else runs, letting
 * `applySunLetterAssimilation()` regenerate the correct Arabic assimilation
 * from the canonical form exactly as it would for an explicitly-written
 * "al-Sābī".
 *
 * The hyphen is required immediately after the consonant cluster, so a
 * word that merely *starts* with one of these letter combinations by
 * coincidence — e.g. "Ashraf" (starts "Ash", but has no hyphen there) — is
 * left untouched.
 */
const SUN_LETTER_LATIN_CLUSTERS = [
  'th',
  'dh',
  'sh',
  't',
  'd',
  'r',
  'z',
  's',
  'ṣ',
  'ḍ',
  'ṭ',
  'ẓ',
  'n'
] as const;

const SUN_LETTER_CLUSTER_PATTERN = SUN_LETTER_LATIN_CLUSTERS.join('|');

const ASSIMILATED_ARTICLE_RE = new RegExp(
  `(^|\\s)(?:a(?:${SUN_LETTER_CLUSTER_PATTERN})|['ʼʾ‘’]?(?:${SUN_LETTER_CLUSTER_PATTERN}))-`,
  'gi'
);

export function applyAssimilatedArticleRule(text: string): string {
  return text.replace(ASSIMILATED_ARTICLE_RE, '$1al-');
}
