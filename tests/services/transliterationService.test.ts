import { describe, expect, it } from 'vitest';
import { TransliterationService } from '../../src/services/TransliterationService.js';
import { generateArabicHarakat } from '../../src/core/transliteration/index.js';

describe('TransliterationService.convert', () => {
  const service = new TransliterationService();

  it('converts Brill-scheme input and reports scheme: "brill"', () => {
    const result = service.convert({ text: 'Jamal al-Din', scheme: 'brill' });
    expect(result.scheme).toBe('brill');
    expect(result.input).toBe('Jamal al-Din');
    expect(result.brillLatin).toBe('Jamal al-Din');
    expect(result.arabicHarakat.length).toBeGreaterThan(0);
  });

  it('converts DIN 31635-scheme input by normalising to Brill before running the pipeline', () => {
    const result = service.convert({ text: 'Ǧamāl al-Dīn', scheme: 'din31635' });
    expect(result.scheme).toBe('din31635');
    // The raw DIN input is preserved in `input`, but `brillLatin` is the
    // normalised Brill spelling used for the actual conversion.
    expect(result.input).toBe('Ǧamāl al-Dīn');
    expect(result.brillLatin).toBe('Jamāl al-Dīn');
  });

  it('produces IDENTICAL Arabic output for equivalent Brill and DIN 31635 input', () => {
    const brill = service.convert({ text: 'Sharif', scheme: 'brill' });
    const din = service.convert({ text: 'Šarif', scheme: 'din31635' });
    expect(din.arabicHarakat).toBe(brill.arabicHarakat);
    expect(din.arabic).toBe(brill.arabic);
  });

  it('always populates both brillLatin and dinLatin, regardless of input scheme', () => {
    const brill = service.convert({ text: 'Sharif', scheme: 'brill' });
    expect(brill.brillLatin).toBe('Sharif');
    expect(brill.dinLatin).toBe('Šarif');

    const din = service.convert({ text: 'Šarif', scheme: 'din31635' });
    expect(din.brillLatin).toBe('Sharif');
    expect(din.dinLatin).toBe('Šarif');
  });

  it('throws on empty input regardless of scheme', () => {
    expect(() => service.convert({ text: '  ', scheme: 'brill' })).toThrow();
    expect(() => service.convert({ text: '  ', scheme: 'din31635' })).toThrow();
  });
});

describe('TransliterationService.convertReverse', () => {
  const service = new TransliterationService();

  it('returns a full ConversionOutput-shaped result (direction: arabic-to-latin)', () => {
    const result = service.convertReverse('مُحَمَّدْ');
    expect(result.direction).toBe('arabic-to-latin');
    expect(result.input).toBe('مُحَمَّدْ');
    expect(result.arabicHarakat).toBe('مُحَمَّدْ');
    expect(result.brillLatin).toBe('muḥammad');
    expect(result.dinLatin).toBe('muḥammad'); // no DIN-specific letters in this word
    expect(result.normalizedName).toBe(result.brillLatin);
    expect(result.nameOrder.length).toBeGreaterThan(0);
  });

  it('defaults to "brill" as the preferred/primary scheme, and accepts an explicit preference', () => {
    expect(service.convertReverse('مُحَمَّدْ').scheme).toBe('brill');
    expect(service.convertReverse('مُحَمَّدْ', 'din31635').scheme).toBe('din31635');
  });

  it('brillLatin and dinLatin differ when the word contains a DIN-distinctive letter', () => {
    const result = service.convertReverse('مُشَرَّفْ');
    expect(result.brillLatin).toBe('musharraf');
    expect(result.dinLatin).toBe('mušarraf');
  });

  it('converts بْن/ابْن to "ibn" (irregular whole-word reversal), not the literal "bn"', () => {
    const medialArabic = generateArabicHarakat('Marwān bn Zuhr');
    const medial = service.convertReverse(medialArabic);
    expect(medial.brillLatin).toBe('marwān ibn zuhr');

    const initialArabic = generateArabicHarakat('Ibn Khaldūn');
    const initial = service.convertReverse(initialArabic);
    expect(initial.brillLatin).toBe('ibn khaldūn');
  });

  it('throws NOT_FULLY_DIACRITIZED for undiacritised Arabic', () => {
    expect(() => service.convertReverse('محمد')).toThrow('NOT_FULLY_DIACRITIZED');
  });

  it('throws on empty input', () => {
    expect(() => service.convertReverse('  ')).toThrow();
  });
});
