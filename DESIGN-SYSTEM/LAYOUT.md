# Desktop Layout & Viewport Architecture

**Standard:** 1RS v1.2  
**Reference Resolution:** `1920 × 1080`

---

## 1. Shell Regions

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ [M] Muse  [<] [>] [↻]  ● Connected (muse.ai)      [Search / Ctrl+K]  [_][□][×]│ 38px Title Bar
├────────┬───────────────────────────────────────────────────┬─────────────────┤
│  Rail  │                                                   │   Contextual    │
│ 56px / │       Official Muse Workspace (WebContentsView)   │    Inspector    │
│ 224px  │                         OR                        │  (Optional      │
│        │       Local Trusted Screen (Workspace / Settings) │   340px Split)  │
│        │                                                   │                 │
└────────┴───────────────────────────────────────────────────┴─────────────────┘
```

1. **Native Title Bar (`38px` height):**
   - Uses `-webkit-app-region: drag` with `-webkit-app-region: no-drag` on interactive controls.
   - Integrates seamlessly with Electron `titleBarOverlay` on Windows 10/11 so native minimize/maximize/close buttons and **Windows 11 Snap Layouts (`Win+Z` hover on maximize)** work natively!
   - Right-inset `env(titlebar-area-width)` / `138px` reserved on Windows so local controls never collide with native caption buttons.
2. **Compact Local Navigation Rail (`56px` collapsed / `224px` expanded, customizable `180px–280px`):**
   - Because official `muse.ai` already renders its own internal navigation (Feed, Ideas, Goals, Library, Chat), our local shell defaults to a **sleek 56px icon rail** (expandable on click or shortcut) so we **never create awkward double full-width sidebars**!
   - Full-Screen Muse Mode (`F11` or Focus toggle) collapses chrome further so `muse.ai` fills maximum viewport area.
3. **`WebContentsView` Coordinate Synchronization:**
   - Whenever the user is viewing **Official Muse Workspace** and no modal overlay (Command Palette, Permission ApprovalDialog) is open, the Main process sets `museView.setBounds({ x: railWidth, y: titleBarHeight, width: mainWidth, height: contentHeight })`.
   - Whenever a local screen (Workspace, Permissions, Bridge, Activity, Settings, About, Recovery) OR a modal overlay opens, the Main process temporarily hides `museView` (`setVisible(false)`) while preserving its live DOM/session state in memory — guaranteeing zero z-index bleed and instant `0ms` return!

---

## 2. Validated Responsive Matrix

- `1280 × 720` & `1366 × 768`: Rail defaults to `56px`; Inspector renders as slide-over sheet (`Lucian #273`).
- `1600 × 900` & `1920 × 1080`: Rail supports `56px` or `224px`; Inspector docks cleanly at `340px`.
- `2560 × 1440` & `3840 × 2160`: Max-width readable containers (`960px`) on Settings/Permissions screens prevent ultra-wide line lengths while `muse.ai` and Workspace Explorer utilize full fluid width.
