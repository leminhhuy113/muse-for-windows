# CODEX-HANDOFF.md — Gói Bàn Giao Kỹ Thuật Toàn Diện Cho OpenAI Codex
## Muse for Windows `v1.1.0` — 1MS Studio (`https://1ms-studio.com`) · Standard `1RS v1.2`

Tài liệu này được thiết kế chuyên biệt để **OpenAI Codex** (Codex CLI / Codex IDE / Codex Agent) tiếp nhận toàn bộ dự án **Muse for Windows**, kiểm tra sức khỏe mã nguồn, chạy kiểm thử tự động, sửa lỗi và phát triển tính năng mới mà không làm hỏng kiến trúc bảo mật hay hệ thống thiết kế.

---

## 1. Vị trí Thư mục Làm việc & Trạng thái Kho Mã nguồn

| Hạng mục | Giá trị chính xác |
|---|---|
| **Thư mục Workspace cục bộ** | `c:\Users\lemin\Downloads\MUSE PC` |
| **GitHub Repository (Public)** | `https://github.com/leminhhuy113/muse-for-windows` |
| **Nhánh chính & Nhánh phát triển** | `main` (mặc định, đồng bộ với `develop`) |
| **Phiên bản đã phát hành mới nhất** | `v1.1.0` (`https://github.com/leminhhuy113/muse-for-windows/releases/tag/v1.1.0`) |
| **Tệp quy tắc Codex tự động đọc** | `c:\Users\lemin\Downloads\MUSE PC\AGENTS.md` |
| **Thư mục xuất bộ cài cục bộ** | `c:\Users\lemin\Downloads\MUSE PC\dist\` *(gitignored)* |
| **Thư mục đầu ra biên dịch Vite** | `c:\Users\lemin\Downloads\MUSE PC\out\` *(gitignored)* |

> **Lưu ý quan trọng trên Windows PowerShell:**  
> Nếu máy bật `ExecutionPolicy` chặn tệp `npm.ps1`, hãy luôn gọi **`npm.cmd`** và **`npx.cmd`** thay vì `npm` / `npx` (ví dụ: `npm.cmd test`, `npm.cmd run build`).

---

## 2. Bản đồ Kiến trúc & Các Tệp Trọng tâm (Codebase Map)

Dự án chia thành **4 vùng tin cậy tách biệt nghiêm ngặt** (cấu hình trong `electron.vite.config.ts`, `tsconfig.node.json`, `tsconfig.web.json`):

### A. Tiến trình Chính Electron (`src/main/` — Alias `@main`, `@shared`)
- `src/main/index.ts` — Điểm khởi chạy chính: khóa đơn phiên (`requestSingleInstanceLock`), đăng ký toàn bộ kênh IPC qua `registerSecureHandler` (luôn kiểm tra `assertTrustedLocalIpcSender` + Zod 4), kết nối `WindowManager`, `MuseViewManager`, `TrayManager`, `PermissionManager`, `LocalAgentBridge`, `LoopbackMcpServer`, `UpdateManager`.
- `src/main/windows/windowManager.ts` — Quản lý `BrowserWindow` chính (`titleBarStyle: 'hidden'`, `titleBarOverlay` cao `44px` hỗ trợ Windows 11 Snap Layouts `Win+Z`), cửa sổ nổi `QuickAssistant`, và **đồng bộ `nativeTheme.themeSource`** (`dark` / `light` / `system`) để `https://muse.ai` tự động đổi màu nền khớp với vỏ ứng dụng.
- `src/main/windows/museViewManager.ts` — Điều khiển `WebContentsView` cô lập chứa `https://muse.ai` trong phân vùng `persist:muse-official` (**không preload, `sandbox: true`, `contextIsolation: true`, `nodeIntegration: false`**), quản lý tải tệp về `Workspace/Downloads`, OAuth popup, và gắn `MuseQuotaMonitor`.
- `src/main/windows/museQuotaMonitor.ts` — **Bộ đọc Quota Usage một chiều không nâng quyền:**
  - Chạy biểu thức thu thập văn bản lá (`parseMuseQuotaFromLeafTexts`) và dữ liệu Relay JSON (`parseMuseQuotaFromRelayJson`) từ khung chính `WebFrameMain` mà không gắn bất kỳ biến toàn cục hay kênh IPC nào vào `muse.ai`.
  - Hỗ trợ quét thụ động khi trang/hộp thoại `Settings -> General -> Usage` hiển thị và đồng bộ chủ động 1 chạm (`syncNow`), lưu đệm đã lọc sạch qua Zod vào `%APPDATA%/.../muse-quota-cache.json`.
