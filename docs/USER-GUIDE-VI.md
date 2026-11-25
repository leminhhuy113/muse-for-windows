# Hướng dẫn Sử dụng — Muse for Windows (`v1.0.0`)

**Phát triển bởi:** 1MS Studio · **Tiêu chuẩn thiết kế:** 1RS v1.2  
**Hỗ trợ đa ngôn ngữ:** Tiếng Việt (`vi`) · English (`en`) · 简体中文 (`zh`) · 日本語 (`ja`) · 한국어 (`ko`)

---

## 1. Giới thiệu Chung

**Muse for Windows** là ứng dụng máy tính mã nguồn mở độc lập mang trải nghiệm dịch vụ **Muse** (`https://muse.ai`) lên **Windows 10** và **Windows 11**, tích hợp thanh tiêu đề nguyên bản, Snap Layouts, Khay hệ thống (System Tray), Phím tắt toàn cục, Trợ lý Nhanh (Quick Assistant), Thư mục Làm việc Cô lập (10 GB) và Trung tâm Quyền hạn mặc định từ chối (Default-Deny).

---

## 2. Cài đặt & Khởi chạy

1. **Bản Cài đặt (`Muse-for-Windows-1MS-Studio-v1.0.0-Setup-x64.exe`):**
   - Cài đặt theo tài khoản người dùng hiện tại (không yêu cầu quyền Quản trị viên / Administrator).
   - Cho phép chọn thư mục cài đặt, tạo lối tắt Start Menu và Desktop, gỡ cài đặt sạch sẽ.
2. **Bản Di động (`Muse-for-Windows-1MS-Studio-v1.0.0-Portable-x64.exe`):**
   - Chạy trực tiếp ngay lập tức mà không cần cài đặt vào hệ thống.

> **Lưu ý Windows SmartScreen:** Vì đây là bản dựng mã nguồn mở độc lập chưa gắn chứng chỉ ký số thương mại (EV Code Signing), lần đầu mở trên Windows 11 có thể hiện bảng SmartScreen. Hãy đối chiếu mã băm `SHA256SUMS.txt` trên trang GitHub Releases, sau đó nhấn **More info -> Run anyway**.

---

## 3. Phím tắt Bàn phím Mặc định

| Phím tắt | Phạm vi | Chức năng |
|---|---|---|
| `Ctrl + Alt + M` | Toàn hệ thống Windows | Hiện hoặc ẩn cửa sổ chính Muse for Windows |
| `Ctrl + Alt + Space` | Toàn hệ thống Windows | Mở / đóng cửa sổ Trợ lý Nhanh (Quick Assistant) |
| `Ctrl + Alt + Shift + M` | Toàn hệ thống Windows | Mở ngay Trình quản lý Thư mục Cục bộ |
| `Ctrl + K` | Trong ứng dụng | Mở Bảng Lệnh Nhanh (Command Palette) |
| `Ctrl + Shift + S` | Trong ứng dụng | Mở Cài đặt Hệ thống |

Bạn có thể tùy chỉnh hoặc đặt lại toàn bộ phím tắt tại **Cài đặt -> Phím tắt Bàn phím**.

---

## 4. Ba Chế độ Vận hành

1. **Chế độ A — Ứng dụng Máy tính Muse Chính thức (Mặc định):**
   - Đăng nhập trực tiếp vào tài khoản `muse.ai` trong vùng nhớ cô lập `persist:muse-official`.
   - Đồng bộ toàn bộ Hội thoại, **Feed**, **Ideas**, **Goals**, **Library**, **Connectors** và **Cloud Computer (Secure VM)**.
   - Nếu nhà cung cấp OAuth yêu cầu trình duyệt ngoài, nhấn **Đăng nhập qua Trình duyệt Hệ thống** trong mục **Tài khoản & Phiên**.
2. **Chế độ B — Máy chủ MCP Cục bộ (`127.0.0.1`):**
   - Cung cấp máy chủ MCP JSON-RPC chuẩn tại `http://127.0.0.1:43821/mcp` kèm xác thực Bearer Token 256-bit cho các tác tử MCP chạy trên máy (như `Muse Code` CLI).
   - Dịch vụ `muse.ai` đám mây chạy trong máy ảo của Meta nên không tự gọi thẳng vào mạng nội bộ `127.0.0.1` nếu chưa có cổng kết nối chính thức.
3. **Chế độ C — Tác tử Cục bộ Độc lập (Tùy chọn, tắt mặc định):**
   - Cho phép kết nối **Ollama** cục bộ (`http://127.0.0.1:11434`) hoặc khóa API riêng (được mã hóa bằng **Windows DPAPI**) để thực thi 34 công cụ cục bộ thông qua Trung tâm Quyền hạn.

---

## 5. Quản lý Quyền hạn & Dừng Khẩn cấp

- Mọi thao tác nhạy cảm đều hiển thị hộp thoại phê duyệt với nút **Từ chối** được chọn mặc định và tự hết hạn sau 45 giây.
- Bất kỳ lúc nào, bạn có thể nhấn nút **Dừng Khẩn cấp Tất cả (Emergency Stop)** trên thanh Dynamic Island, trong Trung tâm Quyền hạn hoặc từ biểu tượng Khay hệ thống để hủy tức thì mọi tác vụ tự động hóa.

---

## Tuyên bố Dự án Độc lập

> Muse for Windows là dự án mã nguồn mở độc lập được phát triển bởi 1MS Studio. Ứng dụng không liên kết, không được chứng thực và không được tài trợ bởi nhà cung cấp dịch vụ Muse gốc. Mọi nhãn hiệu và tên dịch vụ bên thứ ba thuộc quyền sở hữu của chủ sở hữu tương ứng.
