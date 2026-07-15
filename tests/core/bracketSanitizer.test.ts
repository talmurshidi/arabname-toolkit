import { describe, expect, it } from 'vitest';
import { sanitizeBrackets } from '../../src/core/transliteration/bracketSanitizer.js';
import { normalizeTransliteratedName } from '../../src/core/transliteration/index.js';

describe('bracket sanitizer', () => {
  it('preserves well-formed square brackets and their content by default', () => {
    const { text, fixes } = sanitizeBrackets('Ibn [al-Zubayr] al-Asadi');
    expect(text).toBe('Ibn [al-Zubayr] al-Asadi');
    expect(fixes).toHaveLength(0);
  });

  it('preserves well-formed parentheses and their content by default', () => {
    const { text, fixes } = sanitizeBrackets('Ibn (al-Zubayr) al-Asadi');
    expect(text).toBe('Ibn (al-Zubayr) al-Asadi');
    expect(fixes).toHaveLength(0);
  });

  it('repairs a stray unmatched bracket without touching the rest of the string', () => {
    const { text, fixes } = sanitizeBrackets('Ibn [al-Zubayr');
    expect(text).toBe('Ibn al-Zubayr');
    expect(fixes).toHaveLength(1);
    expect(fixes[0]?.type).toBe('stray-open');
  });

  it('leaves brackets untouched when disabled, including stray ones', () => {
    const { text, fixes } = sanitizeBrackets('Ibn [al-Zubayr', { enabled: false });
    expect(text).toBe('Ibn [al-Zubayr');
    expect(fixes).toHaveLength(0);
  });

  it('can strip well-formed brackets while keeping content', () => {
    const { text, fixes } = sanitizeBrackets('Ibn [al-Zubayr] al-Asadi', {
      wellFormedBrackets: 'strip-brackets-keep-content'
    });
    expect(text).toBe('Ibn al-Zubayr al-Asadi');
    expect(fixes).toHaveLength(1);
    expect(fixes[0]?.type).toBe('well-formed-stripped');
  });

  it('can remove well-formed brackets and their content entirely', () => {
    const { text, fixes } = sanitizeBrackets('Ibn [al-Zubayr] al-Asadi', {
      wellFormedBrackets: 'remove-content-and-brackets'
    });
    expect(text).toBe('Ibn al-Asadi');
    expect(fixes).toHaveLength(1);
    expect(fixes[0]?.type).toBe('well-formed-content-removed');
  });

  it('does not regress the ", al-" paren-swap when there are no brackets to fix', () => {
    expect(normalizeTransliteratedName('Baghdādī, al-')).toBe('Al-Baghdādī');
  });
});
