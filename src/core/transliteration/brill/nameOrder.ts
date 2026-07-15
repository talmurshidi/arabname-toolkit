/**
 * Strips diacritics and special marks from a Brill Latin name to produce a
 * plain-ASCII sort/index key (e.g. for alphabetized catalogues). Ported
 * from legacyEngine.mjs (now retired — see ADR-010) with identical
 * behavior, verified against the full regression suite.
 */
export function replaceFilterNameOrder(txt: string): string {
  if (txt) {
    txt = txt.replaceAll('`', '');
    txt = txt.replaceAll('ʿ', '');
    txt = txt.replaceAll('ʾ', '');
    txt = txt.replaceAll(/'/g, '');
    txt = txt.replaceAll('^', '');
    txt = txt.replaceAll('°', '');
    txt = txt.replaceAll('Ā', 'A');
    txt = txt.replaceAll('â', 'a');
    txt = txt.replaceAll('ā', 'a');
    txt = txt.replaceAll('Ṣ', 'S');
    txt = txt.replaceAll('ṣ', 's');
    txt = txt.replaceAll('Ḥ', 'H');
    txt = txt.replaceAll('ḥ', 'h');
    txt = txt.replaceAll('û', 'u');
    txt = txt.replaceAll('ū', 'u');
    txt = txt.replaceAll('Û', 'U');
    txt = txt.replaceAll('Ū', 'U');
    txt = txt.replaceAll('Ṭ', 'T');
    txt = txt.replaceAll('ṭ', 't');
    txt = txt.replaceAll('î', 'i');
    txt = txt.replaceAll('Î', 'I');
    txt = txt.replaceAll('ī', 'i');
    txt = txt.replaceAll('Ī', 'I');
    txt = txt.replaceAll('Ḍ', 'D');
    txt = txt.replaceAll('ḍ', 'd');
    txt = txt.replaceAll('ẓ', 'z');
  }
  return txt;
}
