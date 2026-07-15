import { describe, expect, it } from 'vitest';
import {
  applyIbnAlifRule,
  applyElidedArticleRule
} from '../../src/core/transliteration/orthographyNormalization.js';
import { generateArabicHarakat } from '../../src/core/transliteration/index.js';

describe('applyIbnAlifRule', () => {
  it('keeps the alif when "Ibn"/"ibn" is the first word', () => {
    expect(applyIbnAlifRule('Ibn Khaldūn')).toBe('Ibn Khaldūn');
    expect(applyIbnAlifRule('ibn Khaldūn')).toBe('ibn Khaldūn');
  });

  it('drops the alif (rewrites to "bn") when "Ibn"/"ibn" is preceded by another word', () => {
    expect(applyIbnAlifRule('Abū Marwān ibn Zuhr')).toBe('Abū Marwān bn Zuhr');
    expect(applyIbnAlifRule('Abū Marwān Ibn Zuhr')).toBe('Abū Marwān bn Zuhr');
  });

  it('handles multiple occurrences in a lineage chain — only the first stays as "Ibn"', () => {
    expect(applyIbnAlifRule('Muḥammad ibn ʿAbdallāh ibn Ibrāhīm')).toBe(
      'Muḥammad bn ʿAbdallāh bn Ibrāhīm'
    );
  });

  it('does not affect "Bint" (never takes an alif regardless of position)', () => {
    expect(applyIbnAlifRule('Bint al-Shāṭiʾ')).toBe('Bint al-Shāṭiʾ');
    expect(applyIbnAlifRule('Fāṭima bint Muḥammad')).toBe('Fāṭima bint Muḥammad');
  });

  it('produces the correct Arabic end-to-end for both positions', () => {
    // "bn" (no leading i) already produces بْن through the ordinary
    // character-level engine with no dictionary entry needed.
    expect(generateArabicHarakat('Abū Marwān ibn Zuhr')).toBe('أَبُو مَرْوَان بْن زُهْر');
    expect(generateArabicHarakat('Ibn Khaldūn')).toBe('ابْن خَلْدُون');
  });

  it('leaves an existing multi-word "Ibn" dictionary compound unaffected when name-initial', () => {
    // "Ibn Qusṭanṭīn" is itself a curated dictionary compound; it must
    // still match as a whole when it is the first word.
    expect(generateArabicHarakat('Ibn Qusṭanṭīn')).toBe('ابْنُ قُسْطَنْطِيْن');
  });
});

describe('applyElidedArticleRule', () => {
  it('normalises the elided "l-" spelling to "al-"', () => {
    expect(applyElidedArticleRule('Abū l-Qāsim')).toBe('Abū al-Qāsim');
  });

  it('normalises the elided "\'l-" (apostrophe) spelling to "al-"', () => {
    expect(applyElidedArticleRule("Abū 'l-Qāsim")).toBe('Abū al-Qāsim');
  });

  it('leaves an already-written "al-" unaffected', () => {
    expect(applyElidedArticleRule('al-Zahrāwī')).toBe('al-Zahrāwī');
    expect(applyElidedArticleRule('Bakr al-Dīn')).toBe('Bakr al-Dīn');
  });

  it('normalises a string-initial elided article too', () => {
    expect(applyElidedArticleRule('l-Dīn')).toBe('al-Dīn');
  });

  it('produces the correct Arabic end-to-end, matching the equivalent written-out "al-" form', () => {
    const elided = generateArabicHarakat('Abū l-Qāsim Ḫalaf al-Zahrāwī');
    const written = generateArabicHarakat('Abū al-Qāsim Ḫalaf al-Zahrāwī');
    expect(elided).toBe(written);
  });

  it('also works with the apostrophe-elided spelling end-to-end', () => {
    expect(generateArabicHarakat("Abū 'l-Qāsim Ḫalaf al-Zahrāwī")).toBe(
      generateArabicHarakat('Abū al-Qāsim Ḫalaf al-Zahrāwī')
    );
  });
});
