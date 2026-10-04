# Danh mục chức năng

> **Trả lời:** Hệ thống có những chức năng nào, mỗi cái đang ở trạng thái gì?
> **Trạng thái:** 🟢 đủ
> **Cập nhật:** 2026-09-10 · commit —
> **Cập nhật khi:** brainstorm ra chức năng mới (cấp FR mới) · một FR chuyển trạng thái

| ID    | Chức năng                                                                       | Thuộc luồng           | Trạng thái |
| ----- | ------------------------------------------------------------------------------- | --------------------- | ---------- |
| FR-01 | Vòng lặp fixed timestep 60Hz, thế giới cố định 1600×1200, wrap qua biên         | US-01                 | xong       |
| FR-02 | Điều khiển tàu: xoay, đẩy có quán tính, ma sát, trần tốc độ                     | US-01                 | xong       |
| FR-03 | Bắn đạn: tối đa 4 viên, tuổi thọ giới hạn                                       | US-01                 | xong       |
| FR-04 | Thiên thạch ba cấp, vỡ thành mảnh nhỏ hơn, tính điểm 20/50/100                  | US-01                 | xong       |
| FR-05 | Va chạm, mất mạng, hồi sinh có bất tử tạm thời, +1 mạng mỗi 10.000 điểm         | US-01                 | xong       |
| FR-06 | Wave vô hạn: `2 + n` thiên thạch to (trần 11), tốc độ nền tăng dần              | US-01                 | xong       |
| FR-07 | UFO hai loại, xuất hiện từ wave 3, 200đ và 1000đ                                | US-01                 | xong       |
| FR-08 | Hyperspace: dịch chuyển ngẫu nhiên, cooldown 5 giây                             | US-01                 | xong       |
| FR-09 | Hệ power-up: 5 loại, một khe vũ khí, một khe khiên                              | US-05                 | xong       |
| FR-10 | HUD: mạng, điểm, wave, power-up đang hiệu lực kèm thanh thời gian               | US-01 · US-05         | xong       |
| FR-11 | Máy trạng thái màn hình: menu · playing · paused · gameover · highscores · help | US-01 · US-04 · US-06 | xong       |
| FR-12 | Bảng điểm top 10 lưu localStorage, nhập tên ba ký tự, xoá được                  | US-02 · US-06         | xong       |
| FR-13 | Điều khiển cảm ứng: hai cụm nút, giữ được, vùng bấm ≥ 44px                      | US-03                 | xong       |
| FR-14 | Điều khiển bàn phím: mũi tên/WASD, Space, Shift, Esc, P                         | US-01                 | xong       |
| FR-15 | Tự tạm dừng khi tab ẩn hoặc mất focus                                           | US-04                 | xong       |
| FR-16 | Tôn trọng `prefers-reduced-motion`: tắt particle, rung màn, vệt đẩy             | US-01                 | xong       |
| FR-17 | Canvas scale-to-fit, bố cục đổi theo 375 / 768 / 1440                           | US-03                 | xong       |
| FR-18 | Hiệu ứng vỡ: particle, glow, rung màn khi mất mạng                              | US-01                 | xong       |
| FR-19 | Trạng thái game công bố qua `aria-live` cho trình đọc màn hình                  | US-01                 | xong       |
| FR-20 | Ba mức độ khó sẵn (Dễ · Thường · Khó) đặt bốn núm cân bằng, chọn ngay ở menu    | US-07                 | xong       |
| FR-21 | Chế độ Tuỳ chỉnh: màn riêng, bốn thanh trượt, ván không ghi bảng điểm           | US-08                 | xong       |
| FR-22 | Bảng điểm tách theo mức: ba khoá riêng, ba tab, xoá theo tab đang mở            | US-06 · US-07         | xong       |
| FR-23 | Đăng nhập Ducker ID tuỳ chọn (chỉ định danh): nút ở menu, avatar + tên, menu tài khoản; sau cờ tính năng, chưa bật ở bản deploy | US-09                 | xong       |
