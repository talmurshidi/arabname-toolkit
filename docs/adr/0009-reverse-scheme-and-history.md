# ADR-009: Reverse-direction scheme selection; unified history; scheme-mismatch warning

## Status

Accepted.

## Context

A further round of user testing against ADR-008's fixes found four more issues:

1. The Converter's Brill/DIN 31635 scheme selector was only shown for Latin → Arabic; the reverse
   direction always showed both Latin forms with no way to mark either as primary.
2. Reverse conversion of بْن/ابْن ("ibn") produced the literal "bn", not "ibn" — Brill convention
   keeps the epenthetic vowel in the Latin spelling in both the name-initial and medial Arabic
   spellings, even though only the initial position keeps the alif in Arabic script.
3. Selecting "Latin (Brill)" while typing a DIN 31635-specific letter (e.g. "Abū Maʿšar", with
   DIN's š) silently produced corrupted output ("مَعْšأَر") with no explanation.
4. Only Latin → Arabic conversions were saved to history; Arabic → Latin conversions were not
   saved at all, and no entry recorded which scheme (Brill/DIN 31635) was used.

Fixing (2) also surfaced a fifth bug while testing with real (not hand-typed) Arabic: a mid-word
و/ي acting as a mater-lectionis long vowel (e.g. the و in "Khaldūn" → خَلْدُون) was rejected by
`looksFullyDiacritized()` for lacking a mark of its own — but that vowel mark correctly sits on
the _preceding_ consonant, not on و/ي itself; the gate simply hadn't accounted for this case
alongside the word-final and article-lām exemptions ADR-008 added.

## Decision

**Reverse direction returns a full `ConversionOutput`, not a narrower ad-hoc shape.**
`TransliterationService.convertReverse(text, preferredScheme = 'brill')` now returns the same
shape as `convert()` — including `direction: 'arabic-to-latin'`, `arabicHarakat`/`arabic` (the
Arabic input itself, with/without diacritics), `normalizedName`/`nameOrder` (derived from the
Brill Latin result), and `scheme` set to the caller-supplied `preferredScheme`. This means a
single `result` state and a single history push path serve both directions in the UI — no
parallel "reverse result" type needed.

**Irregular whole-word reverse mapping for ابن/بن.** `arabicToLatin.ts` gains a small
`IRREGULAR_REVERSE_WORDS` lookup, checked per word-token before falling back to the regular
character-level `convertWord()`. Both `بْن` (medial) and `ابْن` (initial) map to `ibn`. This is
the first (and, for now, only) entry — a deliberately narrow, explicitly-tested exception, not a
general irregular-word reversal framework. Scaling this to more irregular words (e.g. `ʿAbdallāh`,
`Abū`) is future work, not attempted here.

**`looksFullyDiacritized()` gains a third exemption**, alongside ADR-008's word-final and
article-lām ones: a و/ي not followed by a vowel-carrying mark is treated as mater lectionis and
needs no mark of its own — exactly the same criterion `readVowel()` already uses to make this
distinction, so the gate and the parser now agree precisely on what counts as "diacritised enough
to convert."

**Scheme-mismatch detection is a UI-level warning, not a new core function.** The Converter
checks `scheme === 'brill' && direction === 'latin-to-arabic' && containsDin31635Chars(input)`
(reusing the already-tested helper from `din31635.ts`) and shows a dismissible warning with a
one-click "Switch to DIN 31635" action — it does not block conversion, since the existing
Brill-scheme output (however degraded) may still be what the user wants to inspect. The reverse
direction (DIN selected, Brill digraphs typed) is deliberately **not** flagged: Brill's digraphs
are valid, unambiguous input under the DIN scheme too, so there's nothing to warn about there.

**History records every conversion, in both directions, with its scheme.** Since
`convertReverse()` now returns a full `ConversionOutput`, `historyService.push()` is called for
both directions from the same call site in `ConverterPage.tsx`. Each history row shows a small
direction badge (Latin/Arabic) and scheme badge (Brill/DIN 31635); clicking a row restores
direction, scheme, and input, and re-displays the stored result.

## Consequences

- **Positive:** the Converter's scheme selector now has one consistent meaning in both
  directions ("which Latin scheme is primary"), rather than being direction-specific UI.
- **Positive:** the `ibn` fix is verified end-to-end through `TransliterationService`, not just
  the core function in isolation — `tests/services/transliterationService.test.ts` generates the
  Arabic input dynamically via the forward engine rather than hand-typing it, avoiding the
  combining-mark transcription risk documented in `CLAUDE.md`.
- **Positive:** the mater-lectionis gate fix has no known downside — it makes the gate agree with
  the reverse parser's own long-vowel detection exactly, rather than being independently
  (and, it turned out, incorrectly) stricter.
- **Neutral:** `IRREGULAR_REVERSE_WORDS` is intentionally minimal (one entry). Extending it to
  cover more irregular forward substitutions is reasonable future work but out of scope here —
  each addition should be verified the same way (dynamically-generated test input, not hand-typed
  Arabic literals).
