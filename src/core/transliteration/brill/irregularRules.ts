/**
 * Rule blocks that don't fit the regular gemination/single-occurrence
 * consonant templates (see consonantTemplates.ts) — irregular whole-word
 * substitutions, hamza normalization, and the w/y/ī/ū glide-fusion extras.
 *
 * These are ported verbatim (byte-for-byte, extracted mechanically from
 * the original source — never hand-retyped, per the lesson in CLAUDE.md's
 * testing guidance about Arabic combining-mark transcription risk) from
 * legacyEngine.mjs, now retired — see ADR-010.
 */

/**
 * Whole-word irregular substitutions (e.g. "ʿAbdallāh", "Ibn", "Bint") and
 * the literal "al-" -> "ال" normalization. Runs first, before any
 * character-level rule.
 */
export function applyCommonWords(txt: string): string {
  txt = txt.replaceAll(/ʿAbdallāh/gi, 'عَبْد اللَّه');
  txt = txt.replaceAll(/Hibatallāh/gi, 'هِبَة اللَّه');
  txt = txt.replaceAll(/\bYuḥannā\b/gi, 'يُحَنَّا');
  txt = txt.replaceAll(/\bḤannā\b/gi, 'حَنَّا');
  txt = txt.replaceAll(/ʿAbda/gi, 'عَبْدَة');
  txt = txt.replaceAll(/ʿUbayd/gi, 'عُبَيْد');
  txt = txt.replaceAll(/\bʿAbd\b/gi, 'عَبْد');
  txt = txt.replaceAll(/\bAbū\b/gi, 'أَبُو');
  txt = txt.replaceAll(/\bAbu\b/gi, 'أَبُو');
  txt = txt.replaceAll(/\bahl\b/gi, 'أَهْل');
  txt = txt.replaceAll(/allāh/gi, 'اللَّه');
  txt = txt.replaceAll(/llāh/gi, 'لِلْه');
  txt = txt.replaceAll(/\bBint\b/g, 'بِنْت');
  txt = txt.replaceAll(/\bIbn\b/g, 'ابْن');
  txt = txt.replaceAll(/\bLaysa\b/gi, 'لَيْسَ');
  txt = txt.replaceAll(/\bKhalaṭa\b/gi, 'خَلَطَ');
  txt = txt.replaceAll(/\bCopt\b/gi, 'قِبْطِي');
  txt = txt.replaceAll(/\bCooton\b/gi, 'قُطُن');
  txt = txt.replaceAll('bt.', 'بِنْت'); //bt.
  txt = txt.replaceAll('b.', 'بِن'); //b.
  txt = txt.replaceAll('Ṣ.', 'صَاحِب'); //b.
  txt = txt.replaceAll(/al- /gi, 'ال');
  txt = txt.replaceAll(/al-/gi, 'ال');

  return txt;
}

/** Early hamza-cluster rules (aʾū, uʾa, aʾ, uʾ, iʾ$, āʾa$, ʾa$, ʾa, ʾu, ʾi). */
export function applyHamzaEarly(txt: string): string {
  txt = txt.replaceAll(/aʾū/gi, 'aؤُū');
  txt = txt.replaceAll(/uʾa/gi, 'uؤَ');
  txt = txt.replaceAll(/aʾ/gi, 'aأ');
  txt = txt.replaceAll(/uʾ/gi, 'uؤْ');
  txt = txt.replaceAll(/iʾ$/gi, 'iئ');
  txt = txt.replaceAll(/āʾa$/gi, 'āءة');

  txt = txt.replaceAll(/ʾa$/gi, 'ئة');
  txt = txt.replaceAll(/ʾa/gi, 'أَ');
  txt = txt.replaceAll(/ʾu/gi, 'أُ');
  txt = txt.replaceAll(/ʾi/gi, 'ئِ');

  return txt;
}

/**
 * The irregular w/y/ī/ū "One letter" rules: glide-vowel fusions (ūwa/ūwu/ūwi)
 * and hamza+glide fusions (ʾy, ʾī, ʾū) that don't fit the clean
 * single-occurrence template, plus the four glide/long-vowel letters'
 * own single-occurrence rules (w, y, ī, ū — each ends with a
 * trailing-sukūn strip, same as the templated letters).
 */
