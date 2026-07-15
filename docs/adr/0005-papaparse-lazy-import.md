# ADR-005: Papa Parse for CSV/TSV, lazily imported

## Status

Accepted.

## Context

Batch processing (`src/services/BatchService.ts`) needs to parse arbitrary user-uploaded CSV/TSV
files: quoted fields, mixed delimiters, header-row column resolution, and large files processed
without blocking the main thread. Hand-rolling a CSV parser would reintroduce edge cases (quoting,
embedded commas/newlines) that a mature library already handles, and every other view
(`converter`, `dictionary`, `methodology`) never touches CSV at all.

## Decision

Use **Papa Parse** (`papaparse`) for CSV/TSV parsing, and import it lazily
(`await import('papaparse')`) inside `processCsvFile` rather than as a static top-level import.
Use its streaming `step` callback (not `complete`-only parsing) so large files can report
per-row progress without holding the entire parsed result in memory at once mid-parse.

## Consequences

- **Positive:** the ~20KB (gzipped ~7KB) Papa Parse chunk is only fetched when a user actually
  opens the Batch view and triggers a parse — the Converter, Dictionary, and Methodology views
  never pay this cost.
- **Positive:** row-level progress callbacks and per-row error isolation come from the library
  for free, rather than being reimplemented.
- **Neutral:** this is the only third-party runtime dependency in `src/services/` or `src/core/`
  — everything else in those layers uses only browser/Node built-ins, keeping the dependency
  surface of the domain logic intentionally small.
