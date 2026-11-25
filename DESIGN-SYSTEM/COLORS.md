# Color System & Contrast Verification

**Standard:** 1RS v1.2 — WCAG 2.2 AA Verified

---

## 1. Dark Theme (Default)

| Token | Value | Contrast vs Surface (`#12151A`) | Usage |
|---|---|---|---|
| `--ms-bg` | `#0B0D10` | — | Root application canvas |
| `--ms-surface` | `#12151A` | `1.00:1` | Navigation rail, panels, cards |
| `--ms-surface-elevated` | `#1B1F26` | `1.18:1` | Modals, Command Palette, popovers |
| `--ms-surface-hover` | `#20242B` | `1.28:1` | Interactive row/button hover |
| `--ms-border` | `#282D36` | `1.50:1` | Hairline structural dividers |
| `--ms-text-primary` | `#F5F7FA` | **`16.8:1` (AAA)** | Headings, primary body copy |
| `--ms-text-secondary` | `#949BA8` | **`6.4:1` (AA)** | Descriptions, secondary labels |
| `--ms-text-muted` | `#858D9C` | **`5.1:1` (AA)** | Metadata, kbd hints *(adjusted from `#727986` to exceed 4.5:1 AA on `#12151A`)* |
| `--ms-accent` | `#FAFF69` | **`17.1:1` (AAA)** | Primary CTA fill, active indicator, focus ring |
| `--ms-accent-fg` | `#101208` | **`17.4:1` vs `#FAFF69`** | Text/icons placed on `#FAFF69` buttons |
| `--ms-success` | `#34D399` | **`9.8:1` (AAA)** | Verified, active, approved states |
| `--ms-warning` | `#FBBF24` | **`10.6:1` (AAA)** | Caution, medium-risk tool alerts |
| `--ms-danger` | `#F87171` | **`6.3:1` (AA)** | High-risk tools, deny, emergency stop |
| `--ms-info` | `#60A5FA` | **`7.1:1` (AAA)** | Informational badges, sync indicators |

---

## 2. Light Theme

| Token | Value | Contrast vs Surface (`#FFFFFF`) | Usage |
|---|---|---|---|
| `--ms-bg` | `#F5F6F8` | — | Root canvas |
| `--ms-surface` | `#FFFFFF` | `1.00:1` | Primary cards, settings panels |
| `--ms-surface-elevated` | `#FFFFFF` | `1.00:1` (+ elevation shadow) | Popovers, dialogs |
| `--ms-surface-hover` | `#EAEDF1` | `1.15:1` | Hover background |
| `--ms-border` | `#DDE1E6` | `1.31:1` | Structural borders |
| `--ms-text-primary` | `#15171C` | **`17.9:1` (AAA)** | Primary text |
| `--ms-text-secondary` | `#555D68` | **`6.7:1` (AA)** | Secondary text |
| `--ms-text-muted` | `#636B78` | **`5.3:1` (AA)** | Metadata *(tuned from `#737B87` to guarantee >= 4.5:1 on `#F5F6F8`)* |
| `--ms-accent` | `#C7CE32` | — *(Surface fill only, never raw text on white)* | Primary CTA surface with `#101208` ink (`11.6:1` contrast!) |
| `--ms-accent-text` | `#5C6108` | **`6.5:1` (AA)** | Semantic text/link accent on white surfaces |
| `--ms-accent-fg` | `#101208` | **`11.6:1` vs `#C7CE32`** | Text/icons on primary accent buttons |

---

## 3. Strict Usage Guardrails

- **Never** use `#FAFF69` as text on a light background (`1.07:1` — illegible). On Light theme, text accents automatically resolve to `--ms-accent-text` (`#5C6108`, `6.5:1`), while solid CTA buttons use `#C7CE32` background with `#101208` foreground (`11.6:1`).
- **Never** use `#FAFF69` as a full-window background.
- **Never** introduce random AI purple/pink gradients (`#7C3AED` / `#EC4899`).
