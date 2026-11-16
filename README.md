# Đập chuột

Mini game phản xạ chạy trên trình duyệt: lưới 3×3, mỗi lượt 30 giây, đập trúng chuột được +1 điểm, kỷ lục lưu trong trình duyệt.

**Chơi online:** https://thinh41120.github.io/vibe-test/ (GitHub Pages, tự cập nhật khi push lên `main`)

| Thư mục | Nội dung |
|---|---|
| `app/` | Code game: `index.html`, `style.css`, `game.js` |
| `design/` | Design system: `tokens.css` và trang xem trước `design-system.html` |
| `docs/` | Tài liệu đặc tả (mở `docs/index.html`) |
| `server/` | Server tĩnh Node.js dùng khi chạy bằng Docker |

## Cách chạy bằng Docker

Yêu cầu: Docker Engine và Docker Compose v2 (lệnh `docker compose`).

1. Build và khởi động (chạy nền):

   ```bash
   docker compose up -d --build
   ```

2. Mở trình duyệt tại **http://localhost:3000**.

3. Xem log:

   ```bash
   docker compose logs -f app
   ```

4. Dừng và xoá container:

   ```bash
   docker compose down
   ```

Ghi chú:

- Compose có một dịch vụ `app`: server Node.js nhỏ (không có thư viện ngoài) phục vụ `app/` ở `/` và `design/` ở `/design/` (game nạp `../design/tokens.css`).
- Kiểm tra sức khoẻ: `http://localhost:3000/healthz` trả về `ok`; `docker compose ps` hiện trạng thái `healthy`.
- Sửa code trong `app/` hoặc `design/` xong thì chạy lại `docker compose up -d --build` để cập nhật image.
- Cổng 3000 đã bị chiếm: đổi vế trái trong `compose.yaml`, ví dụ `"8080:3000"`, rồi mở `http://localhost:8080`.
- Font chữ (DM Sans, Fraunces) tải từ Google Fonts nên cần mạng; khi offline game dùng font hệ thống.

## Chạy không cần Docker

Cần Node.js 20 trở lên:

```bash
node server/server.js
```

Rồi mở http://localhost:3000.
