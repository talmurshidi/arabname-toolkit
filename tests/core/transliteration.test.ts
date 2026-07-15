import { describe, expect, it } from 'vitest';
import {
  createNameOrder,
  generateArabic,
  generateArabicHarakat,
  generateTransliteration,
  normalizeTransliteratedName
} from '../../src/core/transliteration/index.js';
import { TRANSLITERATION_DICTIONARY } from '../../src/core/transliteration/dictionary.js';
import { transliterationToArabicHarakat } from '../../src/core/transliteration/legacyEngine.mjs';

describe('normalisation and ordering', () => {
  it('normalises trailing al- and creates an ASCII ordering key', () => {
    expect(normalizeTransliteratedName('Baghdādī, al-')).toBe('Al-Baghdādī');
    expect(createNameOrder('Ṣalāḥ al-Dīn')).toBe('Salah al-Din');
  });
});

describe('core generation', () => {
  it('generates Arabic and vocalized Arabic deterministically', () => {
    expect(generateArabic('Abū Bakr')).toContain('أ');
    expect(generateArabicHarakat('Abū Bakr').length).toBeGreaterThan(3);
    const generated = generateTransliteration('Baghdādī, al-');
    expect(generated.normalizedName).toBe('Al-Baghdādī');
    expect(generated.nameOrder).toBe('Al-Baghdadi');
    expect(generated.arabic.length).toBeGreaterThan(0);
    expect(generated.arabicHarakat.length).toBeGreaterThan(0);
  });
});

describe('dictionary-backed fast path', () => {
  it('prefers the longest dictionary match over a shorter prefix', () => {
    expect(generateArabicHarakat('Abū Ḥanīfa')).toBe(TRANSLITERATION_DICTIONARY['Abū Ḥanīfa']);
  });

  it('matches al- prefixed dictionary entries exactly', () => {
    const samples = ['al-Ṭabarī', 'al-Shāfiʿī', 'al-Bukhārī', 'al-Tirmidhī', 'al-Baghdādī'];
    for (const key of samples) {
      expect(TRANSLITERATION_DICTIONARY[key], `Dictionary missing key: ${key}`).toBeDefined();
      expect(generateArabicHarakat(key)).toBe(TRANSLITERATION_DICTIONARY[key]);
    }
  });

  it('falls back to the legacy engine for names not in the dictionary', () => {
    const notInDictionary = 'Zzqqjjxyz';
    expect(TRANSLITERATION_DICTIONARY[notInDictionary]).toBeUndefined();
    const expected = String(transliterationToArabicHarakat(notInDictionary) ?? '').trim();
    expect(generateArabicHarakat(notInDictionary)).toBe(expected);
  });

  it('correctly orders a mixed dictionary-hit plus fallback compound', () => {
    const input = 'Abū Ḥanīfa Zzqqjjxyz';
    const result = generateArabicHarakat(input);
    const expectedFallback = String(transliterationToArabicHarakat('Zzqqjjxyz') ?? '').trim();
    expect(result).toBe(`${TRANSLITERATION_DICTIONARY['Abū Ḥanīfa']} ${expectedFallback}`);
  });

  it('transliterates 1200 names well under 500 ms', () => {
    const names = Array.from({ length: 1200 }, (_, i) =>
      i % 2 === 0 ? 'Abū Ḥanīfa' : `Zzqqjjxyz${i}`
    );
    const start = performance.now();
    for (const name of names) generateArabicHarakat(name);
    expect(performance.now() - start).toBeLessThan(500);
  });
});

describe('project owner confirmed regression cases', () => {
  it('ʿAlī has no shadda on the final long-ī', () => {
    expect(generateArabicHarakat('ʿAlī')).toBe('عَلِي');
    expect(generateArabicHarakat('ʿAlī')).not.toBe('عَلِيّ');
  });

  it("Ibn matches the legacy engine's own hardcoded sukūn form", () => {
    expect(generateArabicHarakat('Ibn')).toBe('ابْن');
  });

  it('Zajjaj recovers the long ā missing from the degraded Latin spelling', () => {
    expect(generateArabicHarakat('Zajjaj')).toBe('زَجَّاج');
  });

  it('preserves well-formed parentheses and "?" through a full phrase', () => {
    expect(generateArabicHarakat('Faʿalt wa-afaʿalt (Zajjaj?)')).toBe(
      'فَعَلْت وَ أَفَعَلْت (زَجَّاج?)'
    );
  });

  it('preserves parentheses, expands "b.", and uses the decorative ʿAmr wāw', () => {
    expect(generateArabicHarakat('Ḥurūf (Abu ʿAmr b. al-ʿAlaʾ)')).toBe(
      'حُرُوف (أَبُو عَمْرو بِن العَلَأ)'
    );
  });

  it('ʿAmr renders with the decorative silent wāw distinguishing it from ʿUmar', () => {
    expect(TRANSLITERATION_DICTIONARY['ʿAmr']).toBe('عَمْرو');
    expect(generateArabicHarakat('ʿUmar')).not.toBe(generateArabicHarakat('ʿAmr'));
  });

  it('generateArabic keeps well-formed parentheses', () => {
    expect(generateArabic('Al-Wuḥūsh (al-Karnabāʾī)')).toBe('الوحوش (الكرنبائي)');
  });
});

