# ADR-002: Single-page app (one HTML entry point)

## Status

Accepted (supersedes the original four-entry-point Vite build).

## Context

The original app shipped four separate HTML pages, each a distinct Vite build input
(`index.html`, `batch.html`, `dictionary.html`, `methodology.html`), navigated between via plain
`<a>` tags — i.e. full page reloads. Locale preference and dictionary cache were re-read from
`localStorage` on every navigation, and there was no shared in-memory state across views.

## Decision

Serve a **single HTML entry point** (`index.html`) and switch between views (`converter`,
`batch`, `dictionary`, `methodology`) with in-memory React state (`useState<View>` in `App.tsx`).
No client-side router is introduced — the four views are not distinct enough in URL-addressing
needs to justify one, and adding `react-router` (or similar) would be dependency weight without a
corresponding user benefit for a four-tab tool. If deep-linking to a specific view becomes a
requirement, this can be revisited with the `history`/`URL` APIs directly rather than pulling in
a router.

## Consequences

- **Positive:** no full-page reload when switching views; locale and in-memory caches persist
  across navigation; simpler Vite config (`build.rollupOptions.input` no longer needed — Vite's
  default single-entry build applies).
- **Negative:** the four views are no longer independently deep-linkable by URL (e.g.
  `batch.html` no longer exists as a bookmarkable path). Acceptable for this tool's usage pattern;
  revisit if analytics or user feedback show a need for shareable per-view URLs.
