# Changelog

All notable changes to this project are documented in this file. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); this project does not yet follow
semantic versioning strictly (pre-1.0).

## [Unreleased]

## [0.2.0] - 2026-07-16

### Added

- **`hasHeader` option on `BatchService.processCsvFile()`/`previewCsvFile()`** (default
  `true`, matching previous behavior for files that do have a header). A named `column`
  combined with `hasHeader: false` is now a rejected error (no header row to match
  against) rather than a silent, wrong-guess fallback.
- **`previewCsvFile()`**: a cheap upfront look at a CSV/TSV file (header row, first 5 data
  rows, resolved column index, total data-row count, and validation warnings) callable
  before committing to processing the whole file.
- **Batch page preview panel**: automatically previews the selected file (re-running
  whenever the file, column, or "has header row" checkbox changes), shows a sample table
  (kept LTR regardless of UI locale, since sample cells are un-converted Latin text), and
  surfaces validation warnings. Blocking warnings (empty file, no data rows, column not
  found/out of range) disable the "Start processing" button; the informational
  single-column warning does not.
- **`hasHeader` checkbox** on the Batch page, wired to the new `BatchOptions.hasHeader`.
- **`tests/services/batchService.test.ts`**: first test coverage for `BatchService`,
  including a regression test reproducing the exact pre-fix header bug for contrast.
- **`docs/reference/batch-file-format.md`**: accepted file format reference with example
  CSV/TSV content (headered, headerless, tab-separated), `hasHeader` semantics, the full
  `previewCsvFile()` warning-code table, and the CSV export format.
- **Four more dictionary aliases for a distinct ʿayn/hamza ambiguity**: `Ismāʾil`,
  `Maʾshar`, `Jaʾfar`, `Yaʿqūb`'s hamza-spelled variant `Yaʾqūb`. Real sources typeset a
  word-medial apostrophe as a right curly quote (’) purely by _position in the word_
  (ordinary "smart quote" auto-correction — start-of-word gets the left/opening quote,
  elsewhere gets the right/closing quote), regardless of whether hamza or ʿayn is
  intended. After the curly-quote fix above normalises that right quote to ʾ (hamza), a
  genuinely-ʿayn word like "Ismāʿīl" (source-spelled "Ismā'il") was rendered with an
  incorrect hamza instead. Each alias points at the correct ʿayn-spelled value (this
  dictionary's existing entry where one exists; the character-level engine's own output
  for "Maʿshar", which has no dictionary entry). Rule version bumped to
  `dictionary-v1-legacy-fallback-2.0.7`.

### Fixed

- **`BatchService.processCsvFile()` always treated the first row as a header**, even when
  the file had none, silently discarding the first data row (e.g. the first name) of any
  headerless CSV/TSV file. See the new `hasHeader` option above.
- **`onProgress(rowIndex, rowIndex)` made batch-progress UI jump to 100% after the first
  row.** The callback now receives the true total data-row count as its second argument.
  Internally, `processCsvFile()` now reads the whole file's text and parses it
  synchronously (`Papa.parse(text, ...)`) instead of streaming the `File` object through
  Papa Parse's own reader — this is what makes an accurate upfront total possible, and
  also makes the module unit-testable in Node (Papa Parse's File-streaming path depends on
  `FileReaderSync`, a worker-only API unavailable in a plain Node test environment, which
  is part of why `BatchService` had no tests before). Responsiveness on large files is
  preserved by yielding to the event loop every 50 rows instead of relying on Papa Parse's
  streaming.
- **Dictionary key `Nasr` mapped to the wrong word for personal names.** It previously
  resolved to `نَسْر` — a distinct word, the pre-Islamic idol name from the root ن-س-ر
  mentioned at Q71:23 — but bare "Nasr" in a personal name overwhelmingly means `Naṣr`
  (`نَصْر`, "victory" — e.g. "Abū Naṣr al-Fārābī", also present in the muslimheritage.com
  fixture set). The value was changed to match the existing `Naṣr` entry (copied
  byte-for-byte, not retyped). This is an **existing dictionary value changing**, not a
  new alias — rule version bumped to `dictionary-v1-legacy-fallback-2.0.6` since it
  changes output for any existing input using the bare key `Nasr`. No test previously
  asserted the old idol-name value, so nothing needed updating for that reason; a new
  regression test locks in the corrected mapping
  (`tests/core/commonNameAliases.test.ts`).
