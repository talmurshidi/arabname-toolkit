---
name: Manuscript Scholarly System
colors:
  surface: '#faf9f5'
  surface-dim: '#dbdad6'
  surface-bright: '#faf9f5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f4f0'
  surface-container: '#efeeea'
  surface-container-high: '#e9e8e4'
  surface-container-highest: '#e3e2df'
  on-surface: '#1b1c1a'
  on-surface-variant: '#45464c'
  inverse-surface: '#2f312e'
  inverse-on-surface: '#f2f1ed'
  outline: '#76777c'
  outline-variant: '#c6c6cc'
  surface-tint: '#595e6d'
  primary: '#030612'
  on-primary: '#ffffff'
  primary-container: '#1a1f2c'
  on-primary-container: '#828697'
  inverse-primary: '#c2c6d8'
  secondary: '#496640'
  on-secondary: '#ffffff'
  secondary-container: '#caecbc'
  on-secondary-container: '#4f6c45'
  tertiary: '#0c0600'
  on-tertiary: '#ffffff'
  tertiary-container: '#2b1d00'
  on-tertiary-container: '#af7e00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dee2f4'
  primary-fixed-dim: '#c2c6d8'
  on-primary-fixed: '#161b28'
  on-primary-fixed-variant: '#424655'
  secondary-fixed: '#caecbc'
  secondary-fixed-dim: '#afd0a1'
  on-secondary-fixed: '#062104'
  on-secondary-fixed-variant: '#324e2a'
  tertiary-fixed: '#ffdea6'
  tertiary-fixed-dim: '#f7bd48'
  on-tertiary-fixed: '#271900'
  on-tertiary-fixed-variant: '#5d4200'
  background: '#faf9f5'
  on-background: '#1b1c1a'
  surface-variant: '#e3e2df'
typography:
  display-lg:
    fontFamily: Noto Serif
    fontSize: 42px
    fontWeight: '700'
    lineHeight: 52px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Noto Serif
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-md:
    fontFamily: Noto Serif
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Noto Serif
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Noto Serif
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  transliteration-mono:
    fontFamily: Noto Serif
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 28px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  container-max: 1200px
  gutter: 24px
---

## Brand & Style

The design system is rooted in the "Modern Manuscript" aesthetic—a synthesis of classical philology and contemporary utility. It serves the scholarly community by providing a quiet, high-focus environment that mirrors the clarity of a well-edited academic journal.

The visual language rejects the fleeting trends of consumer software in favor of permanence and precision. It employs a **Minimalist** approach with a **Tactile/Parchment** influence, utilizing generous whitespace and thin, purposeful borders to organize complex linguistic data. The emotional response is one of intellectual calm, reliability, and institutional authority.

## Colors

The palette is derived from the materials of historical manuscript production: carbon ink, aged parchment, and vegetal dyes.

- **Base (Neutral):** `#FDFCF8` serves as the parchment background, reducing eye strain during long research sessions compared to pure white.
- **Ink (Primary):** `#1A1F2C` is used for all primary text and structural lines, providing deep, high-contrast legibility.
- **Scholar's Green (Secondary):** `#4A6741` is the primary action color, used for "Success" states, primary buttons, and active selections.
- **Scholarly Gold (Tertiary):** `#B8860B` is reserved for highlights, cautionary states, or delicate ornamentation.

Surface tiers are created by subtly darkening the parchment base or adding 1px ink-colored borders.

## Typography

Typography is the core of this design system. It requires perfect rendering of both the Arabic Naskh script and the Brill transliteration standards (macrons, underdots).

- **Latin Script:** Noto Serif is the standard for its exceptional support of extended Latin diacritics. It should be used for all scholarly content.
- **Arabic Script:** Use "Amiri" or "Noto Naskh Arabic." The line-height for Arabic text must be increased by at least 20% compared to Latin text to prevent _ḥarakāt_ (vowel marks) from clashing with lines above or below.
- **System UI:** Inter is used sparingly for labels and functional metadata to provide a clear distinction between the "tool" and the "content."

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy on desktop to maintain the feel of a printed folio, transitioning to a fluid model on mobile devices.

- **Grid:** A 12-column grid with a 24px gutter. For the main conversion interface, content should be centered within a 6 or 8-column span to maintain focus.
- **Rhythm:** An 8px linear scale is used for most components, while a 4px scale is used for tight typographic adjustments (e.g., the Virtual Key buttons).
- **Logical Properties:** All margins and paddings must use logical properties (`padding-inline-start`) to ensure seamless mirroring when the interface switches between LTR (transliteration) and RTL (Arabic source).

## Elevation & Depth

This design system avoids heavy shadows, relying instead on **Tonal Layers** and **Bold Borders**.

- **Level 0 (Base):** Parchment (`#FDFCF8`).
- **Level 1 (Cards/Inputs):** A slightly lighter or 100% white surface with a 1px solid ink border (`#1A1F2C`).
- **Level 2 (Modals/Popovers):** Surface with a 1px border and a sharp, "hard" shadow (2px offset, 0 blur, ink at 10% opacity) to mimic a physical layer of paper.
- **Focus States:** Indicated by a 2px offset border in Scholar's Green or a subtle parchment-darkening effect.

## Shapes

The design system utilizes **Sharp (0px)** corners for almost all structural elements, including cards, inputs, and buttons. This reinforces the manuscript/print aesthetic. Subtle rounding (2px) is only permitted for "Status Chips" to differentiate them from interactive buttons.

## Components

- **Converter Card:** The primary workspace. It features a split-pane layout (RTL for Arabic input, LTR for Latin output). Use 1px ink dividers and no background fill for the input areas to maximize the "paper" feel.
- **Virtual Key:** Small square buttons (32x32px) for special characters (e.g., ṭ, ṣ, ḥ). They use a light parchment hover state and a 1px border. The character is centered in `transliteration-mono`.
- **Status Chip:** Small, rectangular labels with a subtle background tint (e.g., Green 10% for success). Use `label-sm` for the text.
- **History Item:** Compact horizontal rows. Use a 1px border-bottom to separate items. Timestamps and metadata should be in `label-sm` using the Ink color at 60% opacity.
- **Buttons:** Primary buttons are solid Ink (`#1A1F2C`) with Parchment text. Secondary buttons are outlined. All buttons must have a distinct "active" state where the background shifts to Scholar's Green.
- **Form Inputs:** Labels are placed above the field in `label-sm`. The focus state is a bold 2px bottom border rather than a full box glow.
