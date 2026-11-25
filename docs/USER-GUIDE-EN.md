# User Guide — Muse for Windows (`v1.0.0`)

**Developed by:** 1MS Studio · **Design Standard:** 1RS v1.2  
**Supported Languages:** Vietnamese (`vi`) · English (`en`) · Simplified Chinese (`zh`) · Japanese (`ja`) · Korean (`ko`)

---

## 1. Overview

**Muse for Windows** is an independent, security-first open-source Windows 10 and Windows 11 desktop client for **Muse** (`https://muse.ai`), combining an isolated official Muse workspace with native Windows shell controls, global keyboard shortcuts, Quick Assistant, a 10 GB sandboxed Local Workspace, and a default-deny Permission Center.

---

## 2. Installation & First Launch

- **Per-User Installer (`Muse-for-Windows-1MS-Studio-v1.0.0-Setup-x64.exe`):** Installs cleanly into your user profile without requiring Administrator privileges, creating Start Menu and Desktop shortcuts.
- **Portable Executable (`Muse-for-Windows-1MS-Studio-v1.0.0-Portable-x64.exe`):** Runs standalone with zero installation.
- On first launch, choose your preferred language (**Tiếng Việt**, **English**, **简体中文**, **日本語**, **한국어**, or **System**), theme (**Dark**, **Light**, **System**), and sandboxed workspace location (`%USERPROFILE%\Documents\Muse`).

---

## 3. Default Keyboard Shortcuts

| Shortcut | Scope | Action |
|---|---|---|
| `Ctrl + Alt + M` | Global (Windows) | Show or hide Muse for Windows |
| `Ctrl + Alt + Space` | Global (Windows) | Toggle Quick Assistant launcher |
| `Ctrl + Alt + Shift + M` | Global (Windows) | Open Local Workspace Explorer |
| `Ctrl + K` | In-App | Open Command Palette |
| `Ctrl + Shift + S` | In-App | Open Application Settings |

---

## 4. Workspace, Permissions & Safety

- **Local Workspace (`~/Documents/Muse`):** Organizes `Workspace`, `Shared`, `Downloads`, `Output`, and `Temporary` folders with a configurable 10 GB default limit, SHA-256 verified folder migration with automatic rollback, and Windows Recycle Bin integration.
- **Permissions Center:** Governs Files, Folders, Applications, Display Capture, Assistant Browser, System Info, Computer Use, Shell Execution, and Network Integrations.
- **Emergency Stop:** Instantly aborts any active tool, Playwright browser session, or Windows UI Automation step from the Dynamic Island pill, Permissions Center, or System Tray.

---

## Independent Project Disclaimer

> Muse for Windows is an independent open-source project developed by 1MS Studio. It is not affiliated with, endorsed by, or sponsored by the original Muse service provider. All third-party trademarks and service names belong to their respective owners.
