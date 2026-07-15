import { describe, expect, it } from 'vitest';
import {
  dinToBrill,
  brillToDin,
  containsDin31635Chars
} from '../../src/core/transliteration/din31635.js';
import { generateArabicHarakat } from '../../src/core/transliteration/index.js';

describe('dinToBrill: single DIN 31635 letters -> Brill digraphs', () => {
  const cases: Array<[string, string]> = [
    ['ǧamāl', 'jamāl'],
    ['Ǧamāl', 'Jamāl'],
    ['šarīf', 'sharīf'],
    ['Šarīf', 'Sharīf'],
    ['ġassān', 'ghassān'],
    ['Ġassān', 'Ghassān'],
    ['ḏahabī', 'dhahabī'],
    ['Ḏahabī', 'Dhahabī'],
    ['ṯawrī', 'thawrī'],
    ['Ṯawrī', 'Thawrī'],
    ['ẖālid', 'khālid'],
    ['H\u0331ālid', 'Khālid'] // capital ẖ has no precomposed Unicode form — DIN renders it as H + combining macron below
  ];

  it.each(cases)('%s -> %s', (din, expectedBrill) => {
    expect(dinToBrill(din)).toBe(expectedBrill);
  });

  it('converts the tāʾ marbūṭa marker ẗ to the Brill bare "a"', () => {
    expect(dinToBrill('Fāṭimẗ')).toBe('Fāṭima');
  });

  it('leaves Brill-only / shared text (no DIN-specific letters) unchanged', () => {
    const shared = 'Muḥammad ibn ʿAbdallāh al-Ṣāliḥ';
    expect(dinToBrill(shared)).toBe(shared);
  });
});

describe('dinToBrill feeds correctly into the real transliteration engine', () => {
  // Each pair must produce IDENTICAL Arabic output — that is the whole
  // point of the conversion layer: DIN and Brill spellings of the same name
  // must converge on the same Arabic script.
  const cases: Array<[string, string]> = [
    ['Ǧamāl', 'Jamāl'],
    ['Šarīf', 'Sharīf'],
    ['Ġassān', 'Ghassān'],
    ['Ḏahabī', 'Dhahabī'],
    ['Ṯawrī', 'Thawrī'],
    ['H\u0331ālid', 'Khālid'],
    ['al-Ǧāmiʿ', 'al-Jāmiʿ'],
    ['Fāṭimẗ', 'Fāṭima'] // ẗ -> Brill bare "a"; compared against the true equivalent spelling (macron ā, underdot ṭ), not the unrelated plain spelling "Fatima"
  ];

  it.each(cases)('DIN "%s" produces the same Arabic as Brill "%s"', (din, brill) => {
    expect(generateArabicHarakat(dinToBrill(din))).toBe(generateArabicHarakat(brill));
  });

  it('a specific known DIN input converts to the expected Arabic', () => {
    // Compared dynamically against the equivalent Brill spelling rather
    // than a hand-typed Arabic literal, to avoid transcription slips in
    // combining-mark order.
    expect(generateArabicHarakat(dinToBrill('Ǧamāl al-Dīn'))).toBe(
      generateArabicHarakat('Jamāl al-Dīn')
    );
  });

  it('doubled DIN letters (gemination) convert correctly via the Brill digraph doubling that already works', () => {
    // Verified against the engine directly: "Hajjaj" (doubled j) produces a
    // shadda-geminated jīm, and doubled digraphs like "shsh"/"khkh" already
    // produce shadda too (see transliteration.test.ts). DIN's doubled
    // ǧǧ/šš map onto the same mechanism once converted to doubled Brill
    // digraphs.
    expect(generateArabicHarakat(dinToBrill('Haǧǧaǧ'))).toBe(generateArabicHarakat('Hajjaj'));
    expect(generateArabicHarakat(dinToBrill('Mušaššaf'))).toBe(
      generateArabicHarakat('Mushashshaf')
    );
  });
});

describe('brillToDin: Brill digraphs -> DIN 31635 single letters', () => {
  const cases: Array<[string, string]> = [
    ['Jamal', 'Ǧamal'],
    ['Sharif', 'Šarif'],
    ['Ghassan', 'Ġassan'],
    ['Dhahabi', 'Ḏahabi'],
    ['Thawri', 'Ṯawri'],
    ['Khalid', 'H\u0331alid'],
    ['Djamal', 'Ǧamal'] // "dj" (EI2-style j spelling) is also folded into DIN's ǧ
  ];

  it.each(cases)('%s -> %s', (brill, expectedDin) => {
    expect(brillToDin(brill)).toBe(expectedDin);
  });

  it('converts a word-final bare "a" (tāʾ marbūṭa, per this project\'s Brill convention) to ẗ', () => {
    expect(brillToDin('Fatima')).toBe('Fatimẗ');
  });

  it('converts tāʾ marbūṭa correctly mid-phrase, not just at the end of the whole string', () => {
    expect(brillToDin('Fatima bint Ali')).toBe('Fatimẗ bint Ali');
    expect(brillToDin('Khadija al-Kubra')).toBe('H\u0331adiǧẗ al-Kubrẗ');
  });

  it('does not touch the macron ā (a distinct Unicode character from bare "a")', () => {
    expect(brillToDin('Bakr Muḥammad Bā')).toBe('Bakr Muḥammad Bā');
  });
});

describe('DIN <-> Brill round-trip', () => {
  const brillSamples = [
    'Jamal',
    'Sharif',
    'Ghassan',
    'Dhahabi',
    'Thawri',
    'Khalid',
    'Fatima',
    'Khadija al-Kubra',
    'Muhammad ibn Abdallah'
  ];

  it.each(brillSamples)('brillToDin then dinToBrill round-trips "%s"', (brill) => {
    expect(dinToBrill(brillToDin(brill))).toBe(brill);
  });
});

describe('containsDin31635Chars', () => {
  it('detects each of the seven DIN-specific letters', () => {
    for (const w of ['ǧamal', 'šarif', 'ġassan', 'ḏahabi', 'ṯawri', 'ẖalid', 'fatimẗ']) {
      expect(containsDin31635Chars(w)).toBe(true);
    }
  });

  it('returns false for plain Brill / shared-character text', () => {
    expect(containsDin31635Chars('Muḥammad ibn ʿAbdallāh al-Ṣāliḥ')).toBe(false);
  });
});
