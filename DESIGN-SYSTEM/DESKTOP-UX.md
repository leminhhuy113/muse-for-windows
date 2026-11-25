# Windows Native Desktop UX Specification

**Standard:** 1RS v1.2 — Windows 10 & Windows 11

---

## 1. Window Chrome & Snap Layouts

- Uses Electron `titleBarStyle: 'hidden'` + `titleBarOverlay` synchronized dynamically whenever the user switches between Dark and Light themes (`color: '#0B0D10'`, `symbolColor: '#F5F7FA'` in Dark; `color: '#F5F6F8'`, `symbolColor: '#15171C'` in Light; `height: 38`).
- Preserves native Windows 11 **Snap Layouts** (`Win+Z` or hovering the native maximize button), Aero Snap edge dragging, multi-monitor DPI transitions, and taskbar thumbnail previews.

## 2. System Tray & Lifecycle

- Single-instance lock focuses and restores the existing window when launched a second time or invoked via `muse-win://` deep link.
- Optional **Minimize to Tray** and **Close to Tray** keep quick-launch readiness minimal while releasing unnecessary background work.
- Tray menu provides localized quick actions: *Open Muse*, *Quick Assistant (`Ctrl+Alt+Space`)*, *Local Workspace*, *Pause Local Bridge*, *Emergency Stop Computer Use*, and *Quit Muse*.

## 3. Native Keyboard Shortcuts (Windows Conventions)

| Shortcut | Scope | Action |
|---|---|---|
| `Ctrl + Alt + M` | Global (OS-wide) | Show / Hide Muse for Windows |
| `Ctrl + Alt + Space` | Global (OS-wide) | Toggle Quick Assistant |
| `Ctrl + Alt + Shift + M` | Global (OS-wide) | Open Local Workspace Explorer |
| `Ctrl + K` | App-local | Toggle Command Palette |
| `Ctrl + Shift + S` | App-local | Open Application Settings |
| `Escape` | App-local | Close top overlay / Quick Assistant / Inspector |
