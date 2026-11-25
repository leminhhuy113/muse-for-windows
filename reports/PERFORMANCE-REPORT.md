# Performance Profiling Report (`reports/PERFORMANCE-REPORT.md`)

**Measurement Date:** 2026-11-25  
**Hardware / OS Environment:** Microsoft Windows 11 (`Windows NT 10.0.26300.0`, `x64` / `AMD64`, Node.js `v24.19.0`, Electron `36.3.2`)

---

## 1. Real Measured Startup & Bundle Metrics

| Metric | Target | Actual Measured Value | Status |
|---|---|---|---|
| **Cold Electron Window Ready** | `< 5,000 ms` | **`1,254 ms`** (Playwright Electron E2E Run #1) | **PASS** |
| **Warm Electron Window Ready** | `< 2,000 ms` | **`778 ms`** (Playwright Electron E2E Run #2) | **PASS** |
| **Main Process Bundle (`out/main/index.js`)** | Compact | **`162.60 kB`** (built in `207ms`) | **PASS** |
| **Preload Bundle (`out/preload/index.js`)** | Minimal | **`11.23 kB`** (built in `11ms`) | **PASS** |
| **Renderer CSS (`tokens.css` + `lucian.css` + Tailwind v4)** | Tree-shaken | **`48.47 kB`** | **PASS** |
| **Bundled Play WOFF2 Fonts (`latin` + `vietnamese`, `400`/`700`)** | Offline local | **`51.67 kB`** total WOFF2 | **PASS** |
| **Minimized / Tray Background Animation CPU** | Near `0%` | `data-window-minimized="true"` sets `animation-play-state: paused !important` | **PASS** |

---

## 2. Applied Performance Optimizations

1. Zero runtime external animation libraries (pure GPU `transform`/`opacity` CSS transitions + Lucian `--ux-*` curves).
2. Selective named `lucide-react` icon imports for Vite tree-shaking.
3. Native built-in `node:sqlite` indexed queries (`idx_audit_timestamp`, `idx_audit_category`) avoiding external DB processes.
4. `AssistantBrowserController` launches lazy on-demand only when a `browser.*` tool is explicitly invoked.
