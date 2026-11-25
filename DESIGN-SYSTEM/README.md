# 1MS Studio Design System — 1RS v1.2

**Product:** Muse for Windows v1.0.0  
**Developer:** 1MS Studio  
**Standard:** 1RS v1.2 (*Inspired by the official Muse macOS desktop aesthetic, engineered natively for Windows 10 & Windows 11*)

---

## 1. Authoritative Adaptation Notice

Prior to authoring this Design System, the workspace was audited for pre-existing `DESIGN-SYSTEM/`, `ui-kit/`, `1RS.md`, `1RS-v1.2.md`, and `BRANDING.md` artifacts. Because the workspace started as an empty greenfield directory, this centralized `DESIGN-SYSTEM/` directory serves as the **official project-specific 1RS v1.2 standard for Muse for Windows**.

---

## 2. Core Design Pillars

1. **Muse macOS Calmness × Windows 11 Precision:** Quiet Carbon dark surfaces (`#0B0D10` -> `#12151A` -> `#1B1F26`), 1px structural hairline borders (`#282D36`), zero gratuitous glassmorphism, and native Windows `titleBarOverlay` + Snap Layouts compatibility.
2. **Restrained Electric Lime Identity (`#FAFF69`):** Used surgically for primary actions, active navigation indicators, keyboard focus rings, live agent pulse indicators, and brand marks — never as a noisy full-bleed background.
3. **Play Typography + Viet-Type Precision:** Locally bundled `@fontsource/play` (`400` / `700`, `latin` + `vietnamese`) with generous diacritic headroom (`line-height: 1.28` headings, `1.5` body) and strict Unicode **NFC** normalization.
4. **Lucian Labs UX/UI Motion & Micro-Interactions:** Interactive primitives ported from `Seokwoooo/lucian-uxui` (`v1.2.0`, MIT) mapped directly onto `--ux-*` <-> `--ms-*` tokens so tactile micro-feedback feels cohesive across Dark, Light, and System themes.
5. **Single Source of Truth:** Every component in `src/renderer/` consumes `DESIGN-SYSTEM/DESIGN-TOKENS.json` and `src/renderer/themes/tokens.css`. Zero hardcoded hex colors or inline font families are permitted.

---

## 3. Directory Index

| Document | Scope |
|---|---|
| [BRANDING.md](./BRANDING.md) | Identity, disclaimers, logo geometry, and brand voice |
| [COLORS.md](./COLORS.md) | Primitive, semantic, and WCAG AA contrast-verified palettes |
| [TYPOGRAPHY.md](./TYPOGRAPHY.md) | Play font scale, adjustable UI scaling, and Vietnamese diacritic rules |
| [ICONOGRAPHY.md](./ICONOGRAPHY.md) | Lucide Icons sizing, stroke discipline, and accessibility |
| [SPACING.md](./SPACING.md) | 4px spatial grid, radii, and UI density modes |
| [LAYOUT.md](./LAYOUT.md) | Title bar, collapsible rail, `WebContentsView` viewport, and responsive breakpoints |
| [COMPONENTS.md](./COMPONENTS.md) | Reusable 1RS v1.2 UI Kit specification (`src/renderer/components/ui/`) |
| [INTERACTIONS.md](./INTERACTIONS.md) | 8-state component matrix, keyboard-first shortcuts, and confirmation gates |
| [MOTION.md](./MOTION.md) | 80ms–280ms duration tokens, GPU transforms, and reduced-motion laws |
| [ACCESSIBILITY.md](./ACCESSIBILITY.md) | WCAG 2.2 AA compliance, ARIA landmarks, focus traps, and screen readers |
| [DESKTOP-UX.md](./DESKTOP-UX.md) | Windows 10/11 native shell patterns, tray, DPI scaling, and multi-monitor |
| [LUCIAN-COMPONENT-MAP.md](./LUCIAN-COMPONENT-MAP.md) | Complete catalog mapping of verified Lucian UX/UI elements (`#004`–`#475`) |
| [DESIGN-TOKENS.json](./DESIGN-TOKENS.json) | Machine-readable 3-layer DTCG token specification |
| [UI-AUDIT-CHECKLIST.md](./UI-AUDIT-CHECKLIST.md) | 100-point internal quality gate (Target >= 95/100) |
