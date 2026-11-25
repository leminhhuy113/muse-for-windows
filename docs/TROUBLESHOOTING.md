# Troubleshooting Guide (`docs/TROUBLESHOOTING.md`)

---

## 1. Windows SmartScreen Warning on First Launch
- **Cause:** Public v1.0.0 open-source builds are distributed unsigned unless a commercial EV/OV certificate is configured.
- **Resolution:** Verify the file hash against `SHA256SUMS.txt` (`Get-FileHash .\Muse-for-Windows-1MS-Studio-v1.0.0-Setup-x64.exe -Algorithm SHA256`), then click **More info -> Run anyway**. Never disable Windows Defender or SmartScreen globally.

## 2. Official Muse Sign-In / OAuth Popup Blocked
- **Cause:** Certain corporate firewalls or SSO providers restrict embedded OAuth popups.
- **Resolution:** Navigate to **Account & Session** and click **Sign In via System Browser (OAuth Fallback)**, or verify network access to `https://muse.ai` and `https://accounts.meta.com`.

## 3. Global Keyboard Shortcut Conflict
- **Cause:** Another desktop launcher already registered `Ctrl+Alt+Space` or `Ctrl+Alt+M`.
- **Resolution:** Open **Diagnostics** to inspect `shortcutStatus` conflict flags, then rebind the shortcut in **Settings -> Keyboard Shortcuts**.

## 4. Local Tool Call Denied (`PERMISSION_DENIED`)
- **Cause:** Local Bridge is paused, the category policy is set to `Disabled`/`Deny`, or an approval dialog timed out after 45 seconds.
- **Resolution:** Check **Permissions Center** and ensure `Local Bridge` is unpaused and the relevant category (`files`, `browser`, `computer_use`, `shell`) is enabled.

## 5. Recovering from Corrupted Settings
- **Resolution:** Muse for Windows automatically restores from `settings.v1.json.bak`. You can also click **Reset to 1MS Studio Defaults** in **Settings** at any time.
