/**
 * Forward-direction sun-letter shadda assimilation: for a word beginning
 * with the definite article "ال", adds a shadda to the following sun
 * letter's short-vowel mark (ت ث د ذ ر ز س ش ص ض ط ظ ل ن — all fourteen).
 * Runs on the already-converted Arabic text, after the consonant/vowel
 * templates have produced the base letters.
 *
 * Ported verbatim (byte-for-byte, mechanically extracted, never
 * hand-retyped) from legacyEngine.mjs, now retired — see ADR-010.
 *
 * (This is the forward-direction counterpart to `looksFullyDiacritized()`'s
 * and `convertWord()`'s article-lām handling on the *reverse* side, in
 * arabicToLatin.ts — see ADR-008.)
 */
export function applySunLetterAssimilation(txt: string): string {
  if (txt.startsWith('ال')) {
    txt = txt.replace(/التَ/i, 'التَّ');
    txt = txt.replace(/التُ/i, 'التُّ');
    txt = txt.replace(/التِ/i, 'التِّ');

    txt = txt.replace(/الثَ/i, 'الثَّ');
    txt = txt.replace(/الثُ/i, 'الثُّ');
    txt = txt.replace(/الثِ/i, 'الثِّ');

    txt = txt.replace(/الدَ/i, 'الدَّ');
    txt = txt.replace(/الدُ/i, 'الدُّ');
    txt = txt.replace(/الدِ/i, 'الدِّ');

    txt = txt.replace(/الذَ/i, 'الذَّ');
    txt = txt.replace(/الذُ/i, 'الذُّ');
    txt = txt.replace(/الذِ/i, 'الذِّ');

    txt = txt.replace(/الرَ/i, 'الرَّ');
    txt = txt.replace(/الرُ/i, 'الرُّ');
    txt = txt.replace(/الرِ/i, 'الرِّ');

    txt = txt.replace(/الزَ/i, 'الزَّ');
    txt = txt.replace(/الزُ/i, 'الزُّ');
    txt = txt.replace(/الزِ/i, 'الزِّ');

    txt = txt.replace(/السَ/i, 'السَّ');
    txt = txt.replace(/السُ/i, 'السُّ');
    txt = txt.replace(/السِ/i, 'السِّ');

    txt = txt.replace(/الشَ/i, 'الشَّ');
    txt = txt.replace(/الشُ/i, 'الشُّ');
    txt = txt.replace(/الشِ/i, 'الشِّ');

    txt = txt.replace(/الصَ/i, 'الصَّ');
    txt = txt.replace(/الصُ/i, 'الصُّ');
    txt = txt.replace(/الصِ/i, 'الصِّ');

    txt = txt.replace(/الضَ/i, 'الضَّ');
    txt = txt.replace(/الضُ/i, 'الضُّ');
    txt = txt.replace(/الضِ/i, 'الضِّ');

    txt = txt.replace(/الطَ/i, 'الطَّ');
    txt = txt.replace(/الطُ/i, 'الطُّ');
    txt = txt.replace(/الطِ/i, 'الطِّ');

    txt = txt.replace(/الظَ/i, 'الظَّ');
    txt = txt.replace(/الظُ/i, 'الظُّ');
    txt = txt.replace(/الظِ/i, 'الظِّ');

    txt = txt.replace(/اللَ/i, 'اللَّ');
    txt = txt.replace(/اللُ/i, 'اللُّ');
    txt = txt.replace(/اللِ/i, 'اللِّ');

    txt = txt.replace(/النَ/i, 'النَّ');
    txt = txt.replace(/النُ/i, 'النُّ');
    txt = txt.replace(/النِ/i, 'النِّ');
  }
  return txt;
}
