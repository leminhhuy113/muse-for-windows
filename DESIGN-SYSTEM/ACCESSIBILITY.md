# Accessibility Specification (WCAG 2.2 AA)

**Standard:** 1RS v1.2

---

## 1. Core Accessibility Guarantees

1. **Contrast Compliance:** All primary (`16.8:1` dark / `17.9:1` light), secondary (`6.4:1` / `6.7:1`), and muted (`5.1:1` / `5.3:1`) text tokens exceed the WCAG 2.2 AA `4.5:1` minimum. Interactive borders and focus indicators (`#FAFF69` dark / `#15171C` + `#C7CE32` ring light) exceed `3:1`.
2. **Full Keyboard Operability:**
   - Logical tab order: Title Bar -> Navigation Rail -> Active Screen Content -> Contextual Inspector.
   - `Ctrl+K` opens Command Palette with `role="combobox"`, `aria-activedescendant`, `ArrowUp`/`ArrowDown`, `Enter`, and `Escape`.
   - Modals and Permission Approval dialogs trap focus while open and restore focus to the invoking element on close.
3. **Non-Color Status Communication:** Every status indicator (Connection status, Bridge health, Permission risk, Audit result) pairs a distinct Lucide icon + localized text label alongside semantic color.
4. **Screen Reader Landmarks:** `<header role="banner">`, `<nav aria-label="...">`, `<main id="main-content">`, `<aside aria-label="...">`, and `aria-live="polite"` / `role="alert"` regions for toasts and permission prompts.
5. **High Contrast & Font Scaling:** Supports `@media (forced-colors: active)` Windows Contrast Themes, in-app font scaling (`90%`–`125%`), and Windows DPI scaling (`100%`–`200%`).
