/**
 * Small Brill-input normalization helpers.
 *
 * Ported from the legacy engine (`legacyEngine.mjs`, now retired — see
 * ADR-010) with identical behavior, verified against the full regression
 * suite. Typed and documented, but the substitution rules themselves are
 * unchanged: this is a structural port, not a rewrite of the linguistic
 * rules (see docs/METHODOLOGY.md and ADR-003's caution about that).
 */

/**
 * Normalizes common ASCII/typing shortcuts to their proper Brill Unicode
 * characters — e.g. a backtick to ʿayn, an ASCII apostrophe to hamza, a
 * circumflex-style "a^" to ā, and the "°"-suffixed underdot shorthands
 * (t°, d°, h°, s°, z°) to their precomposed underdot letters.
 */
export function fixBrillChar(txt: string): string {
  if (txt) {
    txt = txt.replaceAll('û', 'ū');
    txt = txt.replaceAll('Û', 'Ū');
    txt = txt.replaceAll('`', 'ʿ');
    // Typographic curly quotes are what real bibliographic sources (e.g.
    // Brill/EI-style Latinised name lists) actually typeset for ʿayn/hamza —
    // but the same left curly quote is also used, before "l-"/"L-", as the
    // elided-article marker ("Abū 'l-Qāsim"; see applyElidedArticleRule(),
    // which already accepts the ASCII apostrophe spelling of that elision).
    // Normalise the elision case to a plain apostrophe first so it flows
    // into that existing rule instead of being misread as ʿayn.
    txt = txt.replace(/[‘’](?=[lL]-)/g, "'");
    txt = txt.replaceAll('‘', 'ʿ');
    txt = txt.replaceAll('’', 'ʾ');
    txt = txt.replaceAll('A^', 'Ā');
    txt = txt.replaceAll('a^', 'ā');
    txt = txt.replaceAll('â', 'ā');
    txt = txt.replaceAll(/'/g, 'ʾ');
    txt = txt.replaceAll('î', 'ī');
    txt = txt.replaceAll('Î', 'Ī');
    txt = txt.replaceAll('I^', 'Ī');
    txt = txt.replaceAll('t°', 'ṭ');
    txt = txt.replaceAll('D°', 'Ḍ');
    txt = txt.replaceAll('h°', 'ḥ');
    txt = txt.replaceAll('H°', 'Ḥ');
    txt = txt.replaceAll('s°', 'ṣ');
    txt = txt.replaceAll('z°', 'ẓ');
    txt = txt.replaceAll('Z°', 'Ẓ');
    txt = txt.replaceAll('S°', 'Ṣ');
    txt = txt.replaceAll('d°', 'ḍ');
    txt = txt.replaceAll('T°', 'Ṭ');
  }
  return txt;
}

/** Capitalizes the first letter, skipping past a leading ʿ/ʾ so e.g. "ʿalī" becomes "ʿAlī". */
export function capitalizeFirstLetter(value: string): string {
  if (value.charAt(0).includes('ʿ') || value.charAt(0).includes('ʾ')) {
    return value.charAt(0) + value.charAt(1).toUpperCase() + value.slice(2);
  }
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** Strips all Arabic harakat (and any other non-letter/digit characters) from Arabic script text. */
export function removeHarakat(txt: string): string {
  if (txt) {
    txt = txt.replace(/([^\u0621-\u063A\u0641-\u064A\u0660-\u0669a-zA-Z 0-9])/g, '');
  }
  return txt;
}
