# ADR-008: Position-aware orthographic pre-normalization; relaxed diacritization gate

## Status

Accepted.

## Context

Three real-world accuracy issues were reported against the Converter:

1. **`ibn` between two names kept its alif** (e.g. "Abū Marwān ibn Zuhr" → ابن with alif), when
   standard Arabic orthography drops it in that position (patronymic/medial position) and keeps
   it only when "Ibn" is the first word of the name. The root cause: `dictionary.ts` has a
   single-word entry `Ibn: 'ابْن'`, matched by the position-agnostic dictionary matcher regardless
   of where "Ibn"/"ibn" appears in the input.
2. **Brill's elided-article spelling wasn't recognised.** Sources sometimes write the definite
   article, after a preceding vowel, in its elided pronunciation form — "Abū l-Qāsim" or
   "Abū 'l-Qāsim" instead of "Abū al-Qāsim" — but Arabic orthography always writes the article's
   alif regardless of connected-speech elision. Root cause: `legacyEngine.mjs` only recognises the
   literal string "al-".
3. **Reverse (Arabic → Latin) conversion rejected the forward engine's own real output** as "not
   fully diacritised". Root cause, on inspection: `looksFullyDiacritized()` required every single
   consonant — including the very last one in a word — to carry an explicit harakat mark. But the
   forward engine's own convention leaves a word-final consonant unmarked (pausal form: "Bakr" →
   بَكْر, no mark after the final ر) and never marks the definite article's lām at all (neither
   moon nor sun letter case). The gate was stricter than the system's own output, making the
   reverse direction unusable for realistic multi-word names.

Fixing (3) surfaced a fourth, adjacent bug once real forward-engine output was fed through the
relaxed gate: `arabicToLatin.ts`'s `convertWord()` doubled the consonant following a sun-letter-
assimilated lām (producing "al-zzahrāwī" instead of "al-zahrāwī"), because it read the sun-letter
shadda as ordinary root gemination. And while fixing _that_, testing against real (not hand-typed)
Arabic output revealed the forward engine's shadda/vowel-mark ordering is inconsistent between
code paths (sometimes consonant+fatha+shadda, sometimes consonant+shadda+fatha) — so the reverse
parser's vowel reader needed to accept both orders.

## Decision

**For (1) and (2): a new pre-processing module, not `legacyEngine.mjs` edits.**
`src/core/transliteration/orthographyNormalization.ts` exports `applyIbnAlifRule()` and
`applyElidedArticleRule()`, applied in `generateArabicHarakat()` right after
`normalizeTransliteratedName()` and before dictionary matching. Same architectural pattern as
`din31635.ts` (ADR-007): the fix lives in a small, targeted, independently-tested pre-processing
layer, and `legacyEngine.mjs` is not touched (ADR-003).

- `applyIbnAlifRule`: rewrites a non-initial "Ibn"/"ibn" to "bn" (verified: "bn" alone already
  produces the correct بْن through the ordinary character-level engine, no dictionary entry
  needed). An initial occurrence is left untouched so the existing dictionary entry still applies.
- `applyElidedArticleRule`: normalises `(^|\s)['ʼʾ]?[Ll]-` to `$1al-`, so both "l-" and "'l-" are
  treated identically to an explicitly-written "al-" before sun-letter assimilation and everything
  downstream runs.

**For (3) and its two follow-on bugs: relax the gate and fix the reverse parser, in
`arabicToLatin.ts`.**

- `looksFullyDiacritized()` now accepts a bare consonant in exactly two additional cases, both
  verified against the forward engine's actual output rather than assumed: (a) word-final
  position (pausal form), and (b) the definite article's lām (detected structurally: immediately
  after a word-initial alif) — which this engine's forward direction never marks, for either moon
  or sun letters. An internal bare consonant that is neither of these is still rejected as
  genuinely ambiguous.
- `convertWord()` tracks whether the immediately-preceding letter was the definite article's lām;
  if so, a shadda on the following consonant is treated as sun-letter assimilation (not doubled)
  rather than true gemination.
- `readVowel()` now accepts a shadda either before or after the vowel mark, since the forward
  engine does not consistently order them the same way across all its internal code paths.

## Consequences

- **Positive:** all three originally-reported issues are fixed, verified end-to-end through
  `TransliterationService` (not just the core functions in isolation) — see
  `tests/core/orthographyNormalization.test.ts` (12 tests) and the additions to
  `tests/core/arabicToLatin.test.ts`. 156 tests total, up from 138.
- **Positive:** the relaxed gate and doubling/ordering fixes make the reverse direction usable for
  realistic multi-word names for the first time — previously only artificially over-marked input
  (with a manually-added final sukūn) could pass.
- **Negative / scoped limitation:** `looksFullyDiacritized()`'s word-final exemption means a
  _genuinely_ under-diacritised word that happens to end mid-word-boundary in a way that looks
  pausal could pass the gate undetected. This is an accepted tradeoff — the alternative (the old,
  stricter gate) rejected the forward engine's own correct output outright, which is strictly
  worse for real usage. Any future tightening should be driven by a concrete false-positive
  report, not preemptive caution.
- **Neutral:** this ADR intentionally does _not_ fix the forward engine's shadda/vowel-mark
  ordering inconsistency itself (`legacyEngine.mjs`) — only the reverse parser was made robust to
  both orders it may encounter. Normalising the forward engine's own ordering would be a separate,
  narrower `legacyEngine.mjs` change requiring its own linguistic review (ADR-003).
