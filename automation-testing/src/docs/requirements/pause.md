# PAUSE — Tạm dừng, tự tạm dừng, và rời ván giữa chừng

Truy vết phía app: FR-11 · FR-15 · US-04 · NFR-ROB-03 · ADR-0015 · ADR-0019.

- **REQ-PAUSE-01** Trong lúc chơi, Esc, P, hoặc nút "Tạm dừng" trên HUD mở overlay "TẠM DỪNG"; focus vào "Tiếp tục".
- **REQ-PAUSE-02** "Tiếp tục", hoặc Esc / P lần nữa, đóng overlay và chơi tiếp từ đúng trạng thái đó: điểm, mạng, wave không đổi.
- **REQ-PAUSE-03** Trong lúc tạm dừng, ván đứng yên: thời gian trôi không làm đổi điểm, mạng hay wave.
- **REQ-PAUSE-04** Tab bị ẩn (chuyển tab) hoặc cửa sổ mất focus giữa ván thì game tự tạm dừng.
- **REQ-PAUSE-05** Không mô phỏng bù: dù đồng hồ nhảy rất xa giữa hai frame (máy ngủ dậy, tab nền nhiều phút), ván chỉ tiến tối đa 0,25 giây, không mất mạng vì khoảng thời gian không ai chơi.
- **REQ-PAUSE-06** Ngay trên nút "Về menu" của overlay có câu nói trước hậu quả: chưa có điểm thì "Về menu là bỏ ván này.", có điểm thì thêm "<điểm> điểm sẽ không được ghi."
- **REQ-PAUSE-07** "Về menu" bỏ ván không hỏi lại: về màn hình chính, và điểm của ván bỏ dở không vào bảng điểm.
