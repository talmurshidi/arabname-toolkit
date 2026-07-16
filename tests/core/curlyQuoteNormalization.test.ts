import { describe, expect, it } from 'vitest';
import { generateArabicHarakat } from '../../src/core/transliteration/index.js';

/**
 * Real bibliographic sources for Latinised Arabic names (the classic
 * Brill/Encyclopaedia-of-Islam typesetting tradition, and derivative sites)
 * print ʿayn/hamza as typographic curly quotes (‘ U+2018 / ’ U+2019), not
 * the backtick/ASCII-apostrophe shortcuts this engine already accepted.
 * See fixBrillChar() in brill/helpers.ts.
 */
describe('curly-quote (typographic ʿayn/hamza) normalisation', () => {
  it('treats a left curly quote as ʿayn, matching the ASCII-backtick spelling', () => {
    expect(generateArabicHarakat('‘Alī')).toBe(generateArabicHarakat('`Alī'));
  });

  it('treats a right curly quote as hamza, matching the ASCII-apostrophe spelling', () => {
    expect(generateArabicHarakat('Ismā’īl')).toBe(generateArabicHarakat("Ismā'īl"));
  });

  it('does not leak un-transliterated Latin letters for a curly-quoted hamza mid-word', () => {
    expect(generateArabicHarakat('Ismā’il')).not.toMatch(/[a-zA-Z]/);
  });

  it('reads a left curly quote before "l-" as the elided article, not ʿayn', () => {
    expect(generateArabicHarakat('Abū ‘l-Fidā')).toBe(generateArabicHarakat('Abū al-Fidā'));
    expect(generateArabicHarakat('Abū ‘l-Qāsim')).toBe(generateArabicHarakat("Abū 'l-Qāsim"));
  });

  it('produces ʿayn for a genuine word-initial curly quote, not the elision path', () => {
    expect(generateArabicHarakat('‘Abdullāh')).toBe(generateArabicHarakat('ʿAbdullāh'));
  });
});
