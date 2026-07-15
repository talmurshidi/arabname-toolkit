# ADR-004: `localStorage` only — no IndexedDB, no backend

## Status

Accepted.

## Context

The app persists three kinds of user data: conversion history (`HistoryService`, capped at 50
entries), user dictionary overrides (`DictionaryService`), and the locale preference
(`src/ui/i18n`). None of this data is large, relational, or queried in complex ways, and the
project's deployment target is static GitHub Pages hosting (see `docs/ARCHITECTURE.md`) — there
is no server to sync to.

## Decision

Use `window.localStorage` as the only persistence mechanism. Do not introduce IndexedDB, a
backend API, or a sync service. Each service (`HistoryService`, `DictionaryService`) namespaces
its own key(s) (`ant:history`, `ant:user-dictionary`) and owns its own serialization.

## Consequences

- **Positive:** zero infrastructure, zero network dependency, trivially auditable (a user can
  open DevTools and read exactly what's stored); works fully offline once loaded.
- **Negative:** data is per-browser, per-device — there is no cross-device sync. Users who want
  to move their dictionary between machines must use the existing export/import JSON feature
  (`DictionaryService.exportJson` / `importJson`) manually.
- **Negative:** `localStorage` has a practical ~5–10MB origin quota. Acceptable at current scale
  (history capped at 50 entries; dictionaries are curated by hand); revisit if a future feature
  needs bulk storage (e.g. large batch-processing caches).
