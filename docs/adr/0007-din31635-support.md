# ADR-007: DIN 31635 support via a pre/post-processing layer, not engine changes

## Status

Accepted.

## Context

Following the documentation correction in ADR-006's addendum era (see CHANGELOG "Fixed" entry
predating this ADR), it became clear that ǧ, š, ġ, ḏ, ṯ, ẖ, ẗ are DIN 31635 — the German Oriental
Society's transliteration standard (used in, e.g., Brockelmann's _GAL_) — not a broken Brill
alternate. A follow-up feature request asked for DIN 31635 to be genuinely supported: selectable
as an input scheme in the Converter, with its own keyboard tab, and included in the output
alongside Brill.

The two systems share most letters (ā ḥ ṣ ḍ ṭ ẓ ʿ ʾ w y l m n h f q k b t d r z s) and differ only
in seven: DIN's single caron/macron letters vs. Brill's digraphs (ǧ↔j, š↔sh, ġ↔gh, ḏ↔dh, ṯ↔th,
ẖ↔kh, ẗ↔bare -a). This is a small, closed, deterministic character-level mapping — not a new
transliteration engine.

`legacyEngine.mjs` is treated as a load-bearing, ported artifact that should not be edited without
a linguistic review (ADR-003). Teaching it to understand DIN letters directly would mean adding
DIN-aware branches throughout hundreds of regex rules — high risk, for a problem that has a much
smaller, safer solution.

## Decision

Implement DIN 31635 support as a **pre/post-processing conversion layer**,
`src/core/transliteration/din31635.ts`, that sits in front of the existing pipeline and never
touches `legacyEngine.mjs`:

- **`dinToBrill(text)`** — converts DIN-spelled input to Brill spelling (a straightforward,
  verified character substitution: DIN's seven letters are unique Unicode codepoints not used
  anywhere else in Brill, so this is unambiguous). Applied to the user's raw input _before_ it
  reaches `generateTransliteration()`.
- **`brillToDin(text)`** — converts Brill-spelled text (digraphs) back to DIN spelling, for
  display. Applied to `normalizedName` (forward direction) or the reverse-direction Latin output,
  _after_ the existing pipeline has already produced its result.
- **`containsDin31635Chars(text)`** — a small detection helper, exported for potential future use
  (e.g. auto-suggesting a scheme).

`TransliterationScheme` (in `src/shared/types.ts`) gains a `'din31635'` member alongside
`'brill'`. `ConversionOutput` gains two fields — `brillLatin` and `dinLatin` — populated
_unconditionally_, regardless of which scheme was used for input, so the Converter can always
show both Latin forms (this was an explicit feature request, not just an implementation detail).

`TransliterationService.convert()` runs `dinToBrill()` on the input when `scheme === 'din31635'`,
then proceeds exactly as it would for Brill input. `TransliterationService.convertReverse()` runs
`brillToDin()` on its Brill Latin result to populate `dinLatin`. Neither the core `generateArabic*`
functions nor `legacyEngine.mjs` gained any DIN-specific branching.

The Converter UI (`ConverterPage.tsx`) exposes a scheme selector (Brill / DIN 31635) when
converting Latin → Arabic, and the virtual keyboard (`VirtualKeyboard.tsx`) gained a third tab
for DIN 31635's seven distinctive letters. The keyboard auto-selects to match the active
direction/scheme but remains manually switchable to any of the three layouts at any time.

## Consequences

- **Positive:** `legacyEngine.mjs` is completely unmodified — ADR-003's risk boundary holds.
  DIN and Brill input for the same name are guaranteed to produce identical Arabic, because DIN
  input is converted to Brill _before_ any Arabic-producing logic runs; there is no second code
  path to keep in sync.
- **Positive:** the conversion is small, deterministic, and fully unit-tested in isolation
  (`tests/core/din31635.test.ts`, 45 cases) as well as through the service layer
  (`tests/services/transliterationService.test.ts`) — every mapping is verified against the real
  engine, not asserted from documentation alone.
- **Negative / scoped limitation:** `brillToDin()`'s word-final bare-"a" → ẗ rule assumes text
  already follows this project's Brill convention (any word-final bare "a" is tāʾ marbūṭa). It is
  only ever applied to text this engine itself produced or accepted, so it is a scoping note, not
  a general-purpose Brill-text analyser — documented in `docs/METHODOLOGY.md` "Known limitations."
- **Neutral:** `BatchService` accepts `TransliterationScheme` already (no code change needed) —
  batch CSV/TSV processing of DIN 31635 input works transparently, though the Batch page's UI
  does not yet expose a scheme selector (out of scope for this change; a natural follow-up).
