# Methodology

Reference documentation for maintainers and power users. The public-facing summary lives in the
in-app Methodology view (`src/ui/pages/MethodologyPage.tsx`), reachable from the nav in the app.

## Transliteration standard

The converter implements the Brill transliteration system as used in _Encyclopaedia of Islam_ (3rd edition, "EI3"). This is the standard most commonly used in English-language Islamic studies scholarship, and the one this project's source engine (TabaqatPerfect) was built against.

### Source of the standard

- **Primary source:** Brill's house transliteration table for Arabic, as published in the front matter of _Encyclopaedia of Islam, THREE_ (Kate Fleet, Gudrun Krämer, Denis Matringe, John Nawas, Everett Rowson, eds., Leiden: Brill, 2007–), and carried over from the equivalent table in _Encyclopaedia of Islam, Second Edition_ (P. Bearman et al., eds., Leiden: Brill, 1960–2005), s.v. "Introduction / Transliteration." Brill publishes this table on its website under "Translation and Transliteration Guides" for EI3 contributors; consult the current EI3 author guidelines for the authoritative table.
- **Secondary cross-reference:** the _International Journal of Middle East Studies_ (IJMES) transliteration and translation guide (Cambridge University Press, published on the journal's website as the "IJMES Translation and Transliteration Guide"), which is largely Brill-compatible for Arabic but diverges on a few points (see comparison table below).
- **Secondary cross-reference:** the American Library Association–Library of Congress (ALA-LC) _Arabic Romanization Table_ (Library of Congress, Policy and Standards Division, ala-lc.org), used by North American research libraries for catalogue records. ALA-LC is **not** the target standard of this tool but is the system most likely to appear in library metadata that researchers copy names from, so its main divergences are noted below to help users recognise when pre-normalisation is needed.

### EI2 vs. EI3

The two editions' Arabic tables are substantively the same (same underdots, same macrons, same `ʿ`/`ʾ` for ʿayn/hamza). The most visible difference affecting personal names is the treatment of ج: EI2 house style traditionally rendered it as `dj`, while EI3 and most contemporary English-language usage favour the simpler `j`. **Input `j`** for ج — it is the form this engine's rules actually implement. A standalone `dj` is accepted by some curated dictionary entries (which spell it that way verbatim) but is **not** a general alias for `j` in the character-level engine; see "Known limitations" below before relying on it for text drawn from EI2-style sources.

### Comparison with IJMES, ALA-LC, and DIN 31635 (informational only)

The engine's native alphabet is Brill/EI3. The table below is provided so that users transcribing from a library catalogue (ALA-LC) or an IJMES-formatted manuscript know which characters to convert before pasting into this tool — the engine does **not** auto-detect or auto-convert from either of those two systems. **DIN 31635 is the one exception**: select "DIN 31635" as the input scheme in the Converter and these seven letters are converted automatically — see the dedicated section below.

| Arabic | Brill (this tool)                    | IJMES             | ALA-LC                                                   | DIN 31635 |
| ------ | ------------------------------------ | ----------------- | -------------------------------------------------------- | --------- |
| ح      | ḥ                                    | ḥ                 | ḥ                                                        | ḥ         |
| خ      | kh                                   | kh                | kh                                                       | ẖ         |
| ذ      | dh                                   | dh                | dh                                                       | ḏ         |
| ش      | sh                                   | sh                | sh                                                       | š         |
| ع      | ʿ (U+02BF)                           | ʿ                 | ʻ (different turned-comma glyph in some library systems) | ʿ         |
| غ      | gh                                   | gh                | gh                                                       | ġ         |
| ث      | th                                   | th                | th                                                       | ṯ         |
| ج      | j (dj not a reliable alias)          | j                 | j                                                        | ǧ         |
| ة      | a (ending, -at in construct)         | a / at            | ah (word-final tāʾ marbūṭa)                              | ẗ         |
| ال-    | al- (assimilated before sun letters) | al- (assimilated) | al- (not assimilated in cataloguing practice)            | al-       |

Sources: IJMES guide as above; ALA-LC _Arabic Romanization Table_ as above; DIN 31635 as cited in the next section. Where a researcher's source material already uses ALA-LC (e.g. a name copied from a WorldCat or Library of Congress record), the most common pre-normalisation needed before pasting into this tool is: convert word-final `ah` (tāʾ marbūṭa) to the Brill bare `a`, and re-apply sun-letter assimilation to `al-` if the catalogue record left it unassimilated.

### DIN 31635 is supported as a second input/output scheme

**DIN 31635** ("Information und Dokumentation — Umschrift des arabischen Alphabets," Deutsches Institut für Normung e.V., 2011) is the transliteration convention standard in German-language Arabic and Islamic studies — used in, for example, Brockelmann's _Geschichte der arabischen Litteratur_ (GAL) and much of the _Encyclopaedia of Islam_'s German-language scholarly antecedents. It shares Brill's macron/underdot vowel and emphatic-consonant letters (ā, ḥ, ṣ, ḍ, ṭ, ẓ, ʿ, ʾ) but uses single Unicode letters with a caron or macron — **ǧ, š, ġ, ḏ, ṯ, ẖ, ẗ** — where Brill uses digraphs (j, sh, gh, dh, th, kh, and bare -a for tāʾ marbūṭa).

**The engine's Arabic conversion always operates on Brill spelling internally** (see ADR-003/ADR-010 — the Brill engine's rules are not made DIN-aware). DIN 31635 is supported as a second input/output scheme via a dedicated conversion layer, `src/core/transliteration/din31635.ts`, which sits in front of the existing pipeline (see "Engine layers" below):

