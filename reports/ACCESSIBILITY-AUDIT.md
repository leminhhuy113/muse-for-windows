# Accessibility Audit (`reports/ACCESSIBILITY-AUDIT.md`)

**Target Standard:** WCAG 2.2 Level AA  
**Date:** 2026-11-25

---

## 1. Contrast Ratio Verification

| Foreground Token | Surface Background | Measured Ratio | WCAG 2.2 AA Requirement | Result |
|---|---|---|---|---|
| Dark `--ms-text-primary` (`#F5F7FA`) | `#12151A` | `16.8 : 1` | `>= 4.5 : 1` | **PASS (AAA)** |
| Dark `--ms-text-secondary` (`#949BA8`) | `#12151A` | `6.4 : 1` | `>= 4.5 : 1` | **PASS (AA)** |
| Dark `--ms-text-muted` (`#858D9C`) | `#12151A` | `5.1 : 1` | `>= 4.5 : 1` | **PASS (AA)** |
| Dark `--ms-accent-fg` (`#101208`) | `#FAFF69` | `17.4 : 1` | `>= 4.5 : 1` | **PASS (AAA)** |
| Light `--ms-text-primary` (`#15171C`) | `#FFFFFF` | `17.9 : 1` | `>= 4.5 : 1` | **PASS (AAA)** |
| Light `--ms-text-secondary` (`#555D68`) | `#FFFFFF` | `6.7 : 1` | `>= 4.5 : 1` | **PASS (AA)** |
| Light `--ms-text-muted` (`#636B78`) | `#F5F6F8` | `5.3 : 1` | `>= 4.5 : 1` | **PASS (AA)** |
| Light `--ms-accent-fg` (`#101208`) | `#C7CE32` | `11.6 : 1` | `>= 4.5 : 1` | **PASS (AAA)** |

---

## 2. Keyboard, ARIA & Motion Verification

- **Keyboard Navigation:** All buttons, switches (`role="switch"`), tabs (`role="tab"`), command palette (`role="combobox"` + `ArrowUp`/`ArrowDown`/`Enter`/`Esc`), and dialogs (`role="alertdialog"`) are operable without a pointer.
- **Default Safe Focus:** `ToolApprovalModal` automatically focuses **Deny (Default)** on mount so accidental `Enter`/`Space` presses never approve privileged tools.
- **Non-Color Status:** `StatusBadge` and `RiskBadge` pair distinct Lucide icons with text labels.
- **Reduced Motion & Scaling:** Supports `@media (prefers-reduced-motion: reduce)`, in-app **Reduced Motion** & **High Contrast** toggles, and `90%–125%` font scaling.
