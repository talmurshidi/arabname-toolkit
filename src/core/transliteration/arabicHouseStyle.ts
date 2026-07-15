const KASRA = 'ِ';
const YA = 'ي';
const SUKUN = 'ْ';

// Arabic combining diacritics (U+064B–U+0652: tanwīn fatḥ/ḍamm/kasr, fatḥa,
// ḍamma, kasra, shadda, sukūn). Any of these directly after a ي means that ي
// is a consonant carrying its own vowel (e.g. the "-iyā-"/"-iyyā-" glide in
// Ziyād or Zakariyyā), not a long-vowel marker — so it's excluded from this
// rule entirely, not just the shadda case.
const DIACRITICS = new Set(['ً', 'ٌ', 'ٍ', 'َ', 'ُ', 'ِ', 'ّ', 'ْ']);

/**
 * Enforces the yā-sukūn house style on already-transliterated Arabic text:
 * a long ī (ي preceded by kasra, not part of an ay diphthong, and not
 * itself followed by another vowel mark — i.e. not a consonantal ي) gets a
 * sukūn on the ي unless it is the final letter of the word. Long ū (و) is
 * deliberately left untouched — this project's convention never marks medial
 * long-ū with a sukūn. Alif never takes any harakat and is untouched by
 * construction (this function never inserts anything on ا).
 */
export function applyYaSukunHouseStyle(arabicText: string): string {
  if (!arabicText) return arabicText;

  return arabicText
    .split(/(\s+)/)
    .map((part) => (part.trim() ? applyToWord(part) : part))
    .join('');
}

function applyToWord(word: string): string {
  const chars = Array.from(word);
  const result: string[] = [];

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    result.push(ch ?? '');

    if (ch !== YA || i === 0 || chars[i - 1] !== KASRA) continue;

    const isFinal = i === chars.length - 1;
    if (isFinal) {
      continue;
    }

    const next = chars[i + 1];
    if (next === SUKUN) continue;
    if (next !== undefined && DIACRITICS.has(next)) continue;

    result.push(SUKUN);
  }

  return result.join('');
}