- **`dinToBrill()`** converts DIN-spelled input to Brill spelling before it reaches the pipeline, so choosing "DIN 31635" as the input scheme in the Converter produces byte-for-byte the same Arabic as typing the Brill-digraph equivalent.
- **`brillToDin()`** converts Brill-spelled output back to DIN spelling, so both `brillLatin` and `dinLatin` are always available in the conversion result regardless of which scheme you typed in.

| DIN 31635 | ⇄ Brill                                            |
| --------- | -------------------------------------------------- |
| ǧ         | j (both single and doubled — `j`/`jj`)             |
| š         | sh (both single and doubled — `sh`/`shsh`)         |
| ġ         | gh (both single and doubled — `gh`/`ghgh`)         |
| ḏ         | dh                                                 |
| ṯ         | th                                                 |
| ẖ         | kh (`ḫ` also works natively — see character table) |
| ẗ         | a (bare, word-final tāʾ marbūṭa)                   |

Verified by the regression suite (`tests/core/din31635.test.ts`, 45 tests) and `tests/services/transliterationService.test.ts`: every one of the seven letters — single and geminated — produces Arabic identical to the equivalent Brill spelling. Two things worth knowing:

- DIN's capital ẖ has no precomposed Unicode codepoint (German typesetting renders it as H + a combining macron below, U+0331); the virtual keyboard and `dinToBrill()` both handle this combining sequence directly.
- `brillToDin()`'s word-final bare-"a" → ẗ rule is specific to this project's Brill convention (any word-final bare "a" is tāʾ marbūṭa — see the character table below); it is not a general-purpose Brill-text analyser and assumes text already conforms to that convention.

### Character table (Brill)

