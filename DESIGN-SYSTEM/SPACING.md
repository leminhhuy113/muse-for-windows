# Spacing, Radius & Density System

**Standard:** 1RS v1.2

---

## 1. Spatial Scale (4px Base Grid)

| Token | Value | Typical Desktop Usage |
|---|---|---|
| `--ms-space-1` | `4px` | Tight icon-to-badge gaps, inline kbd padding |
| `--ms-space-2` | `8px` | Button icon gap, compact list item padding |
| `--ms-space-3` | `12px` | Standard input padding, control group spacing |
| `--ms-space-4` | `16px` | Card internal padding, toolbar horizontal inset |
| `--ms-space-5` | `20px` | Modal body padding, settings row vertical rhythm |
| `--ms-space-6` | `24px` | Page container inset, section separation |
| `--ms-space-8` | `32px` | Major group separation |
| `--ms-space-10` | `40px` | Onboarding & recovery hero breathing room |
| `--ms-space-12` | `48px` | Maximum layout section gap |

---

## 2. Border Radius Scale

| Token | Value | Usage |
|---|---|---|
| `--ms-radius-xs` | `4px` | Keyboard shortcut caps (`Ctrl`, `K`), subtle tags |
| `--ms-radius-sm` | `6px` | Compact buttons, checkboxes, menu items |
| `--ms-radius-md` | `8px` | Standard inputs, selects, buttons, list cards |
| `--ms-radius-lg` | `10px` | Panels, permission approval cards, toasts |
| `--ms-radius-xl` | `12px` | Modals, Command Palette, Quick Assistant shell |

> **Anti-Slop Rule:** Never apply oversized `24px–32px` bubble radii to standard desktop panels, and never nest cards inside cards unnecessarily. Use clean hairline dividers (`1px solid var(--ms-border)`) inside settings and list views.

---

## 3. UI Density Modes

Users can switch between three density presets in **Appearance Settings**:
- **Compact (`compact`):** Row height `32px`, panel padding `12px` — ideal for `1280×720` and `1366×768` laptops.
- **Comfortable (`comfortable` — Default):** Row height `36px`, panel padding `16px` — tuned for `1920×1080` and `2560×1440`.
- **Spacious (`spacious`):** Row height `42px`, panel padding `20px` — tuned for 4K displays and touch/accessibility workflows.
