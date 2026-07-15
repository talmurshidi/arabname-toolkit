/**
 * Exact-match corrections for source data entered without proper diacritic
 * support. Keyed on the string exactly as typed (do not normalise the key —
 * it must match the real input for this to have any effect). Every entry
 * must cite where the corrected form was verified.
 *
 * Add new entries here when a known-degraded spelling is confirmed against a
 * citable reference. Do not guess — leave the row blank until verified.
 *
 * See also: docs/reference/degraded-transliteration-candidates.md for the
 * current worklist of candidates awaiting human verification.
 */
export const TRANSLITERATION_CORRECTIONS: Record<string, string> = {
  // Stored as: "Abu Tayyib al-Lughawi" (missing macron, missing "al-"
  // before Tayyib, missing underdot). Correct: Abū al-Ṭayyib al-Lughawī.
  // Source: verified against a real bio-bibliographical reference (2026-07).
  'Abu Tayyib al-Lughawi': 'أَبُو الطَّيِّب اللُّغَوِي'
};
