# PROJECT.md — Muse for Windows

**Product Name:** Muse for Windows  
**Short Name:** Muse  
**Developer:** 1MS Studio  
**Development Standard:** 1RS v1.2  
**Version:** 1.0.0  
**License:** MIT License  
**Repository:** `https://github.com/leminhhuy113/muse-for-windows`

---

## 1. Mission & Product Vision

**Muse for Windows** delivers a native-grade, security-first Windows 10 and Windows 11 desktop client for **Muse** (`https://muse.ai`, by Meta Platforms, Inc.), combining the official Muse web workspace (Feed, Ideas, Goals, Library, Chat, Connectors, and Cloud Computer) with native Windows desktop ergonomics, a sandboxed Local Workspace, a granular Permission Center, a permission-gated Local Agent Bridge, Playwright Browser Automation, and opt-in Windows UI Automation Computer Use.

---

## 2. Three Capability Modes

| Mode | Name | Default State | Summary |
|---|---|---|---|
| **Mode A** | Official Muse Desktop Client | **Enabled (Primary)** | Hosts `https://muse.ai` in an isolated `WebContentsView` (`persist:muse-official`) with native Windows title bar, Snap Layouts, System Tray, global shortcuts, Quick Assistant handoff, uploads/downloads, and session recovery. Zero extra API keys required. |
| **Mode B** | Verified Muse Local Integration | **Gated / Honest Status** | Provides a loopback-only (`127.0.0.1`) authenticated MCP server for compatible local MCP clients (e.g., `Muse Code` CLI) + Shared Workspace file exchange. Direct cloud `muse.ai` -> `127.0.0.1` local tool execution is transparently marked **Requires Official Integration** because cloud Muse executes inside Meta's remote Secure VM. |
| **Mode C** | Optional Independent Local Agent | **Disabled by Default** | Opt-in local agent adapter (local Ollama or user-provided OpenAI-compatible / Gemini / Anthropic key encrypted via Windows DPAPI) executing real local workflows through the Permission Center, Local Agent Bridge, Playwright Browser Automation, and Windows Computer Use. |

---

## 3. Target Platforms & Release Artifacts

- **Windows 10 x64** & **Windows 11 x64** (`Setup-x64.exe` & `Portable-x64.exe` — Verified)
- **Windows 11 ARM64** (`Setup-arm64.exe` & `Portable-arm64.exe` — Cross-compiled, marked unverified until tested on physical ARM64 hardware)
- **Languages:** Vietnamese (`vi`) & English (`en`), defaulting to OS locale with live switching
- **Themes:** Dark (Default), Light, System

---

## 4. Independent Project Disclaimer

> Muse for Windows is an independent open-source project developed by 1MS Studio. It is not affiliated with, endorsed by, or sponsored by the original Muse service provider. All third-party trademarks and service names belong to their respective owners.
