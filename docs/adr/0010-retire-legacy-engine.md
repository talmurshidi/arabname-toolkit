# ADR-010: Retire `legacyEngine.mjs`; port to a typed, data-driven engine

## Status

Accepted. Supersedes ADR-003.

## Context

ADR-003 treated `legacyEngine.mjs` as a load-bearing, vendored artifact — encoding real
linguistic knowledge in dense, uncommented, 900-line-long sequential regex, ported from a
production Electron app with no test coverage of its own at the time. The rule was: don't touch
it without a linguistic review, because the risk of a silent regression in untyped, unstructured
regex was too high relative to the understanding available.

That calculus has changed. Since ADR-003 was written, the project gained:

- A 159-test regression suite (now 188 with this change) covering the engine's behavior in
  detail, including edge cases discovered while fixing real reported bugs (ADR-008, ADR-009).
- Three rounds of real bugs found and fixed _around_ `legacyEngine.mjs` (DIN 31635, the ibn/al-
  orthography fixes, the reverse-direction fixes) — every one of them had to be implemented as a
  pre/post-processing layer specifically _because_ editing the file directly was considered too
  risky. That workaround pattern was itself a sign the file had become a liability: new
  requirements were accumulating around it rather than being cleanly integrated.
- A concrete, mechanical way to verify equivalence: the file's ~530 individual character-mapping
  rules turned out to be near-total repetitions of two templates (a geminated-consonant template
  and a single-occurrence-consonant template) applied to different {Latin, Arabic} letter pairs,
  plus a smaller set of genuinely irregular rules (whole-word substitutions, hamza handling,
  glide/hamza fusions, sun-letter assimilation).

This made a faithful, verifiable port newly practical, which wasn't true when ADR-003 was
written.

## Decision

**Port `legacyEngine.mjs` to `src/core/transliteration/brill/`, a typed, data-driven module set,
and stop importing the original file from anywhere in `src/`.** The file itself is _not_ deleted —
it remains in the repository as a historical/audit reference and as the equivalence oracle for
`tests/core/brillEngineParity.test.ts` — but it is no longer part of the active implementation,
and is no longer described as load-bearing in any documentation.

The port was done mechanically, not by hand-transcription, specifically to avoid the
combining-mark transcription risk documented in `CLAUDE.md`'s testing guidance (a risk that bit
this exact migration once — see "Validation" below):

1. A Node script parsed every `txt.replaceAll(/PATTERN/gi, 'REPLACEMENT')` (and `replace`) call
   in the original file's giant function into an ordered list of {pattern, flags, replacement}
   tuples.
2. ~530 of those rules turned out to be two repeating templates — geminated-consonant and
   single-occurrence-consonant — applied to a small set of {latin, arabic} letter-unit pairs. A
   second script derived candidate tables for those pairs, _then regenerated the full rule set
   from the tables using the same templates_ and diffed it byte-for-byte against the original
   530 rules. Every table (`consonantTable.ts`) was verified to match exactly before being
   written — nothing was hand-assembled.
3. The remaining rules — irregular whole-word substitutions, hamza handling, glide/hamza
   fusions, and sun-letter assimilation — don't fit a clean template and were ported verbatim,
   using `sed`-extracted exact byte ranges piped directly into the new files (never retyped by
   hand), preserving their exact order.
4. The new module structure:
   - `brill/consonantTable.ts` — the verified {latin, arabic} data tables (63 entries, replacing
     ~530 lines of duplicated regex).
   - `brill/consonantTemplates.ts` — the two generic template functions.
   - `brill/irregularRules.ts` — common words, hamza rules, glide/hamza-fusion extras.
   - `brill/sunLetterAssimilation.ts` — the forward-direction sun-letter shadda rules.
   - `brill/helpers.ts`, `brill/bracketArticleFix.ts`, `brill/nameOrder.ts` — the smaller
     supporting functions (`fixBrillChar`, `fixAlDashAndBracket`, `replaceFilterNameOrder`, etc.).
   - `brill/engine.ts` — orchestrates all of the above into `transliterationToArabicHarakat`,
     `applyArabicHarakatTransliteration`, and `transliterationToArabic`, in the same rule order
     as the original.
   - `brill/index.ts` — the module's own public surface; only `index.ts` (the package's public
     API) imports from it.
5. `src/core/transliteration/index.ts` now imports from `./brill/index.js` instead of
   `./legacyEngine.mjs`.

## Validation

Three layers of verification, beyond the byte-for-byte table regeneration in step 2 above:

1. **The full 159-test pre-existing suite** passes unchanged against the ported engine.
2. **A differential comparison** between the retired file and the ported engine, run against:
   every one of the 1,774 curated dictionary keys, every correction key, ~110 realistic
   hand-picked names covering sun/moon letters, gemination, hamza, the definite article, bracket
   handling, and 2,000 randomized fuzz strings built from the full Brill letter inventory.
   **Zero mismatches** across all of the above.
3. **A permanent parity test**, `tests/core/brillEngineParity.test.ts`, imports both the retired
   file and the ported engine and asserts continued equivalence for the full dictionary and a
   curated name list — this is why the retired file stays in the repository rather than being
   deleted outright.

**One real bug was caught during this migration** (and is exactly why the mechanical,
diff-validated approach mattered): an early hand-typed comparison string in `engine.ts` — the
`'يَّا'` exclusion in the alif-maqṣūra word-ending rule — had its combining marks in the wrong
order (fatha-then-shadda instead of the source's shadda-then-fatha), causing one dictionary entry
("Zakariyyā") to convert incorrectly. The differential test against the full dictionary caught it
immediately; the fix was to replace the hand-typed line with the mechanically `sed`-extracted
exact bytes instead of retyping it. This is the same class of error flagged in `CLAUDE.md`'s
testing guidance, now with a second, larger-scale confirmation of why dynamic/mechanical
extraction is required for anything touching Arabic combining-mark sequences.

## Consequences

- **Positive:** the engine's rules are now typed, documented, organized by concern, and
  ~85% smaller by line count (530 duplicated lines → ~65 data-table entries + 2 shared template
  functions), while remaining behaviorally identical (verified as above).
- **Positive:** future changes (like ADR-008's and ADR-009's orthography fixes) can now, in
  principle, be made directly in the ported engine where appropriate, instead of always requiring
  an external pre/post-processing layer — though the same caution ADR-003 established still
  applies: this remains linguistically load-bearing code, and changes need a real justification
  and a test, not just refactoring for its own sake.
- **Positive:** documentation no longer describes an unused, retired file as the active
  implementation — `docs/METHODOLOGY.md`, `CLAUDE.md`, and the in-app Methodology view were all
  updated to describe `brill/` instead (see the corresponding CHANGELOG entry).
- **Neutral:** `legacyEngine.mjs` remains in the repository, excluded from lint/typecheck (as
  before), solely as the equivalence oracle for the permanent parity test. It is not imported by
  anything in `src/`.
- **Negative / accepted risk:** the differential validation is thorough but not exhaustive — it
  cannot prove there is no input on which the ported engine and the original differ. The
  1,774-dictionary-key and 2,000-fuzz-string coverage is offered as strong (not absolute)
  evidence, consistent with how the rest of this project's linguistic correctness claims are
  scoped (tested behavior, not formally proven behavior).