| Arabic | Brill Latin          | Notes                                                                                                                                                                                 |
| ------ | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ا      | ā                    | Long alif                                                                                                                                                                             |
| ب      | b                    |                                                                                                                                                                                       |
| ت      | t                    |                                                                                                                                                                                       |
| ث      | th                   |                                                                                                                                                                                       |
| ج      | j (recommended) / dj | `j` is the reliable Brill input (single or doubled); a standalone (non-doubled) `dj` is not a reliable alias. For DIN 31635's `ǧ`, use the DIN 31635 input scheme instead — see above |
| ح      | ḥ                    | Underdot                                                                                                                                                                              |
| خ      | kh / ḫ               | Both accepted and interchangeable                                                                                                                                                     |
| د      | d                    |                                                                                                                                                                                       |
| ذ      | dh                   |                                                                                                                                                                                       |
| ر      | r                    |                                                                                                                                                                                       |
| ز      | z                    |                                                                                                                                                                                       |
| س      | s                    |                                                                                                                                                                                       |
| ش      | sh                   | Reliable Brill input (single or doubled). `š` is DIN 31635, not Brill — select the DIN 31635 input scheme to use it                                                                   |
| ص      | ṣ                    | Underdot                                                                                                                                                                              |
| ض      | ḍ                    | Underdot                                                                                                                                                                              |
| ط      | ṭ                    | Underdot                                                                                                                                                                              |
| ظ      | ẓ                    | Underdot                                                                                                                                                                              |
| ع      | ʿ                    | Turned comma (U+02BF)                                                                                                                                                                 |
| غ      | gh                   | Reliable Brill input (single or doubled). `ġ` is DIN 31635, not Brill — select the DIN 31635 input scheme to use it                                                                   |
| ف      | f                    |                                                                                                                                                                                       |
| ق      | q                    |                                                                                                                                                                                       |
| ك      | k                    |                                                                                                                                                                                       |
| ل      | l                    |                                                                                                                                                                                       |
| م      | m                    |                                                                                                                                                                                       |
| ن      | n                    |                                                                                                                                                                                       |
| ه      | h                    |                                                                                                                                                                                       |
| و      | w / ū                | Consonant w; long vowel ū                                                                                                                                                             |
| ي      | y / ī                | Consonant y; long vowel ī                                                                                                                                                             |
| ء      | ʾ                    | Hamza (U+02BE)                                                                                                                                                                        |
| ة      | a (ending)           | Tāʾ marbūṭa                                                                                                                                                                           |
| الـ    | al-                  | Definite article; sun-letter assimilation applied by engine                                                                                                                           |

### Shadda (gemination)

Doubled consonants in Latin map to shadda (ّ) in Arabic. Examples: `mm` → مّ, `ll` → لّ, `Muḥammad` → مُحَمَّد.

### The definite article

`al-` before a sun letter triggers assimilation in the Arabic output (e.g., `al-Raḥmān` → الرَّحْمَان). The legacy engine handles this via a post-processing regex block applied only when the word begins with `ال`.

## Engine layers

### 0. DIN 31635 normalisation (`din31635.ts`) — only when that scheme is selected

Runs before layer 1, and only when the user selects "DIN 31635" as the input scheme (Brill-scheme input skips this layer entirely). Converts the seven DIN-specific letters (ǧ š ġ ḏ ṯ ẖ ẗ) to their Brill digraph equivalents, so every layer below it only ever sees Brill spelling — the Brill engine (`brill/`) is never modified or made DIN-aware (see ADR-003, ADR-007, ADR-010). The same module's `brillToDin()` runs in the opposite direction, as a final formatting step after layer 6, to populate the DIN 31635 Latin output alongside the Brill one.

**When to add mappings here:** only if DIN 31635 itself gains a new edition with different letters — this is a fixed, standardised alphabet, not a place for judgment calls. Do not add heuristics for other romanisation systems here; see "Known limitations" for why IJMES/ALA-LC are handled differently (as documentation, not code).

### 0.5. Position-aware orthographic normalisation (`orthographyNormalization.ts`)

Runs after standard normalisation, before dictionary matching (see ADR-008). Two rules:

- **`applyIbnAlifRule()`** — ابن ("ibn") keeps its alif only as the first word of a name
  ("Ibn Khaldūn"); between two names (the patronymic position — "Muḥammad ibn ʿAbdallāh") the alif
  is elided per standard orthography. The dictionary's single-word "Ibn" entry has no position
  awareness, so this rule rewrites a non-initial "Ibn"/"ibn" to "bn" before dictionary matching —
  verified that "bn" alone already produces the correct بْن with no dictionary entry needed.
