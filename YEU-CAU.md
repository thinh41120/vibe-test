# Yêu cầu: Mini game Đập chuột (Whack-a-Mole)

Game chạy trên trình duyệt, lưới 3×3 ô. Người chơi bấm trúng chuột để ghi điểm, mỗi lượt kéo dài 30 giây.

> Các giá trị đánh dấu **(mặc định)** là đề xuất hợp lý do yêu cầu gốc chưa nêu; có thể điều chỉnh trước khi code.

## 1. Luật chơi

1. Lưới gồm 9 ô (3 hàng × 3 cột), ban đầu tất cả ô đều trống.
2. Khi lượt chơi bắt đầu, chuột lần lượt xuất hiện ở một ô ngẫu nhiên.
3. Tại mỗi thời điểm chỉ có **tối đa 1 chuột** trên lưới.
4. Mỗi chuột hiện trong khoảng **800 ms** **(mặc định)** rồi tự biến mất nếu không bị bấm.
5. Chuột mới xuất hiện sau chuột trước khoảng **300 ms** **(mặc định)**; ô của chuột mới được chọn ngẫu nhiên và có thể trùng ô trước.
6. Người chơi bấm (click chuột / chạm màn hình) vào ô có chuột để đập.
7. Bấm vào ô trống không bị trừ điểm.
8. Mỗi chuột chỉ ghi điểm một lần; sau khi bị đập, chuột biến mất ngay.
9. Mỗi lượt kéo dài đúng **30 giây**. Hết giờ, game dừng, mọi chuột trên lưới biến mất và không nhận thêm thao tác bấm.
10. Sau khi kết thúc, người chơi có thể chơi lại; điểm và đồng hồ được đặt lại.

## 2. Cách tính điểm

| Tình huống | Điểm |
|---|---|
| Bấm trúng ô đang có chuột | **+1** |
| Bấm vào ô trống | 0 |
| Chuột tự biến mất (không bị bấm) | 0 |

- Điểm khởi đầu mỗi lượt là 0; điểm không bao giờ âm.
- Một chuột chỉ cộng điểm một lần, dù bấm nhiều lần liên tiếp vào ô đó.
- **Điểm cao nhất** được lưu trong `localStorage` của trình duyệt **(mặc định)** và hiển thị cạnh điểm hiện tại. Nếu lượt vừa xong vượt kỷ lục thì cập nhật và báo "Kỷ lục mới".

## 3. Màn hình

### 3.1 Màn hình bắt đầu
- Tên game.
- Tóm tắt luật chơi ngắn gọn (1–2 dòng).
- Nút **Bắt đầu**.
- Hiển thị điểm cao nhất nếu đã có.

### 3.2 Màn hình chơi
- **Thanh trạng thái** phía trên:
  - Thời gian còn lại, đếm ngược từ 30 đến 0 (giây).
  - Điểm hiện tại.
- **Lưới 3×3** ở giữa: 9 ô kích thước bằng nhau, hình vuông, khoảng cách đều.
  - Ô trống: hình cái hố.
  - Ô có chuột: hiển thị hình chuột (emoji 🐹 hoặc hình ảnh đơn giản).
  - Khi trúng: hiệu ứng ngắn (ví dụ nháy sáng hoặc hiện "+1") rồi chuột biến mất.
- Con trỏ chuột có dạng bấm được (`pointer`) khi di vào lưới.

### 3.3 Màn hình kết thúc
- Thông báo "Hết giờ!".
- Điểm của lượt vừa chơi.
- Điểm cao nhất; nếu phá kỷ lục thì có dòng "Kỷ lục mới".
- Nút **Chơi lại**.

### 3.4 Yêu cầu giao diện chung
- Chạy trên trình duyệt hiện đại (Chrome, Firefox, Edge, Safari bản mới), không cần cài đặt hay backend.
- Hiển thị tốt trên màn hình máy tính và điện thoại (responsive); các ô đủ lớn để chạm (tối thiểu khoảng 64 px).
- Chữ rõ ràng, tương phản tốt giữa chuột, hố và nền.
- Không để người dùng bôi đen văn bản hay phóng to nhầm khi bấm nhanh liên tục (điện thoại).

## 4. Tiêu chí hoàn thành

Game được xem là hoàn thành khi **tất cả** các mục dưới đây đạt:

**Chức năng**
- [ ] Hiển thị lưới đúng 3×3 = 9 ô.
- [ ] Bấm **Bắt đầu** thì đồng hồ đếm ngược từ 30 giây và chuột bắt đầu xuất hiện.
- [ ] Tại mọi thời điểm có không quá 1 chuột trên lưới.
- [ ] Vị trí chuột ngẫu nhiên, trải đều trên cả 9 ô sau nhiều lượt chơi.
- [ ] Bấm trúng chuột thì điểm tăng đúng 1 và chuột biến mất ngay.
- [ ] Bấm nhiều lần vào cùng một chuột chỉ cộng 1 điểm.
- [ ] Bấm ô trống hoặc chuột đã biến mất không làm đổi điểm.
- [ ] Đồng hồ về 0 thì game dừng: không còn chuột, bấm vào lưới không đổi điểm.
- [ ] Màn hình kết thúc hiển thị đúng điểm của lượt chơi.
- [ ] **Chơi lại** đặt lại điểm về 0, thời gian về 30 giây và bắt đầu lượt mới sạch.
- [ ] Điểm cao nhất được lưu và vẫn còn sau khi tải lại trang.

**Chất lượng**
- [ ] Phản hồi khi bấm gần như tức thì (không trễ cảm nhận được).
- [ ] Đồng hồ chạy đúng thực tế (30 giây ± 0,5 giây), không bị lệch khi chuyển tab rồi quay lại.
- [ ] Không có lỗi trong console của trình duyệt khi chơi nhiều lượt liên tiếp.
- [ ] Bấm **Chơi lại** nhiều lần liên tục không gây chạy trùng nhiều bộ đếm giờ hay nhiều chuột cùng lúc.
- [ ] Dùng được bằng chuột trên máy tính và bằng cảm ứng trên điện thoại.

**Phạm vi (ngoài yêu cầu lần này)**
- Không có nhiều mức độ khó, chuột đặc biệt, trừ điểm, âm thanh, bảng xếp hạng online hay đăng nhập. Có thể bổ sung ở phiên bản sau.
