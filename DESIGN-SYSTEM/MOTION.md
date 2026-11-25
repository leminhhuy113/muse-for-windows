# Motion Design Specification

**Standard:** 1RS v1.2 × Emil Kowalski (`animate`) × Lucian UX/UI

---

## 1. Duration & Easing Tokens

| Token | Value | Application |
|---|---|---|
| `--ms-duration-instant` | `80ms` | Button active press (`scale(0.97)`), checkbox tick start |
| `--ms-duration-fast` | `120ms` | Hover states, tooltip glide, menu highlight |
| `--ms-duration-normal` | `180ms` | Dropdowns, popovers, tab thumb slide, toast exit |
| `--ms-duration-moderate` | `220ms` | Modal enter, side inspector panel slide, Command Palette |
| `--ms-duration-slow` | `280ms` | Collapsible navigation rail, Dynamic Island expansion |

**Easing Curves:**
- `--ms-ease-out`: `cubic-bezier(0.23, 1, 0.32, 1)` (Primary entrance curve)
- `--ms-ease-in-out`: `cubic-bezier(0.645, 0.045, 0.355, 1)` (On-screen morphs)
- `--ms-spring`: `cubic-bezier(0.34, 1.36, 0.64, 1)` (Restrained tactile spring for Lucian indicators)

---

## 2. Performance & Accessibility Laws

1. **Compositor-Only Properties:** Animate `transform` and `opacity` (and GPU `clip-path` on Command Palette `#046`). Avoid layout-thrashing `top`/`left`/`margin` loops.
2. **Exit Faster Than Enter:** Modal/popover exits run at ~75% of entrance duration (`140ms` vs `200ms`) so UI never blocks user velocity.
3. **Reduced Motion & Minimized Suspension:**
   - Honors OS `@media (prefers-reduced-motion: reduce)` AND the in-app **Reduced Motion** / **Animation Intensity (`off` | `subtle` | `standard`)** setting.
   - When the window is minimized or hidden to the System Tray, `document.documentElement.dataset.windowMinimized = 'true'` pauses all decorative CSS animations (`animation-play-state: paused`) to keep idle CPU near `0%`.