describe('sourced-correction layer', () => {
  it('corrects a known-degraded stored string via TRANSLITERATION_CORRECTIONS', () => {
    expect(generateArabicHarakat('Abu Tayyib al-Lughawi')).toBe('أَبُو الطَّيِّب اللُّغَوِي');
  });
});

describe('Brill standard: sun-letter assimilation (docs/METHODOLOGY.md)', () => {
  // All fourteen Arabic "sun letters" assimilate the ال of the definite
  // article into a shadda on the following consonant. Verified against the
  // Brill/EI3 table cited in docs/METHODOLOGY.md — every one of these must
  // surface a shadda (ّ) on the letter immediately after ال, never a lām.
  const sunLetterCases: Array<[string, string]> = [
    ['al-Tirmidhī', 'ت'],
    ['al-Thawrī', 'ث'],
    ['al-Dāraquṭnī', 'د'],
    ['al-Dhahabī', 'ذ'],
    ['al-Rāzī', 'ر'],
    ['al-Zamakhsharī', 'ز'],
    ['al-Sakhāwī', 'س'],
    ['al-Shāfiʿī', 'ش'],
    ['al-Ṣāliḥ', 'ص'],
    ['al-Ḍarīr', 'ض'],
    ['al-Ṭabarī', 'ط'],
    ['al-Ẓāhirī', 'ظ'],
    ['al-Laythī', 'ل'],
    ['al-Nawawī', 'ن']
  ];

  it.each(sunLetterCases)('assimilates ال before the sun letter in %s', (input, sunLetter) => {
    const result = generateArabicHarakat(input);
    // The output must contain the sun letter immediately followed by a
    // shadda, and must NOT render a separate lām consonant for the article.
    expect(result).toMatch(new RegExp(`${sunLetter}[\u064B-\u0652]*ّ`));
  });

  it('does NOT assimilate before a moon letter (e.g. al-Qāhira keeps a lām)', () => {
    // ق is a moon letter — the lām of the article is pronounced, not
    // assimilated, and the output must contain a lām consonant.
    expect(generateArabicHarakat('al-Qāhira')).toContain('ل');
  });
});

describe('Brill standard: verified character alternates', () => {
  it('accepts kh and ḫ interchangeably for خ', () => {
    expect(generateArabicHarakat('Khālid')).toBe(generateArabicHarakat('Ḫālid'));
  });

  it('normalises the backtick shortcut to ʿayn (ʿ)', () => {
    expect(generateArabicHarakat('`Umar')).toBe(generateArabicHarakat('ʿUmar'));
  });

  it('normalises the ASCII apostrophe shortcut to hamza (ʾ)', () => {
    expect(generateArabicHarakat("Sa'id")).toBe(generateArabicHarakat('Saʾid'));
  });
});

describe('DIN 31635 input is out of scope (characterisation tests — see docs/METHODOLOGY.md "Known limitations")', () => {
  // ǧ, š, ġ, ḏ, ṯ, ẖ, ẗ are not Brill — they are DIN 31635 (the German
  // Oriental Society standard, e.g. Brockelmann's GAL), a distinct citable
  // system this engine does not target. These tests lock in CURRENT
  // behaviour so the distinction stays documented and testable, per
  // ADR-003 (do not "clean up" legacyEngine.mjs rules without a linguistic
  // review). Do not delete these without updating docs/METHODOLOGY.md.

  it('a single (non-doubled) "dj" for ج is not equivalent to "j" — it renders د + ج, not ج', () => {
    // Brill's own EI2-style digraph is "dj", but only the *doubled* form
    // "djdj" (representing a geminated ج) has a dedicated rule; a lone
    // "dj" falls through as separate d + j letters. Use plain "j".
    expect(generateArabicHarakat('Djamāl')).not.toBe(generateArabicHarakat('Jamāl'));
    expect(generateArabicHarakat('Djamāl')).toContain('د');
  });

  it('DIN 31635 ǧ/š/ġ are not recognised as single characters — only their doubled forms have (incidental) rules', () => {
    // legacyEngine.mjs has leftover rules for ǧǧ/šš/ġġ (doubled-consonant/
    // shadda contexts) but nothing for the single letter, so these DIN
    // 31635 forms do not convert as a researcher coming from German-language
    // scholarship (Brockelmann, GAL) might expect. Use the Brill digraphs
    // j/sh/gh instead — see the DIN 31635 conversion note in the docs.
    expect(generateArabicHarakat('Ǧamāl')).not.toBe(generateArabicHarakat('Jamāl'));
    expect(generateArabicHarakat('Šarīf')).not.toBe(generateArabicHarakat('Sharīf'));
    expect(generateArabicHarakat('Ġassān')).not.toBe(generateArabicHarakat('Ghassān'));
  });

  it('DIN 31635 ḏ/ṯ/ẖ/ẗ have no rules at all, not even doubled — they pass through unconverted', () => {
    expect(generateArabicHarakat('Ḏahabī')).toContain('Ḏ');
    expect(generateArabicHarakat('Ṯawrī')).toContain('Ṯ');
    expect(generateArabicHarakat('Madrasaẗ')).toContain('ẗ');
  });
});
