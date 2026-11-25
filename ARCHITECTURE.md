# ARCHITECTURE.md — System & Security Architecture

**Product:** Muse for Windows v1.0.0 — 1MS Studio (1RS v1.2)

---

## 1. High-Level Process & Trust Boundary Topology

```mermaid
flowchart TB
  subgraph Main["Electron Main Process (Trusted Privileged Coordinator)"]
    WM["Window & WebContentsView Manager"]
    SM["Session & Recovery Manager (persist:muse-official)"]
    PM["Permission Center Engine (Default-Deny + Expiry)"]
    WS["Local Workspace Manager (10GB Quota + Path/Junction Guard)"]
    LB["Local Agent Bridge (24 Typed Tools + Zod Schemas)"]
    AL["SQLite Audit & Activity Logger (Redacted)"]
    SEC["DPAPI Secret Store (safeStorage)"]
    MCP["Loopback MCP Server (127.0.0.1 Bearer Auth)"]
    AGENT["Mode C Independent Agent Runner (Opt-in)"]
    UPD["Update Manager (electron-updater + Signature Gate)"]
  end

  subgraph LocalUI["Trusted Local Renderer (React + Vite + 1RS v1.2)"]
    SHELL["Title Bar + Compact Rail + 28 Local Screens"]
    QA["Quick Assistant Launcher Window"]
    DI["Dynamic Island Floating Indicator"]
  end

  subgraph RemoteMuse["Untrusted Remote WebContentsView (Isolated)"]
    MUSE["https://muse.ai (sandbox: true, no preload, no Node/IPC)"]
  end

  subgraph NativeWin["Isolated Local Helpers"]
    PS["Windows Native Helper (PowerShell + Win32 / UI Automation)"]
    PW["Playwright Assistant Browser (Dedicated Profile)"]
  end

  LocalUI <-->|"Sender-Validated Typed IPC (Zod)"| Main
  Main -->|"Bounds / Navigation / Downloads Only"| RemoteMuse
  LB --> PM
  LB --> AL
  LB --> WS
  LB --> PS
  LB --> PW
  AGENT --> LB
  MCP --> LB
```

---

## 2. Directory Layout

```text
muse-for-windows/
├── .github/                  # CI, Security, Dependency Review, Windows Release workflows & templates
├── DESIGN-SYSTEM/            # 1MS Studio 1RS v1.2 specs, DESIGN-TOKENS.json, Lucian map & ui-kit docs
├── docs/                     # Research, parity, security, privacy, licensing, user & build guides
├── integrations/             # Muse URL/session policies, MCP protocol definitions, Mode C adapters
├── native/
│   └── windows-helper/       # Parameterized PowerShell + C# Win32/UIA helper scripts
├── reports/                  # Phase reports, UI/Visual/A11y/Security/Performance/Publication audits
├── resources/                # Original SVG/PNG/ICO brand assets & bundled metadata
├── scripts/                  # Icon generator, secret scanner, SBOM & SHA256 release generators
├── src/
│   ├── main/                 # Electron Main process modules (windows, tray, shortcuts, bridge, security...)
│   ├── preload/              # Narrow contextBridge API for trusted local renderer only
│   ├── renderer/             # React 19 + Tailwind + Lucian UX/UI adapted components + 28 screens
│   └── shared/               # Branding config, constants, TypeScript types, Zod IPC/tool contracts
└── tests/                    # Unit, integration, security, visual QA & E2E suites
```

---

## 3. Core Security Invariants

1. **Zero Shared Context with Remote Content:** `https://muse.ai` runs in a dedicated `WebContentsView` with `sandbox: true`, `contextIsolation: true`, `nodeIntegration: false`, `webSecurity: true`, `allowRunningInsecureContent: false`, and **no preload script**.
2. **Sender Origin Verification:** Every `ipcMain.handle` call verifies that `event.sender` belongs to a trusted local `BrowserWindow` (`mainWindow` or `quickAssistantWindow`) and that `event.senderFrame.url` starts with the local `file://` bundle or `ELECTRON_RENDERER_URL` in dev.
3. **Filesystem Containment:** `WorkspaceGuard` resolves canonical paths via `fs.realpathSync.native`, rejects UNC paths (`\\`), rejects sensitive system/credential directories (`.ssh`, `AppData\Local\Google\Chrome`, `AppData\Local\Microsoft\Edge`, `Windows`, `System32`, `.gnupg`, `.aws`), and inspects NTFS `ReparsePoint` attributes so junctions/symlinks cannot escape `%USERPROFILE%\Documents\Muse` or explicitly approved folders.
4. **Loopback-Only Transport:** The optional local MCP HTTP server binds exclusively to `127.0.0.1` with cryptographic per-session Bearer token authentication, `Origin`/`Host` validation (DNS-rebinding & CSRF defense), and rate limiting.
5. **Secret Redaction:** Secrets live only in Windows DPAPI via Electron `safeStorage`; exported settings and SQLite activity logs automatically strip tokens, keys, cookies, Authorization headers, and sensitive payloads.
