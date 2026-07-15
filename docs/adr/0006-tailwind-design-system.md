# ADR-006: Tailwind CSS v4 and the "parchment" design system

## Status

Accepted.

## Context

The original UI used a single hand-written stylesheet (`src/ui/styles/main.css`) with bespoke
class names per element. As the app grows past four views, a utility-first approach reduces the
amount of new bespoke CSS each new component needs, and a shared design language (colors,
typography, spacing) keeps the four views visually consistent without a component library.

A design exploration for this project (internally referred to as the "aistudio" prototype)
established a warm, academic/manuscript visual language — a parchment background, a serif Arabic
display font, a muted "scholar green" accent, and flat "hard shadow" card treatments — that suits
an academic-research tool better than a generic SaaS-blue theme.

## Decision

Adopt **Tailwind CSS v4** via `@tailwindcss/vite` (no PostCSS config file needed — v4 configures
itself through the Vite plugin and a single `@theme` block). Define the design system's tokens
once, in `src/index.css`:

- `--color-parchment`, `--color-parchment-dim`, `--color-scholargreen`,
  `--color-scholargreen-dark`, `--color-ink`, `--color-surface-container` — the palette, exposed
  as Tailwind utilities (`bg-parchment`, `text-scholargreen`, etc.) automatically by Tailwind v4's
  `@theme` mechanism.
- `--font-sans` (Inter, for UI chrome) and `--font-arabic` (Noto Naskh Arabic, applied via the
  `.arabic-text` utility class wherever Arabic script is rendered, regardless of the active UI
  locale — Arabic script content should never fall back to a Latin serif).
- `.hard-shadow` and `.brill-input:focus` — the two bespoke utilities that don't map cleanly to
  Tailwind's default utility set.

All new components (`Header`, `Footer`, `ConverterPage`, `BatchPage`, `DictionaryPage`,
`MethodologyPage`) are styled with Tailwind utility classes directly in JSX; no per-component
CSS Modules or styled-components layer is introduced.

## Consequences

- **Positive:** one source of truth for color/typography tokens; new components style themselves
  from the same palette with no copy-pasted hex values; smaller CSS output than a hand-written
  stylesheet at this component count (Tailwind only emits classes actually used).
- **Negative:** JSX class strings are more verbose than semantic class names; mitigated by
  keeping presentational components small and by extracting repeated patterns (e.g. `OutputCard`
  in `ConverterPage.tsx`) into local helper components rather than duplicating class strings.
- **Neutral:** `src/ui/styles/main.css` (the old hand-written stylesheet) is removed; a single
  `src/index.css` replaces it.

## Addendum

A follow-up design pass added `--font-serif` (Noto Serif, for scholarly display headings) and
`--color-scholargold` (a highlight/warning accent) to the same `@theme` block, and increased
`.arabic-text` line-height to ~1.9 so ḥarakāt don't clash between lines — both drawn from the
fuller "Manuscript Scholarly System" reference (`docs/design/manuscript-scholarly-system.md`). No new ADR was needed for this since it's an extension of the existing token set, not a
new mechanism.