- `src/main/tray/quotaTrayIcon.ts` & `src/main/tray/trayManager.ts` — **Biểu tượng Khay hệ thống động & Menu đa ngôn ngữ:**
  - `createQuotaTrayPngBuffer(percentUsed, agentActive)` tự tạo bộ đệm ảnh PNG `32×32` RGBA chống răng cưa bằng `node:zlib` (không phụ thuộc thư viện C++ ngoài), vẽ chữ `M` thương hiệu kèm thanh tiến trình hạn mức đổi màu (`#C7F34B` `<70%`, `#F5B942` `70–89%`, `#FF5C5C` `>=90%`).
  - `TrayManager` tự động dịch toàn bộ chú giải rê chuột (`setToolTip`) và menu chuột phải sang `vi`, `en`, `zh`, `ja`, `ko`.
- `src/main/workspace/workspaceManager.ts` — Bảo vệ thư mục cô lập `10 GB`, chống `..`, chặn đường dẫn UNC, kiểm tra `fs.lstatSync().isSymbolicLink()` + `fs.realpathSync.native()` chống thoát vùng qua **NTFS Junction**, chặn cứng các thư mục nhạy cảm (`C:\Windows`, `.ssh`, `.gnupg`, `.aws`, hồ sơ Chrome/Edge/Firefox, trình quản lý mật khẩu).
- `src/main/permissions/permissionManager.ts` & `src/main/bridge/localAgentBridge.ts` — Trung tâm quyền hạn từ chối mặc định (hộp thoại duyệt tự hết hạn sau 45s, mặc định chọn *Deny*) và danh mục **34 công cụ cục bộ** (`fs.*`, `app.*`, `system.*`, `workspace.info`, `screen.*`, `browser.*`, `shell.run`, `computerUse.*`).
- `src/main/integrations/` — `mcpLoopbackServer.ts` (`127.0.0.1:43821`, Bearer 256-bit `timingSafeEqual`, chặn `Origin` CSRF & kiểm tra `Host`), `browserAutomation.ts` (Playwright hồ sơ riêng), `independentAgentRunner.ts` (Chế độ C tùy chọn qua Ollama / khóa DPAPI), `windowsHelperClient.ts` (gọi `native/windows-helper/muse-helper.ps1`).
- `src/main/diagnostics/auditLogger.ts` & `src/main/security/` — Nhật ký kiểm toán `node:sqlite`, `secretStore.ts` (mã hóa khóa API bằng Windows DPAPI `safeStorage`), `originGuard.ts`, `redact.ts`.

### B. Cầu nối Preload Hẹp (`src/preload/index.ts`)
- Chỉ gắn cho `BrowserWindow` giao diện cục bộ tin cậy (`file://.../out/renderer/index.html`). Không bao giờ gắn vào `WebContentsView` của `muse.ai`.

### C. Hợp đồng Dùng chung (`src/shared/` — Alias `@shared`)
- `src/shared/branding/index.ts` — Cấu hình phiên bản (`1.1.0`), build number, URL và tuyên bố dự án độc lập.
- `src/shared/types/index.ts` — Toàn bộ kiểu TypeScript (`AppSettings`, `MuseConnectionState`, `MuseQuotaSnapshot`, `BridgeToolName`, v.v.).
- `src/shared/contracts/ipc.ts` — Danh sách hằng số kênh IPC (`IPC_CHANNELS`).
- `src/shared/schemas/index.ts` — Toàn bộ lược đồ **Zod 4** (`zod@4.6.7`, dùng `z.url()` và giới hạn `.max(...)` cho mảng).

