# Architecture

## Deployment target

GitHub Pages (static hosting). No server, no backend, no database. The built `dist/` directory
is deployed via GitHub Actions (`.github/workflows/deploy.yml`).

## Layer diagram

```
┌───────────────────────────────────────────────┐
│  index.html  ← single Vite entry point (SPA)  │
├───────────────────────────────────────────────┤
│  src/App.tsx  ← view routing (in-memory state) │
│  src/ui/pages/      ← React view components    │
│  src/ui/components/ ← Header, Footer            │
│  src/ui/hooks/      ← useLocale (React binding) │
│  src/ui/i18n/       ← framework-agnostic locale  │
│                        store + string tables     │
├───────────────────────────────────────────────┤
│  src/services/  ← browser APIs only             │
│   (localStorage, crypto.randomUUID, Papa Parse) │
│   No DOM/React dependency — unit-testable alone │
├───────────────────────────────────────────────┤
│  src/core/  ← pure functions                    │
│   No side effects. No browser/Node/React APIs.  │
│   Safe to run in Node (Vitest).                 │
├───────────────────────────────────────────────┤
│  src/shared/  ← types + pure utilities          │
│   No imports from any other src/ module.        │
└───────────────────────────────────────────────┘
```

Each layer may only import from the layers below it. `src/ui/` is the only layer aware of React;
`src/services/` and `src/core/` remained **unchanged** across the ADR-001 migration to React,
which is the practical proof that this layering does its job — swapping the entire UI framework
required touching only the top layer.

## Key decisions

Individual architecture decisions are recorded as ADRs in [`docs/adr/`](adr/):

- [ADR-001: React (function components) + Vite, as a single-page app](adr/0001-react-spa.md)
- [ADR-002: Single-page app (one HTML entry point)](adr/0002-single-page-app.md)
- [ADR-003: `legacyEngine.mjs` preserved as-is](adr/0003-legacy-engine-preserved.md) — _superseded by ADR-010_
- [ADR-004: `localStorage` only (no IndexedDB/backend)](adr/0004-localstorage-only.md)
- [ADR-005: Papa Parse for CSV, lazily imported](adr/0005-papaparse-lazy-import.md)
- [ADR-006: Tailwind CSS v4 and the "parchment" design system](adr/0006-tailwind-design-system.md)
- [ADR-007: DIN 31635 support via a pre/post-processing layer](adr/0007-din31635-support.md)
- [ADR-008: Position-aware orthographic pre-normalization; relaxed diacritization gate](adr/0008-orthography-fixes.md)
- [ADR-009: Reverse-direction scheme selection; unified history; scheme-mismatch warning](adr/0009-reverse-scheme-and-history.md)
- [ADR-010: Retire `legacyEngine.mjs`; port to a typed, data-driven engine](adr/0010-retire-legacy-engine.md)

When a new architectural decision is made, add a new numbered file to `docs/adr/` following the
same Status/Context/Decision/Consequences structure, and link it from the list above.
