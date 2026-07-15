/**
 * Brill Latin -> Arabic character-level engine.
 *
 * This orchestrates the same rule pipeline, in the same order, as the
 * original legacyEngine.mjs (now retired — see ADR-010): common
 * irregular words, early hamza rules, geminated-consonant templates,
 * single-occurrence consonant templates, glide/hamza-fusion extras, late
 * hamza/vowel fallback rules, sun-letter assimilation, and finally the
 * alif-maqsura word-ending adjustment. Every individual rule was
 * cross-validated byte-for-byte against the retired file before this
 * replaced it as the active implementation — see the module-level comment
 * in `consonantTable.ts` and ADR-010.
 */
import { fixAlDashAndBracket } from './bracketArticleFix.js';
import { fixBrillChar, removeHarakat } from './helpers.js';
import {
  GEMINATION_DIGRAPHS,
  GEMINATION_LETTERS,
  SINGLE_DIGRAPHS,
  SINGLE_LETTERS
} from './consonantTable.js';
import { applyGeminationTable, applySingleTable } from './consonantTemplates.js';
import {
  applyCommonWords,
  applyHamzaEarly,
  applyGlideExtras,
  applyHamzaLateAndVowelFallback
} from './irregularRules.js';
import { applySunLetterAssimilation } from './sunLetterAssimilation.js';

/** Convert one already-space-free Brill Latin token to Arabic with full diacritics (ḥarakāt). */
export function transliterationToArabicHarakat(txt: string): string {
  if (!txt) return txt;

  txt = txt.trim();
  const hasLeftBrackets = txt.startsWith('(');
  const hasRightBrackets = txt.endsWith(')');
  const hasComma = txt.endsWith(',');

  if (hasComma) txt = txt.replaceAll(',', '');
  if (hasLeftBrackets) txt = txt.replaceAll('(', '');
  if (hasRightBrackets) txt = txt.replaceAll(')', '');

  txt = applyCommonWords(txt);
  txt = applyHamzaEarly(txt);
  txt = applyGeminationTable(txt, GEMINATION_DIGRAPHS);
  txt = applySingleTable(txt, SINGLE_DIGRAPHS);
  txt = applyGeminationTable(txt, GEMINATION_LETTERS);
  txt = applySingleTable(txt, SINGLE_LETTERS);
  txt = applyGlideExtras(txt);
  txt = applyHamzaLateAndVowelFallback(txt);
  txt = applySunLetterAssimilation(txt);

  // Word-final alif becomes alif maqṣūra (ى), except right after a
  // geminated yāʾ ("يَّا") — a long word check avoids mangling very short
  // fragments.
  if (txt.length > 3 && !txt.endsWith('يَّا')) {
    txt = txt.replaceAll(/ا$/gi, 'ى');
  }

  if (hasLeftBrackets) txt = '(' + txt;
  if (hasRightBrackets) txt = txt + ')';
  if (hasComma) txt = txt + ',';

  return txt;
}

/**
 * Applies `fixAlDashAndBracket`/`fixBrillChar` normalization, then converts
 * each space-separated word of `txt` independently via
 * `transliterationToArabicHarakat`.
 */
export function applyArabicHarakatTransliteration(txt: string): string {
  if (!txt) return txt;

  txt = fixAlDashAndBracket(txt);
  txt = fixBrillChar(txt);

  const words = txt.split(' ');
  let result = '';
  for (const word of words) {
    result += transliterationToArabicHarakat(word) + ' ';
  }
  return result.trim();
}

/** Converts Brill Latin text to Arabic script without diacritics (ḥarakāt stripped). */
export function transliterationToArabic(txt: string): string {
  if (!txt) return txt;
  txt = applyArabicHarakatTransliteration(txt);
  txt = removeHarakat(txt);
  return txt;
}