### D. Giao diện Người dùng Cục bộ (`src/renderer/` — Alias `@renderer`, `@shared`)
- `src/renderer/themes/tokens.css` — Hệ thống biến màu chuẩn `https://1ms-studio.com/`:
  - **Dark (`[data-theme="dark"]`):** nền `#151A14`, bề mặt `#1F271D`, nổi `#283224`, nhấn `#C7F34B`, chữ `#F4F9ED`.
  - **Light (`[data-theme="light"]`):** nền `#F5FBE9`, bề mặt `#FBFDF7`, nổi `#FFFFFF`, nút hành động `#181D27`, nhấn rừng `#416315`.
  - *Quy tắc CSS quan trọng:* Mọi CSS reset của thẻ HTML/Lucian trong `tokens.css` **phải nằm bên trong `@layer base { ... }`** để không ghi đè các lớp tiện ích `@layer utilities` của Tailwind CSS v4.
- `src/renderer/components/ui/lucian.css`, `Primitives.tsx`, `Overlays.tsx` — Các thành phần **Lucian UX/UI** chính gốc (`#417` thanh bên thu gọn đàn hồi, `#037` thẻ tài khoản, `#416` thanh chuyển 5 không gian kiểu thạch kéo giãn, `#046` bảng lệnh `Ctrl+K`, `#471` phím bấm 3D, `#433` công tắc kéo giãn, `#267` chọn ngôn ngữ, `#044` accordion, `#070` thông báo xếp lớp). **Luôn giữ dòng chú thích bản quyền MIT `Seokwoooo` ở đầu tệp.**
- `src/renderer/layouts/DesktopShell.tsx` — Khung trạm làm việc 5 Không gian + `WindowsCompanionDock` bên phải + Thanh trạng thái đáy chứa viên thuốc & thẻ **Quota Usage ở góc trái dưới** (`data-testid="quota-status-trigger"`, `quota-sync-btn`, `quota-popover`).
- `src/renderer/locales/{en,vi,zh,cjk}.ts` — Từ điển đa ngôn ngữ có kiểm tra kiểu biên dịch nghiêm ngặt từ `en.ts` (`TranslationDictionary`).
- `src/renderer/pages/` — 5 tệp chứa trọn bộ 28 màn hình ứng dụng.

---

## 3. Cẩm nang Lệnh Kiểm tra, Chạy Thử & Đóng gói (Dành cho Codex)

### 3.1. Bộ lệnh Kiểm định Bắt buộc (Chạy sau mọi thay đổi mã nguồn)
```powershell
# 1. Kiểm tra lỗ hổng bảo mật trên dependencies sản phẩm (BẮT BUỘC = 0 lỗ hổng High/Critical)
npm.cmd run audit:prod

# 2. Kiểm tra kiểu TypeScript trên cả tiến trình Node/Main và Web/Renderer
npm.cmd run typecheck

# 3. Kiểm tra ESLint
npm.cmd run lint

# 4. Chạy 26 bài kiểm thử đơn vị, bảo mật & tích hợp Windows Helper (Vitest)
npm.cmd test

# 5. Quét rò rỉ khóa bí mật / token trên toàn bộ cây thư mục & lịch sử Git
npm.cmd run security:scan

# 6. Biên dịch gói Main, Preload và Renderer vào thư mục out/
npm.cmd run build

# 7. Chạy kiểm thử tự động giao diện đầu-cuối (Playwright Electron E2E)
npm.cmd run test:e2e
```

### 3.2. Chạy ứng dụng ở chế độ phát triển (Hot Reload)
```powershell
npm.cmd run dev
```

### 3.3. Đóng gói bộ cài Windows `.exe` & Kiểm thử bản đóng gói thực tế
```powershell
# Đóng gói riêng bản Windows x64 (nhanh hơn khi test cục bộ):
npm.cmd run dist:win:x64

# Hoặc đóng gói đầy đủ cả x64 + ARM64 kèm tạo Hero Banner, SBOM.cdx.json & SHA256SUMS.txt:
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
npm.cmd run dist:win:all
npm.cmd run release:metadata
```