- **`applyElidedArticleRule()`** — normalises Brill's elided-pronunciation article spelling
  ("Abū l-Qāsim" / "Abū 'l-Qāsim") to the orthographic "al-" form, since Arabic script always
  writes the article's alif regardless of connected-speech elision (unlike "ibn"'s alif, which is
  a genuine writing-convention elision, not just pronunciation).

### 1. Sourced corrections (`corrections.ts`)

Checked first, before any other processing. Each entry is an exact-match key (the literal string a user typed) mapped to a verified Arabic form with a source citation.

**When to add:** When the stored/input Latin string cannot be fixed by the dictionary or legacy engine — e.g., because diacritics were lost at data-entry time and the string's "correct" form is now ambiguous from the Latin alone.

**When NOT to add:** Do not add guesses. If no citable source is available, leave the candidate in the worklist file.

### 2. Curated dictionary (`dictionary.ts`)

A hand-curated map of common name compounds (e.g., `ʿAbd al-Raḥmān`, `Abū Bakr`, `al-Bukhārī`) to their vocalized Arabic forms. The dictionary is matched greedily — longer multi-word sequences win over shorter prefixes. This means `Abū Bakr` matches as one unit rather than `Abū` + `Bakr` separately.

**When to add:** When a name or compound appears frequently enough to warrant a curated entry — particularly where the legacy engine would produce a suboptimal or incorrect result (e.g., unusual nisba forms, non-standard etymologies).

### 3. Brill engine (`brill/`)

Character-level rules covering the full Brill table, in `src/core/transliteration/brill/`: a small set of {Latin, Arabic} data tables (`consonantTable.ts`) driving two shared templates (`consonantTemplates.ts`) for the ~530 regular gemination and single-occurrence consonant rules, plus separate modules for the genuinely irregular rules (`irregularRules.ts`, `sunLetterAssimilation.ts`, `bracketArticleFix.ts`). Handles any word not matched by the dictionary. The output is then post-processed by the house-style layer.

Ported from an earlier file, `legacyEngine.mjs` (now retired — see ADR-010), which is kept in the repository purely as an equivalence oracle for `tests/core/brillEngineParity.test.ts` and is no longer imported by anything else.

**Do not edit** the rules in `brill/` without a linguistic justification and a regression test. The ordering of rule application in `engine.ts` is intentional — earlier rules take priority over later ones.

### 4. Bracket sanitizer (`bracketSanitizer.ts`)

Runs before the dictionary and legacy passes. Repairs stray unmatched brackets. Preserves well-formed balanced brackets verbatim — these represent genuine scholarly editorial notations (e.g., `(Zajjaj?)` meaning "attributed to Zajjāj, with doubt").

### 5. Yā-sukūn house style (`arabicHouseStyle.ts`)

Post-processing pass on the combined output. Applies the project's convention: a medial long-ī (كَسْرَة + ي not followed by another diacritic) takes a sukūn. A word-final long-ī does not. Long-ū (و) is never given a sukūn.

### 6. Reverse direction: Arabic → Latin (`arabicToLatin.ts`)

A character-level inverse of the legacy engine's productive rules: consonant + short-vowel clusters, mater-lectionis long vowels (fatha+alif, damma+wāw, kasra+yāʾ), shadda gemination, tāʾ marbūṭa, hamza seats, and the definite article. It is deliberately scoped to **fully diacritised** Arabic input, gated by `looksFullyDiacritized()` — but "fully diacritised" is defined as _matching this project's own forward-engine convention_, not requiring every possible mark: a word-final consonant may be bare (pausal form — this is what the forward engine itself produces, e.g. "Bakr" → بَكْر), the definite article's lām is never expected to carry a mark of its own (neither moon nor sun letter case), and a mid-word و/ي acting as a mater-lectionis long vowel (e.g. the و in "Khaldūn" → خَلْدُون) carries no mark either — the vowel mark sits on the _preceding_ consonant instead. An internal bare consonant that is none of these is still rejected as genuinely ambiguous. See ADR-008 for the full rationale, the sun-letter-assimilation-vs-true-gemination distinction `convertWord()` makes when reading a shadda immediately after the article, and the forward engine's inconsistent shadda/vowel-mark ordering that the reverse parser now tolerates.

