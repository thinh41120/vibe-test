# Yêu cầu: Mini game Đập Chuột (trình duyệt)

## 1. Tổng quan

- **Thể loại:** game phản xạ, một người chơi.
- **Nền tảng:** chạy trực tiếp trên trình duyệt (desktop và điện thoại), không cần cài đặt, không cần server.
- **Mục tiêu người chơi:** đập trúng càng nhiều chuột càng tốt trong 30 giây.

## 2. Luật chơi

1. Bàn chơi là lưới **3×3 = 9 ô (hang)**.
2. Khi bắt đầu lượt, đồng hồ đếm ngược từ **30 giây**.
3. Chuột lần lượt **ngoi lên ngẫu nhiên** ở một ô, ở lại trong một khoảng thời gian ngắn rồi tự lặn xuống.
   - Tại một thời điểm chỉ có **tối đa 1 con chuột** xuất hiện.
   - Thời gian chuột ở trên mặt đất: khoảng **0,6–1,2 giây** (ngẫu nhiên trong khoảng này).
   - Khoảng nghỉ giữa hai lần xuất hiện: khoảng **0,2–0,5 giây**.
   - Chuột mới không xuất hiện lại đúng ô vừa xuất hiện ở lần trước.
4. Người chơi **bấm/chạm** vào ô có chuột để đập.
   - Đập trúng: chuột lập tức lặn xuống (kèm hiệu ứng "bị đập"), con tiếp theo xuất hiện sau khoảng nghỉ.
   - Mỗi con chuột chỉ được tính điểm **một lần** (bấm nhiều lần vào cùng con chỉ tính 1).
   - Bấm vào ô trống: không có tác dụng, không bị trừ điểm.
5. Khi đồng hồ về **0**: lượt kết thúc ngay, chuột đang hiện (nếu có) biến mất, mọi cú bấm sau đó không được tính.
6. Người chơi có thể bấm **"Chơi lại"** để bắt đầu lượt mới; điểm và thời gian được đặt lại.

## 3. Cách tính điểm

| Sự kiện | Điểm |
|---|---|
| Đập trúng chuột | **+1** |
| Bấm trượt (ô trống) | 0 |
| Để chuột tự lặn mất | 0 |

- Điểm bắt đầu mỗi lượt là **0**, không bao giờ âm.
- Điểm hiển thị cập nhật **ngay** khi đập trúng.
- **Điểm cao nhất (kỷ lục)** được lưu trên trình duyệt (localStorage) và vẫn còn sau khi tải lại trang. Nếu trình duyệt không cho lưu, game vẫn chạy bình thường, chỉ không giữ kỷ lục.

## 4. Màn hình

### 4.1. Màn hình bắt đầu
- Tên game: **Đập Chuột**.
- Một dòng giới thiệu luật ngắn: "Đập trúng chuột trong 30 giây, mỗi con được 1 điểm."
- Hiển thị **kỷ lục** hiện tại (hoặc "Chưa có kỷ lục").
- Nút **"Bắt đầu"**.

### 4.2. Màn hình chơi
- **Thanh trên cùng:**
  - Điểm hiện tại (ví dụ: `Điểm: 12`).
  - Thời gian còn lại, đếm theo giây (ví dụ: `Thời gian: 18s`). Khi còn ≤ 5 giây, số đổi màu đỏ để cảnh báo.
  - Kỷ lục (ví dụ: `Kỷ lục: 25`).
- **Lưới 3×3:** 9 hang có kích thước bằng nhau, căn giữa màn hình. Chuột ngoi lên/lặn xuống có hiệu ứng chuyển động ngắn.
- **Phản hồi khi đập trúng:** chuột đổi hình (bị đập) hoặc có hiệu ứng "+1" nổi lên; con trỏ có thể là hình cái búa trên desktop.

### 4.3. Màn hình kết thúc
- Thông báo **"Hết giờ!"**.
- Điểm đạt được trong lượt.
- Nếu phá kỷ lục: hiển thị **"Kỷ lục mới!"**.
- Nút **"Chơi lại"** (bắt đầu ngay lượt mới).

### 4.4. Yêu cầu giao diện chung
- Hiển thị tốt trên màn hình từ **360px** (điện thoại) đến desktop, không bị cuộn ngang.
- Trên điện thoại, mỗi ô đủ lớn để chạm chính xác (tối thiểu khoảng 80×80px).
- Chạm trên điện thoại phản hồi ngay, không bị trễ, không phóng to trang khi chạm liên tục.

## 5. Tiêu chí hoàn thành

Game được coi là hoàn thành khi **tất cả** các mục sau đều đạt:

**Chức năng**
- [ ] Mở file trên trình duyệt (Chrome, Safari, Firefox bản mới) là chơi được, không lỗi trong console.
- [ ] Màn hình bắt đầu hiển thị đúng và nút "Bắt đầu" khởi động lượt chơi.
- [ ] Lưới hiển thị đúng 9 ô dạng 3×3.
- [ ] Chuột xuất hiện ngẫu nhiên, tối đa 1 con cùng lúc, không lặp lại đúng ô liền trước.
- [ ] Đập trúng chuột được +1 điểm, mỗi con chỉ tính 1 lần dù bấm nhiều lần.
- [ ] Bấm ô trống không thay đổi điểm.
- [ ] Đồng hồ đếm ngược đúng 30 giây (sai lệch không quá ±0,5 giây) và lượt dừng hẳn khi về 0.
- [ ] Sau khi hết giờ, bấm vào lưới không còn được tính điểm.
- [ ] Màn hình kết thúc hiển thị đúng điểm của lượt.
- [ ] "Chơi lại" đặt điểm về 0, thời gian về 30 giây và bắt đầu lượt mới; bấm nhiều lần không làm chạy song song hai đồng hồ.
- [ ] Kỷ lục được cập nhật khi điểm lượt cao hơn, và vẫn còn sau khi tải lại trang.

**Giao diện & trải nghiệm**
- [ ] Hiển thị và chơi được trên điện thoại (chạm) lẫn desktop (chuột).
- [ ] Không có cuộn ngang ở chiều rộng 360px.
- [ ] Có phản hồi hình ảnh rõ ràng khi đập trúng.
- [ ] Thời gian còn ≤ 5 giây được làm nổi bật.

**Kỹ thuật**
- [ ] Chỉ dùng HTML, CSS, JavaScript thuần (không bắt buộc framework); không cần server hay bước build.
- [ ] Không gọi tài nguyên từ bên ngoài bắt buộc để chơi được (chơi được khi offline).

## 6. Ngoài phạm vi (phiên bản này)

- Nhiều cấp độ khó, chuột tăng tốc theo thời gian.
- Nhiều chuột cùng lúc, "bom"/vật cản trừ điểm.
- Âm thanh, nhạc nền.
- Bảng xếp hạng online, tài khoản người chơi.
