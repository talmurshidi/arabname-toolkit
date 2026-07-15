import { describe, expect, it } from 'vitest';
import { TRANSLITERATION_CORRECTIONS } from '../../src/core/transliteration/corrections.js';
import { generateArabicHarakat } from '../../src/core/transliteration/index.js';

describe('TRANSLITERATION_CORRECTIONS', () => {
  it('every key is a non-empty string', () => {
    for (const key of Object.keys(TRANSLITERATION_CORRECTIONS)) {
      expect(key.length).toBeGreaterThan(0);
    }
  });

  it('every value is a non-empty Arabic string', () => {
    for (const value of Object.values(TRANSLITERATION_CORRECTIONS)) {
      expect(value.length).toBeGreaterThan(0);
      // Must contain at least one Arabic character
      expect(/[\u0600-\u06FF]/.test(value)).toBe(true);
    }
  });

  it('corrections are applied verbatim to known-degraded inputs', () => {
    for (const [key, expected] of Object.entries(TRANSLITERATION_CORRECTIONS)) {
      expect(generateArabicHarakat(key)).toBe(expected);
    }
  });

  it('correction takes precedence over dictionary and legacy engine', () => {
    // "Abu Tayyib al-Lughawi" is the specific known-degraded case.
    // The legacy engine would produce a different (incorrect) result.
    const corrected = generateArabicHarakat('Abu Tayyib al-Lughawi');
    expect(corrected).toBe('أَبُو الطَّيِّب اللُّغَوِي');
  });
});
