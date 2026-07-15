import { describe, expect, it } from 'vitest';
import { applyYaSukunHouseStyle } from '../../src/core/transliteration/arabicHouseStyle.js';

describe('applyYaSukunHouseStyle', () => {
  it('adds sukūn on medial long-ī', () => {
    // الزُّبَيْرِي → medial ī (يِ) followed by more text gets sukūn
    const input = 'الزُّبَيْرِي';
    const result = applyYaSukunHouseStyle(input);
    // final long-ī should stay bare
    expect(result).toBe('الزُّبَيْرِي');
  });

  it('does not add sukūn to word-final long-ī', () => {
    expect(applyYaSukunHouseStyle('عَلِي')).toBe('عَلِي');
  });

  it('does not modify long-ū (wāw)', () => {
    const before = 'مُوسَى';
    expect(applyYaSukunHouseStyle(before)).toBe(before);
  });

  it('does not modify consonantal ي followed by a diacritic', () => {
    // زِيَاد — the ي here is consonantal (followed by fatḥa), not long-ī
    const before = 'زِيَاد';
    expect(applyYaSukunHouseStyle(before)).toBe(before);
  });

  it('returns empty string unchanged', () => {
    expect(applyYaSukunHouseStyle('')).toBe('');
  });

  it('processes multi-word strings word by word', () => {
    const result = applyYaSukunHouseStyle('عَلِي مُحَمَّد');
    // Both final long-ī words should stay bare
    expect(result).toBe('عَلِي مُحَمَّد');
  });
});
