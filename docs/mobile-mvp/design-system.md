# FinMatter Mobile — Design System

Single source for React Native styling: **`apps/mobile/tailwind.config.js`** (NativeWind/Tailwind). Aligned with **Figma** ([Finmatter Design System](https://www.figma.com/design/7nGJqJ5jvlq2drTq1PtSXG/Finmatter?node-id=1-418)) and **Stitch preamble** in [stitch-prompts.md](stitch-prompts.md).

---

## Location in codebase

- **All styling:** `apps/mobile/tailwind.config.js`
- **Usage:** `className` on React Native components (e.g. `className="bg-background text-heading-large text-text p-4"`).
- **Entry:** `global.css` is imported in `index.ts`; no separate theme package.

---

## Color

| Token            | Hex       | Tailwind class (examples) |
|------------------|-----------|----------------------------|
| Money Green      | `#00B14F` | `bg-primary`, `text-primary` |
| Clean White      | `#FFFFFF` | `bg-background`, `bg-clean-white` |
| Dark Charcoal    | `#1A1A1A` | `text-text`, `text-dark-charcoal` |
| Light Gray       | `#F8F9FA` | `bg-background-secondary`, `bg-light-gray` |
| Border Gray      | `#E5E7EB` | `border-border` |
| Text Muted       | `#6B7280` | `text-text-secondary` |
| Error Red        | `#DC2626` | `text-error`, `border-error` |
| Success Green    | `#059669` | `text-success`, `border-success` |

---

## Typography

| Style          | Size | Tailwind class            | Weight (add)      |
|----------------|------|---------------------------|-------------------|
| Display Large  | 32px | `text-display-large`      | `font-bold`       |
| Heading Large  | 24px | `text-heading-large`      | `font-semibold`   |
| Heading Medium | 20px | `text-heading-medium`     | `font-semibold`   |
| Body           | 16px | `text-body`               | (default)         |
| Body Large     | 18px | `text-body-large`         | (default)         |
| Body Small     | 14px | `text-body-small`         | (default)         |
| Caption        | 12px | `text-caption`            | (default)         |

---

## Spacing

4px base scale in `tailwind.config.js`: `p-1` = 4, `p-4` = 16, `p-6` = 24, `m-2` = 8, etc.

---

## Radii & shadows

- **Border radius:** `rounded-input` (8), `rounded-card` (12), `rounded-sm` / `rounded-md` / `rounded-lg`.
- **Shadows:** `shadow-card` (cards), `shadow-subtle` (raised elements). Set a background (e.g. `bg-background`) for shadows to show on native.

---

## Component patterns (Tailwind classes)

- **Buttons:** Primary: `bg-primary rounded-input py-3 px-5` + `text-clean-white font-semibold`. Secondary: `bg-background-secondary border border-border rounded-input py-3 px-5`. Ghost: `border border-border rounded-input py-3 px-5`. Disabled: `bg-background-secondary rounded-input opacity-60`.
- **Inputs:** `bg-background border border-border rounded-input px-4 py-3`. Focus: `border-2 border-primary`. Error: `border-error`, helper: `text-caption text-error mt-1`.
- **Cards:** Default: `bg-background rounded-card p-4 shadow-card`. Primary (green): `bg-primary rounded-card p-4` + `text-clean-white`.

Cards: white surfaces with soft drop shadows; no dark cards. Tone: calm, deterministic, explainable.

---

## Constraints (from product canon)

- No celebratory visuals; no projections; no invented insights.
- Every number must feel traceable.
- Money Green used sparingly for actions and positive outcomes.
