# ArabName Toolkit — Design Brief for Stitch

This document is written to be pasted into Stitch (or any AI UI-design tool) to generate
mockups/UI for the site. It describes the product, the audience, every page and its
functions in detail, tone/brand direction, and constraints the design must respect
(bilingual RTL/LTR, no backend, must stay lightweight).

---

## 1. The idea, in one paragraph

ArabName Toolkit is a free, open-source, fully **client-side** web app that converts
Brill-transliterated Arabic personal names (the Latin transliteration standard used in
Western Islamic-studies publishing, e.g. _Encyclopaedia of Islam_, 3rd ed.) into Arabic
script — both fully voweled (with ḥarakāt/diacritics) and unvoweled — and back again. It
exists for academic researchers in Islamic studies, history, and prosopography who need
to move between the two writing systems accurately and quickly while building
biographical databases, critical editions, and prosopographical datasets. There is no
server, no database, no account, and no tracking — everything runs in the browser, and
the only persistence is the user's own `localStorage`.

## 2. Who uses it and why

- **Primary user**: an academic (grad student to senior professor) working in Islamic
  history/prosopography who has a spreadsheet or index card full of names in Brill
  transliteration and needs the Arabic script equivalent — or vice versa — for a
  publication, database, or teaching material.
- **Secondary user**: a digital humanities developer/RA doing bulk data cleanup on a
  named-entity dataset (hundreds/thousands of names), who needs CSV batch conversion.
- **Values this audience holds**: scholarly rigor and citability (they want to know the
  _rules_ behind a conversion, not just trust a black box), source transparency, privacy
  (their working data — sometimes unpublished research — should never leave their
  machine), and Arabic diacritics/typography rendered _correctly_, not approximated.

This is a **tool for specialists**, not a mass consumer product. The UI should feel like
a serious scholarly instrument — closer to a linguistics utility or a well-made academic
software tool than a consumer SaaS app. Calm, precise, unflashy. Trustworthy over trendy.

## 3. Brand and tone direction (for Stitch)

- **Visual mood**: quiet, precise, manuscript-adjacent. Think: a modern academic reading
  tool, not a startup landing page. Generous whitespace, restrained color, strong
  typographic hierarchy for two scripts at once.
- **Typography is the star.** The design must give real weight to:
  - A high-quality **Arabic typeface** capable of correctly rendering ḥarakāt
    (diacritical marks) — these must be legible and never clipped/overlapping (common
    failure mode with default system Arabic fonts). Prefer a typeface designed for
    diacritic-heavy academic/Quranic-style text (e.g. Amiri, Noto Naskh Arabic, or
    similar) over a generic UI Arabic font.
  - A Latin typeface with correct diacritic support (macrons, underdots, carons) for
    Brill transliteration (e.g. ʿAbd al-Raḥmān) — most default web fonts render these
    badly (clipped macrons, wrong underdot placement). This is a real, previously-hit
    failure mode for this project and matters a lot to the target user.
- **Color**: a small, restrained palette. Suggest an ink/parchment-inspired neutral base
  (off-white / warm paper background option, or a clean neutral light theme) with a
  single accent color used sparingly (e.g. for primary actions, active tab, focus
  states). Avoid saturated, "app-y" gradients. A dark mode is a nice-to-have, not core.
- **Bilingual, mirrored layout.** Arabic is the **default** locale and reads **RTL**;
  English is available via a toggle and reads LTR. The entire chrome (nav, buttons,
  form alignment, icons that imply direction like arrows) must mirror correctly between
  the two, not just the text. Design both directions, not just one with "RTL support."
- **No dark patterns, no ads, no upsell.** It's a free scholarly utility. The UI should
  never imply there's a paid tier, account, or hidden cost.

## 4. Site structure — pages and their functions

The app is a small multi-page static site (4 pages) sharing one nav/header/footer. Each
page is described below with its concrete functional requirements — Stitch should design
each as a distinct screen.

> **Note:** this brief predates the ADR-001/ADR-006 migration to a React SPA and the
> parchment/scholargreen Tailwind design system. Page names below (`index.html`, `batch.html`,
> etc.) now correspond to views in a single-page app (`src/ui/pages/*.tsx`), not separate HTML
> files. Kept for historical design rationale.

### 4.1 Converter (`index.html`) — the home page and primary tool

The main, most-used screen. Bidirectional single-name/text converter.

**Functions:**

- A **direction toggle** ("Latin → Arabic" / "Arabic → Latin", swappable with a swap
  button) — this is the primary interaction on the page and should be visually prominent.
- **Input textarea**: free text entry of a Brill-transliterated name (or, in reverse
  mode, fully-diacritized Arabic).
