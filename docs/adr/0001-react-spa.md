# ADR-001: React (function components) + Vite, as a single-page app

## Status

Accepted (supersedes the original vanilla-TypeScript, multi-page-HTML approach).

## Context

The project was originally built as four hand-wired vanilla-TypeScript pages (`index.html`,
`batch.html`, `dictionary.html`, `methodology.html`), each with imperative DOM manipulation in
`src/ui/pages/*.ts`. That kept the dependency graph minimal, but four views' worth of manual DOM
diffing, event wiring, and locale re-rendering had become the single largest source of
boilerplate in the codebase, and made shared UI state (locale, direction toggle, dictionary
cache) awkward to keep in sync across pages that each reload independently.

The project remains a **static, client-side-only app** (see ADR-004): no server, no build-time
data fetching, nothing that needs a meta-framework.

## Decision

Use **React 19** (function components + hooks only, no class components) with **Vite** as the
build tool, rendered as a **single-page app** (one HTML entry point, in-memory view switching —
see ADR-002). Styling uses **Tailwind CSS v4** via `@tailwindcss/vite` (see ADR-006).

The domain and browser-integration layers are unaffected by this decision:

- `src/core/` — pure functions, framework-agnostic, unchanged.
- `src/services/` — thin browser-API wrappers (`localStorage`, CSV parsing), framework-agnostic,
  unchanged.
- `src/shared/` — types and utilities, unchanged.

Only `src/ui/` changes shape: `src/ui/pages/*.tsx` (React components instead of imperative DOM
modules), `src/ui/components/*.tsx` (Header/Footer), `src/ui/i18n/` (locale store, now exposed to
React via `src/ui/hooks/useLocale.ts`, a thin `useSyncExternalStore` binding — the store itself
stays framework-agnostic so it's still unit-testable without React).

## Consequences

- **Positive:** shared app state (locale, current view) lives in one component tree instead of
  being re-derived per page load; components are composable and independently testable;
  `lucide-react` gives a consistent icon set instead of hand-rolled SVGs; the ecosystem of
  React tooling (React DevTools, testing libraries) becomes available.
- **Negative:** a heavier dependency footprint than vanilla TS (React + ReactDOM +
  `@vitejs/plugin-react`); a client-side render step is now required (mitigated by staying a fully
  static SPA — no SSR, no hydration mismatch surface).
- **Neutral:** `src/core` and `src/services` needed **zero changes** to support this migration —
  confirmation that the original layering (ADR-003 in spirit) was doing its job.
