# Visual Quality Assurance Report (`reports/VISUAL-QA.md`)

**Date:** 2026-11-25  
**Harness:** Playwright Electron Live Rendering (`_electron.launch`) + Visual Pixel Review

---

## 1. Captured Visual QA Matrix

All screenshots were captured from the live built Electron application (`out/main/index.js`) using sanitized demonstration fixtures (zero private accounts or personal data):

- **Dark Theme (`reports/screenshots/dark/`):**
  - `01-onboarding-en.png` & `01-onboarding-vi.png`
  - `03-main-workspace.png`
  - `04-quick-assistant.png`
  - `06-local-workspace.png`
  - `08-permissions-center.png`
  - `09-local-bridge.png`
  - `10-computer-use.png`
  - `11-agent-activity.png`
  - `13-activity-history.png`
  - `14-downloads.png`
  - `15-notifications.png`
  - `16-settings.png`
  - `21-integrations.png`
  - `22-updates.png`
  - `23-diagnostics.png`
  - `24-about.png`
- **Light Theme (`reports/screenshots/light/`):** `16-settings-light.png`
- **Compact Viewport `1280×720` (`reports/screenshots/compact/`):** `compact-1280x720.png`
- **High-DPI / Scaled `1920×1080` (`125%` Vietnamese, `reports/screenshots/high-dpi/`):** `high-scale-1920x1080-vi.png`
- **Interactive States & CJK (`reports/screenshots/states/`):** `01-onboarding-zh.png` (`简体中文`), `05-command-palette.png` (`Ctrl+K`)
- **Public Documentation Assets (`docs/assets/`):** `github-social-preview.png` (`1280×640`) + 9 curated public screenshots in `docs/assets/screenshots/`.

---

## 2. Iterative Visual Flaws Detected & Resolved

During direct visual inspection of the initial screenshot pass, three concrete UI issues were identified and resolved prior to packaging:
1. **Search Input Leading Icon Overlap:** In `LocalWorkspacePage` and `ActivityHistoryPage`, `.lx-input` (`padding: 0 12px`) overrode `pl-8`, causing the `Search` icon to touch placeholder text. Fixed by introducing `.lx-input-search { padding-left: 34px; }`.
2. **Onboarding Bottom Breathing Room (CJK / `900px` viewport):** Added `pb-12` bottom padding on `OnboardingPage` so primary CTA buttons never crowd the bottom edge.
3. **Clean Sandboxed URL Presentation:** Replaced raw `data:text/html` E2E sandbox strings in `MuseWorkspaceHeaderBar` with `https://muse.ai (persist:muse-official · Sandboxed)` while keeping full live URL display in production.
