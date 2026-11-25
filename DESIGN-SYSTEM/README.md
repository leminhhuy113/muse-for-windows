# 1MS Studio Design System — 1RS v1.2 (`1ms-studio.com` × Lucian UX/UI)

**Product:** Muse for Windows v1.0.0  
**Developer:** 1MS Studio (`https://1ms-studio.com/`)  
**Standard:** 1RS v1.2 (*1MS Studio Botanical Editorial Desktop System × Genuine Lucian UX/UI Components*)

---

## 1. Visual DNA Extracted from `https://1ms-studio.com/`

1. **Botanical Olive Dark & Sage-Cream Light Palettes:**
   - **Dark Theme (`[data-theme="dark"]`):** Deep Olive-Forest canvas (`#151A14`), primary botanical surface (`#1F271D`), raised card surface (`#283224`), muted hover (`#34402E`), warm umber `--ms-peach` (`#342A22`), muted plum `--ms-lavender` (`#2D2838`), sage off-white ink (`#F4F9ED`), and 1MS Lime (`#C7F34B`) with `#151A14` ink.
   - **Light Theme (`[data-theme="light"]`):** Pale lime-cream canvas (`#F5FBE9`), warm off-white surface (`#FBFDF7`), crisp white raised cards (`#FFFFFF`), soft sage (`#EDF5DF`), pastel `--ms-peach` (`#FFEBDC`), `--ms-lavender` (`#F1EAFB`), charcoal primary CTA (`#181D27` / `#FFFFFF`), and forest accent (`#416315`).
   - **Native Windows Snap Layouts Sync:** `WindowManager` synchronizes Electron `titleBarOverlay` (`44px`) directly to `#151A14` / `#F4F9ED` (Dark) and `#F5FBE9` / `#151A14` (Light).
2. **Manrope Variable Typography + Viet-Type Precision:**
   - Bundled locally via `@fontsource-variable/manrope` (`200..800`, `vietnamese` + `latin` subsets, SIL OFL-1.1) matching `https://1ms-studio.com/fonts/Manrope-variable.ttf`.
   - Editorial `font-weight: 600` headings (`letter-spacing: -0.032em`, `line-height: 1.24`), pill-shaped `9999px` buttons, `24px–28px` rounded cards, and `1ms` + lime dot brand wordmark.
3. **Genuine Lucian UX/UI Interactive Elements (`Seokwoooo/lucian-uxui` v1.2.0):**
   - Sidebar navigation uses the genuine `#417 Collapsible sidebar` (`.u417-sb` floating card, `.u417-pl` springing highlight pill, `.u417-tg` edge round collapse toggle) paired with `#037 Account switcher menu`, `#416`/`#047` jelly-stretching segmented tabs, `#471` 3D keycap `Ctrl+K` button, `#267` header globe language dropdown, `#046` command palette, `#433` stretch-on-press switch, `#044` numbered accordion, and `#070` fanning toast stack.

---

## 2. Directory Index

| Document | Scope |
|---|---|
| [BRANDING.md](./BRANDING.md) | `1ms` brand lockup, disclaimers, logo geometry, and voice |
| [COLORS.md](./COLORS.md) | `1ms-studio.com` Dark & Light palettes and WCAG contrast |
| [TYPOGRAPHY.md](./TYPOGRAPHY.md) | Manrope Variable scale, UI scaling, and Vietnamese NFC rules |
| [ICONOGRAPHY.md](./ICONOGRAPHY.md) | Lucide Icons sizing, stroke discipline, and accessibility |
| [SPACING.md](./SPACING.md) | Spatial grid, `14px`/`24px`/`28px`/`9999px` radii, and density modes |
| [LAYOUT.md](./LAYOUT.md) | 44px header, `#417` floating sidebar, and `WebContentsView` frame |
| [COMPONENTS.md](./COMPONENTS.md) | Reusable 1MS Studio × Lucian UX/UI component kit |
| [INTERACTIONS.md](./INTERACTIONS.md) | 8-state matrix, keyboard navigation, and confirmation gates |
| [MOTION.md](./MOTION.md) | `cubic-bezier(0.2, 0.8, 0.2, 1)` & spring physics (`0.34, 1.45, 0.64, 1`) |
| [ACCESSIBILITY.md](./ACCESSIBILITY.md) | WCAG 2.2 AA compliance, ARIA landmarks, and reduced-motion |
| [DESKTOP-UX.md](./DESKTOP-UX.md) | Windows 10/11 Snap Layouts, tray, DPI scaling, and multi-monitor |
| [LUCIAN-COMPONENT-MAP.md](./LUCIAN-COMPONENT-MAP.md) | Verified Lucian UX/UI elements (`#004`–`#475`) |
| [DESIGN-TOKENS.json](./DESIGN-TOKENS.json) | Machine-readable 3-layer DTCG token specification |
| [UI-AUDIT-CHECKLIST.md](./UI-AUDIT-CHECKLIST.md) | 100-point internal quality gate |
