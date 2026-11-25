# Typography & Vietnamese Diacritic System

**Brand Font:** `Play` (`@fontsource/play` bundled locally — OFL-1.1)  
**Fallback Stack:** `'Play', 'Segoe UI', system-ui, -apple-system, sans-serif`  
**Monospace Stack:** `'Cascadia Mono', 'Consolas', ui-monospace, monospace`

---

## 1. Type Scale

| Token | Base Size | Weight | Line Height | Usage |
|---|---|---|---|---|
| `--ms-text-xs` | `11px` | 400 / 700 | `1.35` | Timestamps, keyboard shortcut caps, compact badges |
| `--ms-text-sm` | `12px` | 400 / 700 | `1.40` | Secondary field labels, table headers, status pills |
| `--ms-text-compact` | `13px` | 400 / 700 | `1.42` | Compact desktop buttons, sidebar items, list rows |
| `--ms-text-base` | `14px` | 400 | `1.50` | Default body copy, settings descriptions, inputs |
| `--ms-text-md` | `16px` | 700 | `1.35` | Section headings, modal titles |
| `--ms-text-lg` | `20px` | 700 | `1.30` | Screen / page titles |
| `--ms-text-xl` | `24px` | 700 | `1.28` | Major workspace headers |
| `--ms-text-2xl` | `28px` | 700 | `1.25` | Welcome & onboarding hero titles |

Adjustable interface scale (`90%`, `100%`, `110%`, `125%`) multiplies `--ms-font-scale` dynamically on `:root`.

---

## 2. Vietnamese Typography Law (`viet-type` Compliance)

1. **Bundled Vietnamese Subset:** `@fontsource/play/vietnamese-400.css` and `@fontsource/play/vietnamese-700.css` are bundled directly in `out/renderer/assets` — zero external Google Fonts CDN calls at runtime.
2. **Unicode NFC Normalization:** Every Vietnamese string in `src/renderer/locales/vi.ts` is stored in canonical **NFC** form (`"Tiếng Việt".normalize("NFC")`).
3. **Diacritic Vertical Clearance:** Stacked Vietnamese vowels + tone marks (`Ấ, Ầ, Ẩ, Ẫ, Ậ, Ắ, Ằ, Ẳ, Ẵ, Ặ, Ế, Ề, Ể, Ễ, Ệ, Ố, Ồ,Ổ, Ỗ, Ộ, Ớ, Ờ, Ở, Ỡ, Ợ, Ứ, Ừ, Ử, Ữ, Ự`) require `line-height >= 1.25` on headings and `>= 1.45` on body copy; single-line truncated elements include `padding-top: 1px` so top marks never clip.
4. **Upright Headings Only:** Headings always use `font-style: normal` (`Play` 700).
5. **Locale Formatting:** Vietnamese numbers use dot thousands (`10.000.000`), comma decimals (`9,6 GB`), and 24-hour timestamps (`14:30`).