- **Curly quotes (‘ U+2018 / ’ U+2019) weren't normalised to ʿ/ʾ.** Real bibliographic
  sources (e.g. the muslimheritage.com Latinized-scholar-names list) typeset ʿayn/hamza as
  typographic curly quotes rather than the backtick/ASCII-apostrophe shortcuts
  `fixBrillChar()` already accepted. Previously this could leak raw, un-transliterated
  Latin characters into Arabic output (e.g. `Ismā‘il` → `إِسْمَاعِil`) or produce the wrong
  consonant (`‘Abdullāh` starting with أ instead of ع). The same left curly quote is also
  historically used for the _elided_ definite article ("Abū ‘l-Qāsim" = "Abū al-Qāsim");
  `fixBrillChar()` now disambiguates that case before applying the ʿayn mapping, and
  `applyElidedArticleRule()` recognises the curly-quote spelling of the elision directly
  too.
- **Alif wasla (ٱ, U+0671) broke reverse (Arabic → Latin) conversion.** ٱ is the standard
  Qur'anic/Classical spelling of the hamzat al-waṣl (e.g. `ٱللَّٰهُ` in the Basmala), and
  plays the same structural role as plain alif (ا) for this engine's purposes, but was a
  different, unrecognised codepoint. `looksFullyDiacritized()` now treats the two as
  equivalent, so correctly-voweled text using ٱ is no longer wrongly rejected as "not
  fully diacritised"; `convertWord()` now also converts it to `al-` like plain alif, and
  `readVowel()` now merges a following dagger alif (ٰ, U+0670) into the preceding short
  vowel instead of emitting a duplicated vowel (e.g. `laā` → `lā`).
- **Assimilated Latin article spellings before a sun letter weren't recognised**
  (`as-Sābī`, `ar-Raḥmān`, `ash-Shāfiʿī`, `adh-Dhahabī`, and the other ten sun-letter
  prefixes, plus their elided-vowel variants without the leading "a"). Previously read as
  two unrelated words (`as-Sābī` → "as" + "Sābī"); a new `applyAssimilatedArticleRule()`
  (`orthographyNormalization.ts`) rewrites all of them to the canonical `al-` form before
  dictionary matching, letting the existing `applySunLetterAssimilation()` regenerate the
  correct Arabic shadda downstream — same approach as `applyElidedArticleRule()`.