**Lệnh chạy thử (Smoke Test) tệp `.exe` đã đóng gói trên Windows x64 bằng Playwright:**
```powershell
node -e "const fs=require('fs'),os=require('os'),path=require('path'),{_electron}=require('@playwright/test');(async()=>{const ud=fs.mkdtempSync(path.join(os.tmpdir(),'muse-smoke-'));const ws=fs.mkdtempSync(path.join(os.tmpdir(),'muse-ws-'));const app=await _electron.launch({executablePath:path.resolve('dist/win-unpacked/Muse for Windows.exe'),env:{...process.env,MUSE_E2E_USER_DATA:ud,MUSE_E2E_WORKSPACE:ws}});try{let win=await app.firstWindow();for(let i=0;i<20;i++){const m=app.windows().find(w=>w.url().includes('index.html'));if(m){win=m;break;}await new Promise(r=>setTimeout(r,150));}await win.waitForLoadState('domcontentloaded');console.log(await win.evaluate(()=>window.museApi.getBootstrap()));}finally{await app.close();fs.rmSync(ud,{recursive:true,force:true});fs.rmSync(ws,{recursive:true,force:true});}})()"
```

---

## 4. Những Cạm Bẫy Cần Tránh Khi Sửa Lỗi / Nâng Cấp

1. **Tuyệt đối không chạy `npm audit fix --force`:** GitHub Dependabot có thể báo cảnh báo ở nhánh *devDependencies* (bên trong chuỗi phụ thuộc phụ của `electron-builder`), nhưng **dependencies sản phẩm (`npm.cmd run audit:prod`) đang sạch tuyệt đối (`0 vulnerabilities`)**. Chạy `--force` sẽ hạ cấp `electron-builder` và làm hỏng quá trình đóng gói NSIS/Portable.
2. **Không bao giờ pha trộn tiếng Anh vào giao diện Tiếng Việt:** Khi thêm bất kỳ nút bấm, nhãn, thông báo hay công cụ mới nào:
   - Khai báo khóa mới trong `src/renderer/locales/en.ts` trước.
   - Dịch sang tiếng Việt thuần chuẩn **Unicode NFC** trong `src/renderer/locales/vi.ts` (và cập nhật `zh.ts` / `cjk.ts` nếu cần).
   - Bài test `tests/unit/localesAndBranding.test.ts` sẽ tự động kiểm tra chuẩn NFC và quét chống chuỗi tiếng Anh cứng trong `src/renderer/pages/*.tsx`.
3. **Xử lý che khuất của `WebContentsView`:** Trong Electron, `WebContentsView` là lớp cửa sổ gốc nằm đè lên DOM của React. Trong `DesktopShell.tsx`, biến `anyOverlayOpen` (`commandPaletteOpen || Boolean(activeApproval) || accountMenuOpen || quotaPopoverOpen`) tự động tạm ẩn `WebContentsView` khi có hộp thoại nổi mở ra để không bao giờ bị che khuất. Nếu thêm modal/popover mới nằm chồng lên vùng `Muse`, hãy đưa cờ mở của modal đó vào `anyOverlayOpen`.
4. **Quy trình Phát hành Phiên bản Mới (`v1.1.x` / `v1.2.0`):**
   - Đồng bộ số phiên bản ở cả **3 nơi**: `package.json`, `package-lock.json`, và `src/shared/branding/index.ts`, đồng thời cập nhật `CHANGELOG.md` và `RELEASE_NOTES.md`.
   - Luôn chạy đủ kiểm thử, đóng gói, kiểm tra mã băm `SHA256SUMS.txt` và **báo cáo xin xác nhận của Product Owner (Huy) trước khi đẩy tag `v*` hoặc xuất bản GitHub Release**.

---

## 5. Prompt Mẫu Để Khởi Động Codex (Copy & Dán Trực Tiếp Vào Codex)

```text
Hãy đọc kỹ AGENTS.md, CODEX-HANDOFF.md, ARCHITECTURE.md và TASKS.md trong thư mục hiện tại (c:\Users\lemin\Downloads\MUSE PC).
1. Kiểm tra trạng thái kho mã nguồn, chạy trọn bộ lệnh xác minh sức khỏe ứng dụng (dùng npm.cmd trên PowerShell): audit:prod, typecheck, lint, test, security:scan, build và test:e2e.
2. Báo cáo tóm tắt bằng tiếng Việt tình trạng hiện tại của ứng dụng Muse for Windows v1.1.0, các điểm có thể tối ưu hoặc lỗi tiềm ẩn nếu phát hiện, và sẵn sàng nhận yêu cầu sửa lỗi / phát triển tính năng tiếp theo của tôi.
```
