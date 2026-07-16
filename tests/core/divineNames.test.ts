import { describe, expect, it } from 'vitest';
import { generateArabicHarakat } from '../../src/core/transliteration/index.js';
import { TRANSLITERATION_DICTIONARY } from '../../src/core/transliteration/dictionary.js';
import { transliterationToArabicHarakat } from '../../src/core/transliteration/legacyEngine.mjs';

/**
 * "Allāh"/"al-Raḥmān"/"al-Raḥīm" use the traditional Qur'anic/Classical
 * orthography (alif wasla ٱ, and — for the first two, which omit a written
 * root alif — dagger alif ٰ) rather than plain alif. Every expected value
 * below is derived programmatically from the Q1:1 Basmala string (not
 * hand-typed), per this repo's rule about Arabic combining-mark
 * transcription risk (see CLAUDE.md "Required test coverage").
 */
const BASMALA_UTHMANI = 'بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';
const [, ALLAHI, RAHMANI, RAHIMI] = BASMALA_UTHMANI.split(' ');

const CASE_VOWELS = new Set(['ً', 'ٌ', 'ٍ', 'َ', 'ُ', 'ِ']);
function withCaseEnding(word: string, ending: string): string {
  const chars = Array.from(word);
  const last = chars[chars.length - 1];
  if (last !== undefined && CASE_VOWELS.has(last)) chars.pop();
  return chars.join('') + ending;
}

function withMedialYaSukun(word: string): string {
  const chars = Array.from(word);
  const out: string[] = [];
  for (let i = 0; i < chars.length; i++) {
    out.push(chars[i] ?? '');
    if (chars[i] === 'ي' && chars[i + 1] !== undefined && chars[i + 1] !== 'ْ') {
      out.push('ْ');
    }
  }
  return out.join('');
}

describe("divine names — Allāh / al-Raḥmān / al-Raḥīm (Qur'anic orthography)", () => {
  it('the Basmala (Bismi al-lāhi al-raḥmāni al-raḥīmi) reproduces the exact Uthmani Mushaf spelling', () => {
    expect(generateArabicHarakat('Bismi al-lāhi al-raḥmāni al-raḥīmi')).toBe(BASMALA_UTHMANI);
  });

  it('the common non-hyphenated spelling of the Basmala produces the same result', () => {
    expect(generateArabicHarakat('Bismi Allāhi al-Raḥmāni al-Raḥīmi')).toBe(BASMALA_UTHMANI);
  });

  it.each([
    ['Allāh', withCaseEnding(ALLAHI ?? '', '')],
    ['Allāhu', withCaseEnding(ALLAHI ?? '', 'ُ')],
    ['Allāhi', ALLAHI],
    ['Allāha', withCaseEnding(ALLAHI ?? '', 'َ')],
    ['al-lāh', withCaseEnding(ALLAHI ?? '', '')],
    ['al-lāhu', withCaseEnding(ALLAHI ?? '', 'ُ')],
    ['al-lāhi', ALLAHI],
    ['al-lāha', withCaseEnding(ALLAHI ?? '', 'َ')]
  ])('"%s" produces the expected Qur\'anic spelling of Allāh', (latin, expected) => {
    expect(generateArabicHarakat(latin)).toBe(expected);
    expect(TRANSLITERATION_DICTIONARY[latin]).toBe(expected);
  });

  it.each([
    ['al-Raḥmān', withCaseEnding(RAHMANI ?? '', '')],
    ['al-Raḥmānu', withCaseEnding(RAHMANI ?? '', 'ُ')],
    ['al-Raḥmāni', RAHMANI],
    ['al-Raḥmāna', withCaseEnding(RAHMANI ?? '', 'َ')]
  ])('"%s" produces the expected Qur\'anic spelling of al-Raḥmān', (latin, expected) => {
    expect(generateArabicHarakat(latin)).toBe(expected);
    expect(TRANSLITERATION_DICTIONARY[latin]).toBe(expected);
  });

  // al-Raḥīm has no omitted root alif, so it needs only the alif-wasla fix,
  // not a dagger alif — but standalone (outside the exact Basmala quote)
  // it keeps this dictionary's own yā-sukūn house style on its medial ي,
  // matching every other "-īm"/"-īd"/etc. entry already in this file.
  it.each([
    ['al-Raḥīm', withMedialYaSukun(withCaseEnding(RAHIMI ?? '', ''))],
    ['al-Raḥīmu', withMedialYaSukun(withCaseEnding(RAHIMI ?? '', 'ُ'))],
    ['al-Raḥīmi', withMedialYaSukun(RAHIMI ?? '')],
    ['al-Raḥīma', withMedialYaSukun(withCaseEnding(RAHIMI ?? '', 'َ'))]
  ])('"%s" produces the expected Qur\'anic spelling of al-Raḥīm', (latin, expected) => {
    expect(generateArabicHarakat(latin)).toBe(expected);
    expect(TRANSLITERATION_DICTIONARY[latin]).toBe(expected);
  });

  it("existing compound names containing Allāh/al-Raḥmān/al-Raḥīm use the same Qur'anic spelling", () => {
    expect(generateArabicHarakat('ʿAbdallāh')).toBe(`عَبْدُ ${ALLAHI}`);
    expect(generateArabicHarakat('ʿAbdullāh')).toBe(`عَبْدُ ${ALLAHI}`);
    expect(generateArabicHarakat('HibatallĀh')).toBe(`هِبَةُ ${ALLAHI}`);
    expect(generateArabicHarakat('ʿAṭāʾ Allāh')).toBe(`عَطَاء ${withCaseEnding(ALLAHI ?? '', '')}`);
    expect(generateArabicHarakat('ʿAbd al-Raḥmān')).toBe(
      `عَبْدُ ${withCaseEnding(RAHMANI ?? '', '')}`
    );
    expect(generateArabicHarakat('Abū ʿAbd al-Raḥmān')).toBe(
      `أَبُو عَبْدِ ${withCaseEnding(RAHMANI ?? '', '')}`
    );
    expect(generateArabicHarakat('ʿAbd al-Raḥīm')).toBe(
      `عَبْدُ ${withMedialYaSukun(withCaseEnding(RAHIMI ?? '', ''))}`
    );
  });

  it('fallback to the legacy engine still works for a name not in the dictionary', () => {
    const notInDictionary = 'Zzqqjjxyz';
    expect(TRANSLITERATION_DICTIONARY[notInDictionary]).toBeUndefined();
    const expected = String(transliterationToArabicHarakat(notInDictionary) ?? '').trim();
    expect(generateArabicHarakat(notInDictionary)).toBe(expected);
  });
});
