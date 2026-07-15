/**
 * Public surface of the ported Brill engine (replaces legacyEngine.mjs —
 * see ADR-010). Only `index.ts` (the transliteration package's own public
 * API) should import from here.
 */
export {
  transliterationToArabicHarakat,
  applyArabicHarakatTransliteration,
  transliterationToArabic
} from './engine.js';
export { fixAlDashAndBracket } from './bracketArticleFix.js';
export { replaceFilterNameOrder } from './nameOrder.js';
