import { describe, expect, it } from 'vitest';
import {
  generateArabicHarakat,
  generateTransliteration
} from '../../src/core/transliteration/index.js';
import { TRANSLITERATION_DICTIONARY } from '../../src/core/transliteration/dictionary.js';
import { transliterationToArabicHarakat } from '../../src/core/transliteration/legacyEngine.mjs';

/**
 * Bare-ASCII aliases added because real-world bibliographic sources very
 * often drop macrons/underdots on extremely common given names while
 * keeping them on rarer ones (see docs/METHODOLOGY.md, "Known limitations"
 * #2). Each bare key below must resolve to the *exact same* Arabic value as
 * this dictionary's existing, correctly-diacritized entry for that name —
 * this table is the single source of truth for that pairing so the test
 * can't drift from the dictionary silently.
 */
const ALIAS_PAIRS: Array<[bare: string, diacritized: string]> = [
  ['Muhammad', 'Muḥammad'],
  ['Ahmad', 'Aḥmad'],
  ['Ahmed', 'Aḥmad'],
  ['Hasan', 'Ḥasan'],
  ['Hassan', 'Ḥasan'],
  ['Husayn', 'Ḥusayn'],
  ['Hussein', 'Ḥusayn'],
  ['Husain', 'Ḥusayn'],
  ['Ibrahim', 'Ibrāhīm'],
  ['Yahya', 'Yaḥyā'],
  ['Uthman', 'ʿUthmān'],
  ['Usman', 'ʿUthmān'],
  ['Othman', 'ʿUthmān'],
  ['Jafar', 'Jaʿfar'],
  ['Zakariya', 'Zakariyyā'],
  ['Zakariyya', 'Zakariyyā'],
  ['Rashid', 'Rashīd'],
  ['Harun', 'Hārūn'],
  ['Haroun', 'Hārūn'],
  ['Ishaq', 'Isḥāq'],
  ['Umar', 'ʿUmar'],
  ['Omar', 'ʿUmar'],
  ['Yusuf', 'Yūsuf'],
  ['Musa', 'Mūsā'],
  ['Sulayman', 'Sulaymān'],
  ['Suleiman', 'Sulaymān'],
  ['Ismail', 'Ismāʿīl'],
  ['Ismael', 'Ismāʿīl'],
  ['Khalid', 'Khālid'],
  ['Marwan', 'Marwān'],
  ['Habib', 'Ḥabīb'],
  ['Aziz', 'ʿAzīz'],
  ['Hamid', 'Ḥamīd'],
  ['Tahir', 'Ṭāhir'],
  ['Mahmud', 'Maḥmūd'],
  ['Mahmoud', 'Maḥmūd'],
  ['Mahmūd', 'Maḥmūd'],
  ['Tufayl', 'Ṭufayl'],
  ['ʿAbdullāh', 'ʿAbdallāh'],
  ['Fath', 'Fatḥ'],
  ['Hāmed', 'Ḥāmid'],
  ['Ismāʾil', 'Ismāʿīl'],
  ['Jaʾfar', 'Jaʿfar'],
  ['Yaʾqūb', 'Yaʿqūb']
];

describe('bare-ASCII common-name dictionary aliases', () => {
  it.each(ALIAS_PAIRS)('"%s" produces the exact same Arabic as "%s"', (bare, diacritized) => {
    expect(
      TRANSLITERATION_DICTIONARY[diacritized],
      `dictionary is missing "${diacritized}"`
    ).toBeDefined();
    expect(generateArabicHarakat(bare)).toBe(generateArabicHarakat(diacritized));
    expect(generateArabicHarakat(bare)).toBe(TRANSLITERATION_DICTIONARY[diacritized]);
  });

  it('every alias pair is actually present in the dictionary (not just falling through to an equal fallback result)', () => {
    for (const [bare] of ALIAS_PAIRS) {
      expect(
        TRANSLITERATION_DICTIONARY[bare],
        `dictionary is missing bare alias "${bare}"`
      ).toBeDefined();
    }
  });

  it('spot-checks one exact expected value so a future edit to the source entry is caught', () => {
    expect(generateArabicHarakat('Muhammad')).toBe('مُحَمَّد');
  });

  it('"Fath" without the alias would be misread ("th" as a single ث digraph) — the alias fixes that', () => {
    expect(generateArabicHarakat('Fath')).toBe('فَتْح');
    expect(generateArabicHarakat('Fath')).not.toContain('ث');
  });

  it('fallback to the legacy engine still works for a name not in the dictionary', () => {
    const notInDictionary = 'Zzqqjjxyz';
    expect(TRANSLITERATION_DICTIONARY[notInDictionary]).toBeUndefined();
    const expected = String(transliterationToArabicHarakat(notInDictionary) ?? '').trim();
    expect(generateArabicHarakat(notInDictionary)).toBe(expected);
  });

  it('resolves aliases correctly inside a full multi-word name, not just standalone', () => {
    const result = generateTransliteration('Abū Bakr Muhammad Ibn Tufayl al-Qaysī');
    expect(result.arabicHarakat).toContain(TRANSLITERATION_DICTIONARY['Muḥammad']);
    expect(result.arabicHarakat).toContain(TRANSLITERATION_DICTIONARY['Ṭufayl']);
    expect(result.arabicHarakat).not.toMatch(/[a-zA-Z]/);
  });
});

