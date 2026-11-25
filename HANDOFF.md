# HANDOFF.md — Complete Project Continuity & Maintenance Guide

**Product:** Muse for Windows v1.0.0 — Developed by 1MS Studio · Powered by 1RS v1.2  
**Public Repository:** `https://github.com/leminhhuy113/muse-for-windows`  
**Status:** v1.0.0 Production-Ready Open-Source Release

---

## 1. Quick Orientation for Future Sessions / Engineers

1. Read `AGENTS.md`, `PROJECT.md`, `ARCHITECTURE.md`, and `DESIGN-SYSTEM/README.md` first.
2. On Windows PowerShell where `.ps1` execution policy is restricted, invoke `npm.cmd` / `npx.cmd` (or `cmd /c "npm ..."`).
3. Before packaging on a fresh Windows machine without Developer Mode symlink privileges, `npm run dist:win:x64` automatically runs `node scripts/prepare-wincodesign.mjs` so `rcedit` icon/metadata stamping succeeds without elevation.

---

## 2. Verified Capabilities vs. Honest Limitations

- **Verified Working:** Mode A isolated `https://muse.ai` shell, native Windows 10/11 title bar + Snap Layouts + Tray + Global Shortcuts + Jump Lists, Quick Assistant, 10 GB WorkspaceGuard (including NTFS junction escape protection), Permission Center, 34-tool Local Agent Bridge, `127.0.0.1` Bearer-authenticated MCP server, SQLite Audit Log, 5 languages (`VI/EN/ZH/JA/KO`), Dark/Light/System themes, and Windows `x64` Setup & Portable executables (`778ms` warm startup).
- **Documented Limitations:**
  1. **Mode B Direct Cloud `muse.ai` -> `127.0.0.1` Bridge:** Requires an official Meta desktop integration mechanism because consumer `muse.ai` executes in Meta's cloud Secure VM.
  2. **Unsigned Open-Source Builds:** v1.0.0 binaries are unsigned; silent auto-install is intentionally disabled until `CSC_LINK` signing credentials are provided.
  3. **ARM64 Builds:** Cross-compiled cleanly; runtime verification requires physical Windows 11 ARM64 hardware.