The reverse direction does not attempt to invert the legacy engine's irregular whole-word substitutions character-by-character (e.g. `ʿAbdallāh`, `Abū`) — those come back as their literal phonetic spelling rather than the historical orthographic convention. **One exception:** ابن/بن ("ibn") is looked up as a whole word and always reversed to `ibn` — Brill convention keeps the epenthetic vowel in the Latin spelling in both the name-initial (`ابْن`) and medial (`بْن`) Arabic spellings, even though only the initial position keeps the alif in Arabic script (see ADR-008 and `IRREGULAR_REVERSE_WORDS` in `arabicToLatin.ts`).

`TransliterationService.convertReverse(text, preferredScheme?)` runs `brillToDin()` on the result to populate both Latin outputs, and accepts an optional preferred scheme (`'brill'` by default) that becomes the result's `scheme` field — the Converter's Brill/DIN 31635 selector works in both directions, not just Latin → Arabic.

## Known limitations

1. **Arabic → Latin requires diacritics matching this project's forward-engine convention.** A word-final consonant may be left bare (pausal form) and the definite article's lām is never marked — both accepted, since that's what the forward engine itself produces (see "Reverse direction" above and ADR-008). Any _other_ undiacritised or partially-diacritised Arabic still lacks the information needed for unambiguous Brill output, so the reverse converter rejects it and warns rather than guessing.

2. **Input without diacritics degrades gracefully but imprecisely.** "Abu Bakr" (without macron) goes through the legacy engine and produces a plausible but not authoritative Arabic form. The `corrections.ts` layer exists specifically to rescue high-frequency degraded strings.

3. **Non-standard name forms.** Personal names sometimes appear in sources with non-Brill, non-DIN romanisation (IJMES, ALA-LC/LOC, or simplified media spellings). The engine supports Brill and DIN 31635 input natively; IJMES and ALA-LC require manual pre-normalisation (see the comparison table above).

4. **`ʿ` vs backtick vs ASCII apostrophe.** The `fixBrillChar()` function in the legacy engine normalises backtick (`` ` ``) to `ʿ` and ASCII apostrophe (`'`) to `ʾ`, so these common typing shortcuts are accepted. The correct Unicode characters (U+02BF, U+02BE) are always used in output.

5. **`brillToDin()`'s tāʾ marbūṭa detection is convention-specific, not a general parser.** It renders any word-final bare "a" (not preceded by a hyphen and not the macron ā) as DIN's ẗ, which is correct under this project's own Brill convention (see the character table) but would be wrong if applied to arbitrary free-form Latin text using a different convention. It is only ever applied to text this engine itself produced or accepted as input, so this is a scoping note rather than a bug.

6. **DIN 31635's capital ẖ has no precomposed Unicode form.** German typesetting represents it as H + a combining macron below (U+0331); `dinToBrill()` and the virtual keyboard both handle this two-character sequence, but pasted text using a _different_ visual workaround (e.g. a dot-below Ḫ, which is actually Brill's own alternate for kh) will not be recognised as DIN input — though it will still convert correctly, since `Ḫ`/`ḫ` are already native Brill characters.

7. **`applyIbnAlifRule()`'s "is this the first word" check is string-position-based, not semantic.** "Ibn"/"ibn" keeps its alif only when it is literally the first word of the _entire input string_. A name prefixed with an honorific or title before "Ibn" (e.g. a hypothetical "al-Shaykh Ibn Khaldūn") would have its "Ibn" treated as medial (alif dropped) even though it is arguably still functioning as the start of the proper name. This is a deliberate, simple, testable heuristic rather than a titles/honorifics parser; it covers the overwhelmingly common cases (name-initial "Ibn X", and medial "X ibn Y") correctly.