export function applyGlideExtras(txt: string): string {
  // One letter
  txt = txt.replaceAll(/ūwa/gi, 'وَّ');
  txt = txt.replaceAll(/ūwu/gi, 'وُّ');
  txt = txt.replaceAll(/ūwi/gi, 'وِّ');

  txt = txt.replaceAll(/wā/gi, 'وَا');
  txt = txt.replaceAll(/wū/gi, 'وُو');
  txt = txt.replaceAll(/wī/gi, 'وِيْ');

  // txt = txt.replaceAll(/\bwa\b/gi, 'وَ');
  txt = txt.replaceAll(/wa$/gi, 'وَة');
  txt = txt.replaceAll(/wa/gi, 'وَ');
  txt = txt.replaceAll(/wu/gi, 'وُ');
  txt = txt.replaceAll(/wi/gi, 'وِ');
  txt = txt.replaceAll(/w/gi, 'وْ');
  txt = txt.replace(/وْ$/gi, 'و');

  txt = txt.replaceAll(/yā/gi, 'يَا');
  txt = txt.replaceAll(/yū/gi, 'يُو');
  txt = txt.replaceAll(/yī/gi, 'يِيْ');

  txt = txt.replaceAll(/ya$/gi, 'يَة');
  txt = txt.replaceAll(/ya/gi, 'يَ');
  txt = txt.replaceAll(/yu/gi, 'يُ');
  txt = txt.replaceAll(/yi/gi, 'يِ');
  txt = txt.replaceAll(/ʾy/gi, 'ئِيْ');
  txt = txt.replaceAll(/y/gi, 'يْ');
  txt = txt.replace(/يْ$/gi, 'ي');

  txt = txt.replaceAll(/īā/gi, 'يَا');
  txt = txt.replaceAll(/īū/gi, 'يُو');
  txt = txt.replaceAll(/īī/gi, 'يِيْ');

  txt = txt.replaceAll(/īa$/gi, 'يَة');
  txt = txt.replaceAll(/īa/gi, 'يَ');
  txt = txt.replaceAll(/īu/gi, 'يُ');
  txt = txt.replaceAll(/īi/gi, 'يِ');
  txt = txt.replaceAll(/ʾī/gi, 'ئِيْ');
  txt = txt.replaceAll(/ī/gi, 'يْ');
  txt = txt.replace(/يْ$/gi, 'ي');

  txt = txt.replaceAll(/ūā/gi, 'وَا');
  txt = txt.replaceAll(/ūū/gi, 'وُو');
  txt = txt.replaceAll(/ūī/gi, 'وِيْ');

  txt = txt.replaceAll(/ūa$/gi, 'وَة');
  txt = txt.replaceAll(/ūa/gi, 'وَ');
  txt = txt.replaceAll(/ūu/gi, 'وُ');
  txt = txt.replaceAll(/ūi/gi, 'وِ');
  txt = txt.replaceAll(/ʾū/gi, 'ؤُوْ');
  txt = txt.replaceAll(/ū/gi, 'وْ');
  txt = txt.replace(/وْ$/gi, 'و');

  return txt;
}

/**
 * Late hamza/vowel fallback rules — applied after every consonant+vowel
 * template has already run, so these only ever match a leading/bare vowel
 * letter that wasn't already consumed as part of a consonant cluster
 * (e.g. a name starting directly with a vowel, like "Aḥmad").
 */
export function applyHamzaLateAndVowelFallback(txt: string): string {
  //  txt = txt.replace(/([^\u0621-\u063A\u0641-\u064A\u0660-\u0669a-zA-Z 0-9])/g, '');

  // txt = txt.replaceAll(/َʾ/gi, 'ُا');
  // txt = txt.replaceAll(/ُʾ/gi, 'ُؤ');
  // txt = txt.replaceAll(/ِʾ/gi, 'ُؤ');
  // txt = txt.replaceAll(/uʾ/gi, 'uؤ');
  // txt = txt.replaceAll(/ʾā/gi, 'ا');
  // txt = txt.replaceAll(/ʾū/gi, 'ئُو');
  // txt = txt.replaceAll(/ʾī/gi, 'ئِي');
  // txt = txt.replaceAll(/ʾy/gi, 'ئِي');

  // txt = txt.replaceAll(/ʾa/gi, 'أَ');
  // txt = txt.replaceAll(/ʾu/gi, 'أُ');
  // txt = txt.replaceAll(/ʾi/gi, 'إِ');
  // txt = txt.replaceAll(/ʾā/gi, 'ا');
  txt = txt.replaceAll(/U/g, 'أُ');
  txt = txt.replaceAll(/ʾ/gi, 'ء');
  // if (txt.includes('a'))
  // console.log(txt);
  txt = txt.replaceAll(/a$/g, 'ة');

  // txt = txt.replaceAll(/a/g, '');
  // txt = txt.replaceAll(/i/g, '');
  // txt = txt.replaceAll(/u/g, '');
  // txt = txt.replaceAll(/e/g, '');

  txt = txt.replaceAll(/Ā/g, 'آ');
  txt = txt.replaceAll(/ā/g, 'ا');
  txt = txt.replaceAll(/A/gi, 'أَ');
  txt = txt.replaceAll(/I/g, 'إِ');

  txt = txt.replaceAll(/-/gi, ' ');

  return txt;
}
