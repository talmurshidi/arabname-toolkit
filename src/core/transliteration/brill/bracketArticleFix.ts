/**
 * Handles the "trailing/leading al-" reordering conventions seen in some
 * prosopography source data — e.g. "Ṣāliḥ, al-" or "(Ṣāliḥ, al-)" meaning
 * "al-Ṣāliḥ". Ported from legacyEngine.mjs (now retired — see ADR-010)
 * with identical behavior, verified against the full regression suite.
 */
import { fixBrillChar } from './helpers.js';
import { capitalizeFirstLetter } from './helpers.js';

/** True if `txt` ends with ", al-" (or a bracket/space variant) — the "trailing article" pattern. */
export function isIncludeDashAtEnd(txt: string): boolean {
  return (
    txt.toLowerCase().endsWith(', al-') ||
    txt.toLowerCase().endsWith(', al- ') ||
    txt.toLowerCase().endsWith('al-') ||
    txt.toLowerCase().endsWith('al- ')
  );
}

/** True if `txt` is wrapped in (or starts/ends with) parentheses. */
export function isIncludeBracket(txt: string): boolean {
  return txt.toLowerCase().startsWith('(') || txt.toLowerCase().endsWith(')');
}

function fixALWithDash(txt: string): string {
  if (txt) {
    const splitStr = txt.trim().split(' ');
    const splitComma = txt.trim().split(',');
    if (splitStr.length === 2 && isIncludeDashAtEnd(txt)) {
      txt = txt.trim();
      txt = txt.replaceAll(/, al- /gi, '');
      txt = txt.replaceAll(/, al-/gi, '');
      txt = txt.trim();
      txt = 'al-' + txt;
    } else if (splitStr.length === 3 && splitComma.length === 2 && isIncludeDashAtEnd(txt)) {
      txt = (splitComma[1] ?? '').trim() + ' ' + (splitComma[0] ?? '').trim();
      txt = txt.replaceAll(/al- /gi, 'al-');
    }
    txt = txt.trim();
  }
  return txt;
}

function fixALWithDashBetweenBrackets(txt: string): string {
  if (txt) {
    txt = txt.replaceAll('(', '');
    txt = txt.replaceAll(')', '');
    txt = txt.trim();
    if (isIncludeDashAtEnd(txt)) txt = fixALWithDash(txt);
    txt = txt.trim();
    txt = '(' + txt + ')';
  }
  return txt;
}

/**
 * Normalizes trailing/bracketed "al-" reordering, then applies the general
 * Brill-character fixups and capitalizes the result's first letter.
 */
export function fixAlDashAndBracket(txt: string): string {
  if (txt) {
    txt = fixBrillChar(txt);
    if (isIncludeBracket(txt) && txt.toLowerCase().includes('al-')) {
      const dashesBrackets = txt.split('(');
      let joinedStr = '';
      dashesBrackets.forEach((element) => {
        if (element.includes(')')) joinedStr += fixALWithDashBetweenBrackets(element) + ' ';
        else joinedStr += fixALWithDash(element) + ' ';
      });
      txt = joinedStr.trim();
    } else if (isIncludeDashAtEnd(txt)) {
      txt = fixALWithDash(txt);
    }
    txt = capitalizeFirstLetter(txt);
  }
  return txt;
}
