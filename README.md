# ArabName Toolkit

A free, open-source, fully client-side toolkit for converting Brill-transliterated Arabic
personal names to Arabic script — with and without diacritics — for academic researchers in
Islamic studies, history, and prosopography.

**No backend. No database. No tracking.** Everything runs in your browser; the only persistence
is `localStorage` on your own machine. [Try it live](https://talmurshidi.github.io/arabname-toolkit/).

## Why this exists

Scholars working with prosopographical databases, biographical dictionaries, and critical
editions routinely need to move between the Brill Latin transliteration used in Western
Islamic-studies publishing (e.g. _Encyclopaedia of Islam_, 3rd ed.) and fully-vocalised Arabic
script. Doing this by hand is slow and error-prone; existing tools are either paid,
server-dependent, or not scoped to personal names. ArabName Toolkit ports the transliteration
engine from a production prosopography application (TabaqatPerfect) into a small, auditable,
static web app that anyone can run offline or fork.

## Features

- **Converter** — type Brill or DIN 31635 transliterated Latin text and get Arabic script both
  with diacritics (ḥarakāt) and without, a normalised display form, and an index sort key. Output
  always includes both the Brill and DIN 31635 Latin spellings. A built-in virtual keyboard
  (Latin/Brill, DIN 31635, Arabic tabs) helps type special characters. Also converts in reverse:
  fully-diacritised Arabic → Latin (both schemes).
- **Batch processing** — upload a CSV/TSV of names and convert hundreds at once; download
  results as CSV or JSON.
- **User dictionary** — add your own Latin → Arabic overrides, layered on top of the built-in
  curated dictionary; export/import as JSON.
- **History** — the last 50 conversions are kept locally so you can revisit recent work.
- **Bilingual UI** — Arabic (default, RTL) and English, with a persistent locale preference.
- **Methodology view** — documents the transliteration standard, engine layers, and known
  limitations.

## Tech stack

React 19 (function components + hooks), Vite 6, TypeScript (strict), Tailwind CSS v4 — a single
static-site build with no server, no meta-framework, and no client-side router (see
[`docs/adr/`](docs/adr/) for why). The transliteration engine and browser-storage services are
plain TypeScript with no framework dependency at all, so they're testable in isolation and would
survive a future UI-framework change (as they already have once — see
[ADR-001](docs/adr/0001-react-spa.md)).

## Getting started

Requirements: Node.js ≥ 22, npm ≥ 10.

```bash
git clone https://github.com/talmurshidi/arabname-toolkit.git
cd arabname-toolkit
npm ci
npm run dev
```

Then open the printed local URL (default `http://localhost:5173`).

### Common commands

| Command                                     | Purpose                                                                     |
| ------------------------------------------- | --------------------------------------------------------------------------- |
| `npm run dev`                               | Vite dev server with live reload                                            |
| `npm run build`                             | Typecheck + production build → `dist/`                                      |
| `npm run preview`                           | Preview the production build locally                                        |
| `npm run typecheck`                         | Strict TypeScript checks                                                    |
| `npm run lint`                              | oxlint (`--deny-warnings`)                                                  |
| `npm run format` / `format:check`           | Prettier                                                                    |
| `npm test` / `test:watch` / `test:coverage` | Vitest                                                                      |
| `npm run docs:tree` / `docs:tree:check`     | Regenerate/verify `PROJECT_TREE.md`                                         |
| `npm run find-degraded`                     | Scan for likely-degraded transliteration candidates (see `docs/reference/`) |
| `npm run verify`                            | Full gate: format, lint, typecheck, test, docs tree, build                  |

Always run `npm run verify` before opening a pull request.

## How it works

The transliteration engine is layered — sourced corrections first, then a curated dictionary,
then a character-level Brill regex engine, then bracket repair and house-style post-processing.
See [`docs/METHODOLOGY.md`](docs/METHODOLOGY.md) for the full standard, sources, and citation
guidance, and the in-app **Methodology** view for the public-facing summary.

The codebase is layered so that domain logic never depends on the UI framework: pure `core/` →
browser-aware `services/` → React `ui/`. See [`CLAUDE.md`](CLAUDE.md) and
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the full diagram and rules. Individual
architecture decisions are recorded in [`docs/adr/`](docs/adr/).

## Documentation

- [`docs/METHODOLOGY.md`](docs/METHODOLOGY.md) — transliteration standard, sources, engine
  layers, known limitations, citation guidance.
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — layering diagram and links to individual ADRs.
- [`docs/adr/`](docs/adr/) — architecture decision records.
- [`docs/reference/degraded-transliteration-candidates.md`](docs/reference/degraded-transliteration-candidates.md) —
  worklist of inputs flagged for manual source verification.
- [`PROJECT_TREE.md`](PROJECT_TREE.md) — auto-generated map of every module and its exports.
- [`CLAUDE.md`](CLAUDE.md) — contributor/agent guidance: project structure, conventions, and
  rules.
- [`CONTRIBUTING.md`](CONTRIBUTING.md) — how to propose changes, including dictionary/correction
  entries.
- [`CHANGELOG.md`](CHANGELOG.md) — notable changes by version.

## Deployment

The app is deployed to GitHub Pages via GitHub Actions (`.github/workflows/deploy.yml`), which
runs `npm run verify` and then publishes the `dist/` build. Do not push built assets to
`gh-pages` manually — the workflow will overwrite them.

## Contributing

Issues and pull requests are welcome — see [`CONTRIBUTING.md`](CONTRIBUTING.md). Before adding a
dictionary entry or a sourced correction, read the "Adding dictionary entries" and "Adding
sourced corrections" sections of [`CLAUDE.md`](CLAUDE.md): corrections must be verified against
a citable source, not guessed.

## License

[MIT](LICENSE) © Tam Almur.