/**
 * A distinct ʿayn/hamza ambiguity from the curly-quote fix: real sources
 * typeset a word-medial apostrophe as a right curly quote (’) purely by
 * *position in the word* (ordinary "smart quote" auto-correction — start of
 * word gets the left/opening quote, elsewhere the right/closing quote),
 * regardless of whether the intended Arabic letter is hamza or ʿayn. After
 * the right curly quote normalises to ʾ (hamza), a genuinely-ʿayn word like
 * "Ismāʿīl" (source-spelled "Ismā’il") looks like it has a hamza it doesn't.
 */
describe('word-medial curly-quote ʿayn/hamza aliases', () => {
  it('"Ismāʾil" (curly-quote spelling) resolves to the correct ʿayn-spelled "Ismāʿīl"', () => {
    expect(generateArabicHarakat('Ismāʾil')).toBe(generateArabicHarakat('Ismāʿīl'));
  });

  it('"Jaʾfar" and "Yaʾqūb" resolve to their correct ʿayn-spelled dictionary entries', () => {
    expect(generateArabicHarakat('Jaʾfar')).toBe(generateArabicHarakat('Jaʿfar'));
    expect(generateArabicHarakat('Yaʾqūb')).toBe(generateArabicHarakat('Yaʿqūb'));
  });

  it('"Maʾshar" resolves to the same engine-derived output as "Maʿshar" (no dictionary entry for either)', () => {
    expect(TRANSLITERATION_DICTIONARY['Maʿshar']).toBeUndefined();
    expect(generateArabicHarakat('Maʾshar')).toBe(generateArabicHarakat('Maʿshar'));
    expect(generateArabicHarakat('Maʾshar')).toBe('مَعْشَر');
  });
});

/**
 * "Nasr" (bare, no underdot) previously mapped to نَسْر — a distinct word,
 * the pre-Islamic idol name from the root ن-س-ر mentioned at Q71:23 — which
 * is essentially never the intended reading when "Nasr" appears in a
 * personal name (it overwhelmingly means "Naṣr", "victory", نَصْر — e.g.
 * "Abū Naṣr al-Fārābī"). The dictionary value for the "Nasr" key was
 * changed to match the existing "Naṣr" entry (copied, not retyped) rather
 * than adding a new alias, since this corrects an existing wrong mapping
 * rather than closing a missing-alias gap.
 */
describe('"Nasr" dictionary-value correction (personal-name sense, not the idol name)', () => {
  it('"Nasr" now resolves identically to "Naṣr"', () => {
    expect(TRANSLITERATION_DICTIONARY['Naṣr'], 'dictionary is missing "Naṣr"').toBeDefined();
    expect(generateArabicHarakat('Nasr')).toBe(generateArabicHarakat('Naṣr'));
    expect(generateArabicHarakat('Nasr')).toBe(TRANSLITERATION_DICTIONARY['Naṣr']);
  });

  it('resolves correctly inside the reported "Abū Nasr al-Fārābī" name', () => {
    const result = generateTransliteration('Al-Fārābī, Abū Nasr Muhammad Ibn Tarkhān');
    expect(result.arabicHarakat).toContain(TRANSLITERATION_DICTIONARY['Naṣr']);
  });
});
