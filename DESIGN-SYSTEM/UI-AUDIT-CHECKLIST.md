# 1MS Studio Internal UI Audit Checklist (`1RS v1.2`)

**Maximum Score:** 100 Points  
**Release Target:** >= 95 / 100 (Zero Critical Blockers)

---

## 1. Scoring Rubric

| Dimension | Max Points | Mandatory Verification Gates |
|---|---|---|
| **1. Visual Quality** | 20 | Carbon/Light surface hierarchy, surgical `#FAFF69`/`#C7CE32` accent restraint, zero AI purple gradients, crisp 1px borders, clean alignment. |
| **2. Design Consistency** | 15 | 100% token usage (`--ms-*` / `--ux-*`), unified `Play` typography, consistent `Lucide` stroke (`1.75`), zero emoji icons. |
| **3. Interaction Quality** | 15 | Ported Lucian UX/UI micro-feedback, 8 interactive states, unsaved changes guard, clear confirmation dialogs. |
| **4. Desktop Usability** | 15 | Native `38px` Windows title bar + `titleBarOverlay`, single compact rail (no duplicate sidebars), `Ctrl+K` palette, resizable/collapsible inspector. |
| **5. Accessibility** | 10 | WCAG 2.2 AA >= 4.5:1 contrast, visible focus rings, keyboard-only operability, ARIA roles/labels, non-color status indicators. |
| **6. Functional Completeness** | 10 | All 28 screens implemented with real state/IPC backing, zero dead placeholder buttons, honest Mode B unsupported explanation. |
| **7. Performance** | 10 | GPU `transform`/`opacity` motion, `prefers-reduced-motion` + minimized pause, lazy-loaded secondary panels, fast startup. |
| **8. Localization** | 5 | Complete `vi` (Unicode NFC, unclipped diacritics, long-label wrapping) and `en` coverage with zero hardcoded UI strings. |

---

## 2. Release-Blocking Automatic Failures

Regardless of numeric score, a screen **fails** audit if any of the following occur:
- Hardcoded secrets or unvalidated remote `WebContentsView` privilege access.
- Permission dialog defaults to `Allow` or allows permanent unrestricted shell/Computer Use access.
- Missing keyboard focus indicator or inaccessible icon-only button.
- Clipped Vietnamese tone marks (`Ễ`, `Ỗ`, `Ữ`) or horizontal scrollbar at `1280×720`.
- Fabricated AI responses, fake telemetry stats, or deceptive partnership claims.
