# Iconography System

**Library:** `lucide-react` (ISC License)  
**Standard:** 1RS v1.2

---

## 1. Size & Stroke Scale

| Context | Pixel Size | Stroke Width | Example Elements |
|---|---|---|---|
| Compact metadata / badges | `14px` | `1.75` | Status indicators, breadcrumb chevrons, shortcut hints |
| Navigation & standard buttons | `16px` | `1.75` | Title bar controls, sidebar items, CTA icons |
| Standard workspace tools | `18px` | `1.75` | File browser actions, Quick Assistant actions |
| Section headers & cards | `20px` | `1.75` | Permission categories, settings group headers |
| Primary feature / empty states | `24px` | `1.6` | Onboarding cards, empty/error state illustrations |

---

## 2. Strict Rules

- **Selective Named Imports Only:** Always import individual icons (`import { Shield, FolderOpen } from 'lucide-react'`) for full Vite tree-shaking; never `import * as Icons`.
- **Zero Functional Emojis:** Never use Unicode emojis (`🚀`, `⚙️`, `🔒`) as UI icons, navigation items, or status indicators.
- **Accessibility:** Decorative icons inside labeled buttons carry `aria-hidden="true"`. Icon-only buttons (title bar back/forward/reload, collapse rail, close modal) **must** provide both `aria-label` and a localized tooltip.
