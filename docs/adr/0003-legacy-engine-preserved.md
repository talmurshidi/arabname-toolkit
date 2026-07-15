# ADR-003: `legacyEngine.mjs` is preserved exactly as ported

## Status

Superseded by [ADR-010](0010-retire-legacy-engine.md) — `legacyEngine.mjs` has been ported to a
typed, data-driven implementation under `src/core/transliteration/brill/` and is no longer
imported by anything in `src/`. This ADR is kept for historical context: the caution it
establishes (don't edit linguistically load-bearing regex without a real justification and a
test) still applies to the ported engine, and the _reasoning_ about why the original file was
risky to edit directly is exactly what motivated the mechanical, diff-validated porting approach
in ADR-010.

## Context (historical)

The following describes the situation as it stood before ADR-010's migration.

The character-level Brill → Arabic regex engine in `src/core/transliteration/legacyEngine.mjs`
was ported directly from a production Electron application (TabaqatPerfect), where its rules
encode years of corrections against real scholarly names — i.e. they are **linguistic domain
knowledge**, not incidental implementation detail. The regex rules are dense and not always
self-explanatory from the code alone.

## Decision

- `legacyEngine.mjs` is treated as a **vendored, load-bearing artifact**. It is excluded from
  `oxlint` and strict TypeScript checking (kept as `.mjs`, not rewritten to `.ts`).
- Changes to its rules require understanding the linguistic rationale first — "cleaning up" the
  regexes without that context is explicitly out of scope for routine refactors.
- All public access goes through `src/core/transliteration/index.ts`, which layers sourced
  corrections and the curated dictionary _in front of_ the legacy engine (see
  `docs/ARCHITECTURE.md`), so most new entries never require touching the engine itself.

## Consequences

- **Positive:** the highest-risk, hardest-to-verify code is isolated and clearly flagged; new
  contributors are steered toward the safer extension points (`corrections.ts`, `dictionary.ts`)
  instead of editing the regex engine.
- **Negative:** the file is exempt from the project's normal lint/format/type-safety guarantees,
  so bugs inside it are not caught by static analysis — only by the Vitest regression suite
  (`tests/core/`). New regressions discovered in production must be captured as a named test
  (see `CLAUDE.md` → Testing).