- **Virtual/on-screen keyboard panel**: a toggleable panel of special-character keys
  (macrons, underdots, ʿayn ʿ, hamza ʾ, etc. for Latin input; Arabic letters and
  ḥarakāt for Arabic input) that insert characters at the cursor — needed because most
  keyboards can't type Brill diacritics or Arabic natively. Should feel like a compact,
  organized key palette, not a full keyboard replica.
- **Output area showing multiple result forms simultaneously**, clearly labeled:
  - Arabic **with** diacritics (ḥarakāt) — the fully-voweled scholarly form.
  - Arabic **without** diacritics — the everyday/searchable form.
  - A **normalized display form**.
  - An **index/sort key** (for alphabetization in a bibliography or database).
  - (Reverse direction): the Brill Latin transliteration of fully-diacritized Arabic
    input.
- **Reverse-direction guardrail**: if the user tries to convert Arabic → Latin and the
  input isn't fully diacritized, the tool must **warn and refuse to guess** rather than
  produce an unreliable silent result — this should be a visible, calm inline warning
  state (not a blocking modal), explaining that undiacritized Arabic is ambiguous.
- **Copy-to-clipboard** affordance per output field.
- Each conversion is silently appended to **History** (see below) with a timestamp.
- A visible, low-key link/callout to the **Methodology** page ("How does this work? /
  What are the limitations?") near the output, since scholars will want to verify the
  rule basis before citing a result.

**Secondary UI on this page:**

- **History panel** (collapsible sidebar or drawer): last 50 conversions, each showing
  input → output(s) and a timestamp, re-selectable to reload into the converter, with a
  clear "clear history" action. Purely local (`localStorage`), never synced anywhere —
  this should be stated in the UI, not just assumed.

### 4.2 Batch (`batch.html`) — bulk CSV/TSV processing

For power users converting many names at once.

**Functions:**

- **File upload** (drag-and-drop + file picker) accepting CSV/TSV.
- **Column mapping step**: after upload, let the user pick which column contains the
  names to convert and confirm the direction (Latin→Arabic / Arabic→Latin).
- **Progress indicator** while processing (hundreds of rows should feel instant, but the
  UI should still show a determinate progress state for larger files).
- **Results table/preview**: original value alongside all generated forms, scrollable,
  with per-row status (converted cleanly / used dictionary / fell back to engine /
  flagged as ambiguous) — a small status chip per row is a good pattern here.
- **Download buttons**: export results as CSV or JSON.
- Clear messaging that the file **never leaves the browser** (no upload to a server) —
  this is a trust point worth designing as a small, visible reassurance, not hidden in
  fine print.

### 4.3 Dictionary (`dictionary.html`) — user-defined overrides

Lets a user extend/override the built-in curated name dictionary.

**Functions:**

- **List/table view** of the user's custom Latin → Arabic entries (separate from and
  layered on top of the built-in dictionary, which is not itself user-editable here).
- **Add entry form**: Latin key + Arabic value, with inline validation.
- **Edit / delete** existing custom entries.
- **Export** the custom dictionary as JSON (for backup or sharing with a colleague) and
  **import** a JSON file to load one — with a clear conflict/overwrite confirmation
  step if importing would replace existing entries.
- Empty state: a friendly explanation of what the dictionary is for, shown when the
  user has no custom entries yet.

### 4.4 Methodology (`methodology.html`) — documentation page

A long-form reference page, not a "tool" screen — should be designed like a clean
academic article/documentation layout (headings, a table of contents/sidebar nav for
long-page navigation, definition-list style for transliteration mappings).

**Content sections to design for:**

- The transliteration standard being followed and its sources/citations.
- The engine's layered rule order (sourced corrections → curated dictionary →
  character-level regex engine → bracket repair → house-style post-processing),
  explained for a non-developer scholarly reader.
- Known limitations (notably: reverse Arabic→Latin conversion requires fully
  diacritized input and will refuse/warn otherwise).
- A table or chart mapping Brill Latin characters to Arabic letters/diacritics — this
  is reference material scholars may want to screenshot or print, so it should be
  legible in isolation.

### 4.5 Shared chrome (every page)

- **Header/nav**: site name/logo, links to the 4 pages, a **language toggle**
  (Arabic ⇄ English, persisted), no login/account UI of any kind.
- **Footer**: link to GitHub repo/source, license note, "no data leaves your browser"
  statement, methodology link.
- Fully responsive: usable on a laptop (primary context — researchers at a desk) down to
  tablet width; mobile is a secondary nice-to-have, not the design's primary target.

## 5. Non-negotiable constraints for the design

1. **No backend, no accounts, no analytics/tracking UI** — don't design sign-in, avatars,
   pricing, or "sync across devices" flows; they don't exist and won't.
2. **Bilingual + bidirectional (RTL/LTR)** must be designed for both directions, mirrored
   properly (not just flipped text).
3. **Two scripts on screen simultaneously** (Latin transliteration + Arabic, often
   diacritic-heavy) is the core visual challenge — legibility of both at once, especially
   in the converter's output section, is the single most important design problem here.
