import { describe, expect, it } from 'vitest';
import { applyArabicHarakatTransliteration as legacyApply } from '../../src/core/transliteration/legacyEngine.mjs';
import { applyArabicHarakatTransliteration as portedApply } from '../../src/core/transliteration/brill/engine.js';
import { TRANSLITERATION_DICTIONARY } from '../../src/core/transliteration/dictionary.js';

/**
 * legacyEngine.mjs is retired (ADR-010) — nothing in src/ imports it
 * anymore. It is kept in the repo purely as a historical equivalence
 * oracle for this one test file: the ported engine in `brill/` was
 * derived from it via mechanical extraction and cross-validated
 * byte-for-byte before replacing it (see the header comment in
 * consonantTable.ts). This test locks that equivalence in permanently, so
 * a future change to the ported engine can't silently drift from the
 * original rules without a passing developer noticing.
 *
 * If a *deliberate* behavior change is made to the ported engine (a real
 * bug fix, not drift), this test will fail — that's expected. Update or
 * remove the specific case here as part of that change, with the same
 * care given to any other legacyEngine.mjs-adjacent change (ADR-003).
 */
describe('ported Brill engine matches the retired legacyEngine.mjs exactly', () => {
  it('produces identical output for every curated dictionary key', () => {
    const mismatches: Array<{ key: string; legacy: string; ported: string }> = [];
    for (const key of Object.keys(TRANSLITERATION_DICTIONARY)) {
      const legacy = legacyApply(key);
      const ported = portedApply(key);
      if (legacy !== ported) mismatches.push({ key, legacy, ported });
    }
    expect(mismatches).toEqual([]);
  });

  const realisticNames = [
    'Muḥammad',
    'Aḥmad',
    'ʿAlī',
    'Abū Bakr',
    'Ibn Khaldūn',
    'Bint al-Shāṭiʾ',
    'al-Ṭabarī',
    'al-Shāfiʿī',
    'al-Rāzī',
    'Khālid ibn al-Walīd',
    'ʿAbd al-Raḥmān',
    'ʿAbdallāh',
    'Fāṭima',
    'al-Bukhārī',
    'al-Tirmidhī',
    'Ibn Sīnā',
    'Ibn Rushd',
    'al-Ghazālī',
    'al-Khwārizmī',
    "Abū 'l-Qāsim",
    'Abū l-Faḍl',
    '(al-Ṣāliḥ, al-)',
    'Ṣāliḥ, al-',
    'Zakariyyā',
    'Sulaymān ibn ʿAbd al-Malik',
    'bt. Muḥammad',
    'b. ʿAlī',
    'Ṣ. al-Dīn'
  ];

  it.each(realisticNames)('matches for "%s"', (name) => {
    expect(portedApply(name)).toBe(legacyApply(name));
  });
});
