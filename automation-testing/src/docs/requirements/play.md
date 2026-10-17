# PLAY — Vào ván, HUD, vòng lặp và bàn phím trong lúc chơi

Truy vết phía app: FR-01 · FR-05 · FR-10 · FR-11 · FR-14 · FR-19 · US-01 · ADR-0015 · ADR-0018 · NFR-A11Y-06.

- **REQ-PLAY-01** Bấm Chơi là vào thẳng ván, không có màn chờ: màn hình chính biến mất, HUD hiện.
- **REQ-PLAY-02** HUD lúc vào ván cho thấy điểm 0, "Wave 1", số mạng của mức, và nút "Tạm dừng".
- **REQ-PLAY-03** Vòng lặp chạy thật ngay khi vào ván: wave 1 được sinh và vùng thông báo cho trình đọc màn hình nói "Wave 1".
- **REQ-PLAY-04** Tàu có 2 giây bất tử đầu ván: người chơi đứng yên trong 2 giây đầu không mất mạng nào.
- **REQ-PLAY-05** Va vào thiên thạch thì mất một mạng: số mạng trên HUD giảm 1 và vùng thông báo nói "Mất một mạng. Còn N mạng."; viên đá va vào tàu cũng vỡ và được tính điểm.
- **REQ-PLAY-06** Trong lúc chơi, phím điều khiển (mũi tên, A/D/W, Space, Shift) thuộc về game: trình duyệt không cuộn trang hay làm hành vi mặc định của chúng.
- **REQ-PLAY-07** Trên thiết bị chuột/bàn phím, lúc vào ván có một dòng gợi ý điều khiển nêu phím xoay, đẩy và bắn ("Space"), lấy từ cùng bảng phím với màn Cách chơi.
- **REQ-PLAY-08** Dòng gợi ý không biến mất chỉ vì điểm lên: nó còn đó suốt wave 1.