4. **Lightweight and fast** — this is a static site meant to load instantly on GitHub
   Pages, including on modest connections. Avoid designs that imply heavy JS frameworks,
   animated illustration systems, video backgrounds, or large icon-font/webfont bundles.
   Prefer system-ish UI chrome with the _content typography_ (the two scripts) as the
   one place richness is spent.
5. **Accessible**: real form labels, sufficient contrast (including in the accent color
   against the paper/neutral background), visible focus states, and diacritics that
   remain legible when zoomed.

## 6. Recommended frontend stack (lightweight, matches current implementation)

The codebase already follows this stack and it should be kept — there is no need to
introduce a UI framework. Recommended for implementing whatever Stitch designs:

| Layer             | Choice                                                                                                                                                                                                                                                                                   | Why                                                                                                                                                                                                                                                                                                                                                                 |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Build tool        | **Vite**, multi-page mode (one entry per HTML file)                                                                                                                                                                                                                                      | Instant dev server, minimal config, tiny production bundles, native ESM — ideal for a handful of static pages.                                                                                                                                                                                                                                                      |
| Language          | **TypeScript, strict mode**                                                                                                                                                                                                                                                              | Type safety for the transliteration domain logic without any runtime framework cost.                                                                                                                                                                                                                                                                                |
| UI layer          | **Vanilla TS + direct DOM APIs** (no React/Vue/Svelte)                                                                                                                                                                                                                                   | The UI is a handful of pages with modest interactivity (forms, a table, a keyboard panel) — a component framework would add bundle size and build complexity for no real benefit here. Small hand-written DOM helper modules (as already exist under `src/ui/components/`) are sufficient and keep the "auditable, forkable, static site" promise the README makes. |
| Styling           | **Plain CSS** (current `src/ui/styles/main.css`), using CSS custom properties for the palette/spacing scale, `dir`-aware logical properties (`margin-inline-start` etc. instead of `margin-left`) for RTL/LTR mirroring, and `@font-face` for the Arabic + diacritic-safe Latin webfonts | Zero-dependency, smallest possible payload, and logical properties solve the RTL-mirroring requirement natively without duplicate stylesheets. Avoid a CSS framework/utility library (e.g. Tailwind) unless the team specifically wants the authoring ergonomics — it's optional weight, not a requirement.                                                         |
| CSV parsing       | **Papa Parse** (already a dependency)                                                                                                                                                                                                                                                    | Only real third-party runtime dependency; needed for robust CSV/TSV batch parsing edge cases. Keep it lazy-imported on the batch page only, as it already is.                                                                                                                                                                                                       |
| Fonts             | Self-hosted **variable** webfonts (subset if possible): an Arabic text face with solid ḥarakāt rendering (e.g. Amiri or Noto Naskh Arabic) and a Latin face with correct macron/underdot/caron rendering (e.g. Noto Serif or a dedicated Brill-diacritic-safe face)                      | Self-hosting avoids a third-party request (keeps it fully client-side/offline-capable) and variable fonts keep payload small across weights.                                                                                                                                                                                                                        |
| State/persistence | Plain `localStorage` reads/writes in `src/services/`                                                                                                                                                                                                                                     | No state-management library needed; the app's state is small (history, user dictionary, locale preference).                                                                                                                                                                                                                                                         |
| Testing           | **Vitest**                                                                                                                                                                                                                                                                               | Already in place; fast, no-config, works for both pure `core/` logic and stubbed-`localStorage` service tests.                                                                                                                                                                                                                                                      |
| Icons             | Inline **SVG**, hand-picked/minimal set (no icon-font library)                                                                                                                                                                                                                           | Keeps bundle tiny and avoids FOUC/unstyled-icon flashes; only a handful of icons are actually needed (copy, download, swap, keyboard toggle, upload).                                                                                                                                                                                                               |

**Bundle-size philosophy for Stitch's designs**: every additional visual flourish (custom
illustrations, animated transitions, icon packs, background imagery) should be weighed
against this app's core promise of being a small, fast, forkable, offline-friendly static
tool. Favor typography- and layout-driven design over asset-driven design.

## 7. Summary of screens to hand to Stitch

1. **Converter (home)** — direction toggle, input + virtual keyboard, multi-form output
   panel, reverse-direction warning state, collapsible history drawer.
2. **Batch** — upload/drag-drop, column-mapping step, progress state, results table with
   per-row status chips, CSV/JSON export.
3. **Dictionary** — entries table, add/edit/delete form, import/export JSON, empty state.
4. **Methodology** — long-form documentation layout with TOC/sidebar nav and a
   Latin↔Arabic mapping reference table.
5. **Shared chrome** — header/nav with language toggle, footer with source/license/
   privacy note — all designed in both Arabic (RTL, default) and English (LTR).