8. **The forward engine's shadda/vowel-mark ordering is not fully consistent across code paths.** Investigating the reverse-conversion fixes in ADR-008 found that the Brill engine (`brill/`, ported from `legacyEngine.mjs` — see ADR-010) sometimes writes a geminated consonant's marks as consonant+vowel+shadda (e.g. "مَّ") and sometimes as consonant+shadda+vowel (e.g. sun-letter assimilation in some inputs), depending on which rule produced it. The reverse parser (`readVowel()` in `arabicToLatin.ts`) now accepts both orders, so this doesn't affect round-tripping — but it means the _forward_ engine's own diacritic ordering isn't byte-for-byte predictable across all inputs. Normalising that ordering would need its own linguistic review (ADR-003); it hasn't been undertaken here since it doesn't affect correctness, only internal consistency.

9. **Scheme-mismatch detection is a heuristic, not a hard block.** The Converter warns (but still allows conversion) when "Latin (Brill)" is selected and the input contains a DIN 31635-specific letter (ǧ š ġ ḏ ṯ ẖ ẗ) — since Brill can't read those as single characters and the result would likely be corrupted. This only catches the "selected Brill, typed DIN" direction: there's no reliable equivalent check the other way, since Brill digraphs (`sh`, `kh`, etc.) are also perfectly valid, unambiguous input under the DIN 31635 scheme (the DIN scheme accepts _both_ its own single letters and Brill's shared digraphs) — so typing "Khalaf" instead of "ẖalaf" while DIN is selected is not an error worth flagging.

## Citing tool output

When citing converted Arabic forms in a publication, note the tool name, URL, and rule version string from the conversion result (e.g., `dictionary-v1-legacy-fallback-2.0.4`). The rule version is bumped whenever rules change in a way that could alter output for existing inputs.

## Worklist for degraded candidates

See `docs/reference/degraded-transliteration-candidates.md`. This file is auto-generated by `npm run find-degraded` (not yet wired into `verify` — it requires manual review). Do not edit it by hand; run the script to regenerate.

## References

Sources consulted for the transliteration standard and its comparison points. Corrections in `corrections.ts` must cite a source from this list (or an equivalent citable scholarly source) — see "Adding sourced corrections" in `CLAUDE.md`.

1. Brill. _Encyclopaedia of Islam, THREE_. Kate Fleet, Gudrun Krämer, Denis Matringe, John Nawas, and Everett Rowson, eds. Leiden: Brill, 2007–present. Transliteration table published in the front matter of each print/online fascicle and in Brill's EI3 author guidelines.
2. Bearman, P., Th. Bianquis, C.E. Bosworth, E. van Donzel, and W.P. Heinrichs, eds. _The Encyclopaedia of Islam, Second Edition_. Leiden: Brill, 1960–2005. Transliteration table in the general introduction, vol. I.
3. _International Journal of Middle East Studies_. "IJMES Translation and Transliteration Guide." Cambridge University Press. Published on the journal's official website; consulted for cross-reference on points of divergence from Brill (see comparison table above).
4. Library of Congress, Policy and Standards Division. _ALA-LC Romanization Tables: Arabic_. American Library Association and Library of Congress. Published at ala-lc.org; consulted for cross-reference with library-catalogue romanisation practice.
5. Deutsches Institut für Normung e.V. _DIN 31635:2011-07 — Information und Dokumentation: Umschrift des arabischen Alphabets_. Berlin: DIN, 2011. Source for the second supported input/output scheme — see "DIN 31635 is supported as a second input/output scheme" above.
6. TabaqatPerfect (unpublished internal prosopography application). Source of the ported Brill engine's character-level rules (originally in `legacyEngine.mjs`, retired — see ADR-010, now in `src/core/transliteration/brill/`); the rule set was originally developed against source 1/2 above and is treated in this project as encoding the same standard.

If a rule in the Brill engine (`src/core/transliteration/brill/`) appears to diverge from sources 1–2 above, do not silently "fix" it — open an issue describing the discrepancy with a citation, since the rule may encode a deliberate, sourced editorial decision from the original application.