- **Added ~40 bare-ASCII dictionary aliases for extremely common given names**
  (`Muhammad`, `Ahmad`/`Ahmed`, `Hasan`/`Hassan`, `Husayn`/`Hussein`/`Husain`, `Ibrahim`,
  `Yahya`, `Uthman`/`Usman`/`Othman`, `Jafar`, `Zakariya`/`Zakariyya`, `Rashid`,
  `Harun`/`Haroun`, `Ishaq`, `Umar`/`Omar`, `Yusuf`, `Musa`, `Sulayman`/`Suleiman`,
  `Ismail`/`Ismael`, `Khalid`, `Marwan`, `Habib`, `Aziz`, `Hamid`, `Tahir`,
  `Mahmud`/`Mahmoud`/`Mahmūd`, `Tufayl`, `ʿAbdullāh`, `Fath`, and `Hāmed`), each aliased to
  the exact same Arabic value as this dictionary's existing, correctly diacritized entry —
  no new Arabic was authored for this batch. Real bibliographic sources very often drop
  macrons/underdots on exactly these names while keeping them on rarer ones (see
  `docs/METHODOLOGY.md`, "Known limitations" #2). Rule version bumped to
  `dictionary-v1-legacy-fallback-2.0.5` since these four fixes change output for existing
  input containing curly quotes, alif wasla, assimilated article spellings, or these
  specific bare names.

### Changed

- **Retired `legacyEngine.mjs`; ported it to a typed, data-driven engine** under
  `src/core/transliteration/brill/`. The original file's ~530 individual regex rules turned out
  to be near-total repetitions of two templates (geminated-consonant, single-occurrence-consonant)
  applied to a small set of {Latin, Arabic} letter pairs — now `consonantTable.ts` (63 data
  entries) + `consonantTemplates.ts` (2 shared functions), with the genuinely irregular rules
  (common words, hamza handling, sun-letter assimilation) ported verbatim into their own modules.
  The port was done and verified mechanically — extracting rules and regenerating them
  programmatically rather than hand-transcribing — and cross-checked against the original: all
  1,774 dictionary keys, ~110 realistic names, and 2,000 randomized fuzz strings produce identical
  output. A permanent parity test (`tests/core/brillEngineParity.test.ts`) locks this in going
  forward. `legacyEngine.mjs` itself is kept in the repository only as that test's equivalence
  oracle — nothing in `src/` imports it anymore, and all documentation (`docs/METHODOLOGY.md`,
  `CLAUDE.md`, the in-app Methodology page) now describes `brill/` as the active engine. See
  ADR-010 (supersedes ADR-003's "don't touch it" caution, which no longer applies to a retired
  file). One real transcription bug was caught and fixed during the port itself — see ADR-010's
  "Validation" section.

### Fixed

- **History rows for Arabic → Latin conversions showed the same Arabic text on both lines**
  (entered text and "converted value" were identical, since both were reading the Arabic input).
  Now direction-aware: Arabic → Latin rows show the Arabic input on top and the converted Latin
  form (Brill or DIN 31635, per the entry's scheme) below; Latin → Arabic rows are unchanged.

- **Four more reported issues, all verified end-to-end via `TransliterationService`:**
  1. The Brill/DIN 31635 scheme selector was Latin → Arabic only. It now works in both
     directions — for Arabic → Latin it marks which Latin form (`brillLatin`/`dinLatin`, both
     always populated) is primary, via `convertReverse(text, preferredScheme)`.
  2. Reverse conversion of بْن/ابْن ("ibn") produced the literal "bn" instead of "ibn". New
     `IRREGULAR_REVERSE_WORDS` lookup in `arabicToLatin.ts` maps both the medial (بْن) and
     name-initial (ابْن) Arabic spellings to Brill's "ibn", matching convention (the epenthetic
     vowel is kept in the Latin spelling in both positions, even though only the initial position
     keeps the alif in Arabic script).
  3. Selecting "Latin (Brill)" while typing a DIN 31635-specific letter (e.g. "Abū Maʿšar")
     silently produced corrupted output with no explanation. The Converter now detects this
     (reusing the already-tested `containsDin31635Chars()`) and shows a warning with a one-click
     "Switch to DIN 31635" action.
  4. Only Latin → Arabic conversions were saved to history, and without recording which scheme
     was used. Every conversion, either direction, is now saved, tagged with a direction badge
     and a scheme badge; clicking a history row restores direction, scheme, and input.
  - Fixing (2) surfaced one more real bug, also fixed: `looksFullyDiacritized()` rejected a
    mid-word و/ي acting as a mater-lectionis long vowel (e.g. "Khaldūn" → خَلْدُون) for lacking a
    mark of its own, even though that mark correctly belongs on the _preceding_ consonant. The
    gate now uses the same criterion `readVowel()` already uses to make this distinction.
  - `ConversionOutput` gained a `direction` field so both conversion directions share one shape
    (needed for the unified history push). See ADR-009 for the full rationale.
  - 3 new tests plus expanded coverage in `tests/services/transliterationService.test.ts` and
    `tests/core/arabicToLatin.test.ts`; 159 tests total, up from 156.

- **Three reported transliteration-accuracy bugs, all verified end-to-end via
  `TransliterationService`:**
  1. `ibn` between two names incorrectly kept its alif (e.g. "Abū Marwān ibn Zuhr" → ابن with
     alif, should be بن). New pre-processing rule `applyIbnAlifRule()`
     (`src/core/transliteration/orthographyNormalization.ts`) drops the alif except when "Ibn" is
     the first word of the name, matching standard Arabic orthography. `Bint` is unaffected (it
     never takes an alif).
  2. Brill's elided-article spelling ("Abū l-Qāsim" / "Abū 'l-Qāsim") wasn't recognised at all —
     it fell through as a literal "l". New rule `applyElidedArticleRule()` normalises it to the
     orthographic "al-" form (Arabic script always writes the article's alif, unlike "ibn"'s,
     regardless of connected-speech elision), so sun-letter assimilation and everything downstream
     runs correctly.
  3. Arabic → Latin conversion rejected the forward engine's own real multi-word output as "not
     fully diacritised". `looksFullyDiacritized()` required a mark on literally every consonant,
     including a word's final one and the definite article's lām — neither of which the forward
     engine ever marks (pausal form; sun/moon-letter lām elision). The gate now matches the
     engine's actual convention. Fixing this surfaced two more real bugs, also fixed: the reverse
     parser doubled the consonant after a sun-letter-assimilated lām (e.g. "al-zzahrāwī" instead
     of "al-zahrāwī"), and the forward engine's shadda/vowel-mark ordering turned out to be
     inconsistent across code paths — the reverse parser now accepts either order. See ADR-008 for
     the full rationale.
  - None of these changes touch `legacyEngine.mjs` (ADR-003) — both new rules are a pre-processing
    layer, and the gate/reverse-parser fixes are scoped to `arabicToLatin.ts`.
  - 18 new tests (`tests/core/orthographyNormalization.test.ts` plus additions to
    `tests/core/arabicToLatin.test.ts`); 156 tests total, up from 138.
  - While writing these tests, hand-typed Arabic-script literal comparisons produced two more
    false failures from combining-mark transcription slips — same class of mistake already
    documented in `CLAUDE.md`'s testing guidance. Fixed by comparing against dynamically-computed
    values instead, per that existing rule.

### Added

- **DIN 31635 support as a genuine second input/output scheme**, not just documentation. New
  conversion layer `src/core/transliteration/din31635.ts` (`dinToBrill`, `brillToDin`,
  `containsDin31635Chars`) converts between DIN 31635 and Brill spelling without ever modifying
  `legacyEngine.mjs` (see ADR-007). The Converter now has a Brill/DIN 31635 scheme selector for
  Latin input, and `ConversionOutput` always includes both `brillLatin` and `dinLatin` regardless
  of which scheme was used. `TransliterationScheme` and `BatchService` were widened accordingly
  (batch CSV/TSV processing accepts `din31635` transparently). Verified by 45 new tests in
  `tests/core/din31635.test.ts` and 9 in `tests/services/transliterationService.test.ts` (138
  tests total, up from 84) — every mapping checked against the real engine, not asserted from
  documentation.
- **Three-way virtual keyboard**: the Converter's keyboard now has Latin (Brill), DIN 31635, and
  Arabic tabs. It auto-selects the tab matching the current direction/scheme, and can still be
  switched to any of the three manually at any time.
- `docs/adr/0007-din31635-support.md`, documenting the pre/post-processing-layer architecture
  decision (why `legacyEngine.mjs` was not touched).

### Changed

- **`docs/METHODOLOGY.md` and the in-app Methodology view were rewritten** to describe DIN 31635
  as a supported scheme (previously documented as unsupported, in the prior round of work): new
  "DIN 31635 is supported as a second input/output scheme" section, an added "Engine layers" step
  0, and revised "Known limitations" (the old "DIN not supported" item is replaced with the two
  narrower, real scoping notes: the `brillToDin()` tāʾ-marbūṭa heuristic's convention-specificity,
  and DIN's capital ẖ having no precomposed Unicode form).
- `CLAUDE.md`'s Transliteration Engine section documents the new layer 0 and the DIN/Brill
  mapping, and its Testing section adds a rule learned the hard way while building this feature:
  compare test expectations dynamically (`generateArabicHarakat('Jamal')`) rather than hand-typing
  Arabic-script literals, since combining-mark order is easy to get subtly wrong by eye.

### Fixed

- **Misattributed the ǧ/š/ġ/ḏ/ṯ/ẖ/ẗ characters as broken Brill alternates; they are DIN 31635**,
  a distinct, separately-cited German Oriental Society standard (e.g. used in Brockelmann's
  _GAL_), not a Brill/EI3 variant. `docs/METHODOLOGY.md` and the in-app Methodology view now
  correctly attribute these letters, add DIN 31635 as a fourth column in the standards-comparison
  table, and give a DIN → Brill digraph conversion table. The virtual keyboard, test comments,
  and "Known limitations" text were updated to match — the underlying (non-)behavior of the
  engine is unchanged, only its documentation.

### Added

- **Virtual keyboard** on the Converter view (`src/ui/components/VirtualKeyboard.tsx`): Latin
  diacritics (ā ī ū ṭ ṣ ḥ ḍ ẓ ḫ ʿ ʾ) and Arabic harakat tabs that insert at the caret. Only
  characters verified to round-trip through the engine are offered — see "Changed" below.
- **Advanced options panel** on the Converter view (`src/ui/components/AdvancedOptions.tsx`),
  exposing the transliteration engine's existing `BracketFixOptions` (repair stray brackets;
  choose how well-formed brackets are handled) instead of leaving them as build-time-only
  defaults.
- **Full Methodology view** (`src/ui/pages/MethodologyPage.tsx`): rewritten from a one-paragraph
  placeholder into a sectioned reference (Brill standard, full character table, engine layers,
  orthographic notes, known limitations, references) with a sticky, scroll-spy table of contents.
- 20 new regression tests in `tests/core/transliteration.test.ts`: a full sun-letter assimilation
  matrix (all 14 sun letters, plus a moon-letter control), verified character alternates (kh/ḫ,
  backtick→ʿ, apostrophe→ʾ), and two characterisation tests locking in real engine gaps (see
  "Changed" below) so they can't regress silently or be "fixed" without a deliberate decision.
- `CONTRIBUTING.md` and this `CHANGELOG.md`.
- `docs/adr/0001` through `0006`, documenting the React/SPA/Tailwind migration and the prior
  legacy-engine, localStorage, and Papa Parse decisions that previously existed only as
  references in `docs/ARCHITECTURE.md`.

### Changed

- **Rebuilt the entire UI layer on React 19 + Tailwind CSS v4**, replacing the original
  four-page vanilla-TypeScript/DOM-manipulation UI with a single-page app. See
  [ADR-001](docs/adr/0001-react-spa.md), [ADR-002](docs/adr/0002-single-page-app.md), and
  [ADR-006](docs/adr/0006-tailwind-design-system.md). `src/core/`, `src/services/`, and
  `src/shared/` needed no changes — confirming the original layering was framework-agnostic.
- **Corrected `docs/METHODOLOGY.md`**: the character table and EI2/EI3 section previously claimed
  `dj`/`j` and `š`/`sh`, `ġ`/`gh` were fully interchangeable. Expanding test coverage surfaced that
  the legacy engine only implements the _doubled_ (shadda/gemination) forms of these alternates —
  a standalone `dj`, `š`, or `ġ` does not convert as documented. The table, the EI2/EI3 note, and
  "Known limitations" now describe verified behaviour, with `j`/`sh`/`gh`/`kh` as the recommended
  single-occurrence input forms. Per `CLAUDE.md`'s rule on `legacyEngine.mjs`, this is documented
  rather than silently patched.
- Applied the "Manuscript Scholarly System" design reference more fully: added the `Noto Serif`
  scholarly display font (`font-serif` utility) to page/section headings and the header logo, a
  `--color-scholargold` accent token for warning/highlight UI, and increased Arabic line-height
  for legibility with ḥarakāt.
- Converter UX: segmented direction toggle, an inline ambiguous-input warning (heuristic, checked
  live as you type in Arabic→Latin mode), primary-result highlighting, and clickable history rows
  that reload a past conversion.
- Consolidated the four separate HTML entry points (`index.html`, `batch.html`,
  `dictionary.html`, `methodology.html`) into one SPA entry point.
- Rewrote `README.md` and `CLAUDE.md` to describe the new architecture and tech stack.

## [0.1.0]

- Initial release: vanilla-TypeScript, multi-page (Vite multi-entry) static app. Brill →
  Arabic converter, batch CSV processing, user dictionary, bilingual (AR/EN) UI, and a
  methodology reference page.
