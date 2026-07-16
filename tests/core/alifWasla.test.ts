import { describe, expect, it } from 'vitest';
import {
  looksFullyDiacritized,
  generateLatin,
  generateArabicHarakat
} from '../../src/core/transliteration/index.js';

/**
 * ٱ (U+0671, alif wasla) is standard orthography for the hamzat al-waṣl —
 * e.g. the Qur'anic/Classical spelling of the definite article at the start
 * of "ٱللَّٰهِ" (Allāh) or "ٱلرَّحْمَٰنِ" (al-Raḥmān). It plays exactly the same
 * structural role as plain alif (ا, U+0627) for this engine's purposes, but
 * was previously a different, unrecognised codepoint — see arabicToLatin.ts.
 */
describe('alif wasla (ٱ) — hamzat al-waṣl orthography', () => {
  const basmala = 'بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيْمِ';

  it('is recognised as fully diacritised', () => {
    expect(looksFullyDiacritized(basmala)).toBe(true);
  });

  it('reverse-converts without leaking the raw ٱ character or duplicating vowels', () => {
    const latin = generateLatin(basmala);
    expect(latin).not.toContain('ٱ');
    expect(latin).not.toMatch(/aā|uū|iī/); // no duplicated-vowel artifacts from the dagger alif
  });

  it('produces the same reverse output as the equivalent plain-alif spelling', () => {
    const withWasla = generateLatin('ٱلرَّحْمَٰنِ');
    const withPlainAlif = generateLatin('الرَّحْمَٰنِ');
    expect(withWasla).toBe(withPlainAlif);
  });

  it('round-trips: forward engine output for "al-Raḥmān" reverses back to the same Latin', () => {
    const forward = generateArabicHarakat('al-Raḥmān');
    expect(generateLatin(forward)).toBe('al-raḥmān');
  });
});
