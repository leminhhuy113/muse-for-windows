# Detailed Privacy & Data Governance (`docs/PRIVACY.md`)

**Product:** Muse for Windows v1.0.0 — 1MS Studio

---

## 1. What Data Is Stored Locally

| Data Type | Windows Location | Purpose & Protection |
|---|---|---|
| Application Settings | `%APPDATA%\Muse for Windows\settings.v1.json` | Theme, language (`vi`/`en`/`zh`/`ja`/`ko`), shortcuts, permission policies. Contains **zero** secrets. |
| Encrypted Mode C Keys | `%APPDATA%\Muse for Windows\secrets.dpapi.json` | Optional user-supplied Mode C API key encrypted with **Windows DPAPI** (`safeStorage`). |
| Official Muse Session | `%APPDATA%\Muse for Windows\Partitions\muse-official` | Isolated Chromium cookie/storage partition for `https://muse.ai`. Never read or extracted by local code. |
| Activity Audit Log | `%APPDATA%\Muse for Windows\audit_history.sqlite` | Local tool call history with automatic secret redaction and configurable retention (default 30 days). |
| Local Workspace | `%USERPROFILE%\Documents\Muse\` | User-controlled `Workspace`, `Shared`, `Downloads`, `Output`, and `Temporary` folders. |
| Assistant Browser Profile | `%APPDATA%\Muse for Windows\AssistantBrowserProfile` | Dedicated Playwright browser profile isolated from personal Chrome/Edge. |

---

## 2. How to Revoke Permissions & Delete Local Data

1. **Clear Official Muse Session:** Open **Account & Session -> Sign Out & Clear Local Session Cache**.
2. **Revoke All Local Permissions:** Open **Permissions Center -> Revoke All Permissions**.
3. **Clear Activity History:** Open **Activity History -> Clear Audit Logs**.
4. **Remove Encrypted API Key:** Open **Integrations -> Remove Stored Key**.
5. **Complete Uninstall:** Uninstall via Windows *Installed Apps* and optionally delete `%APPDATA%\Muse for Windows` and `%USERPROFILE%\Documents\Muse`.
