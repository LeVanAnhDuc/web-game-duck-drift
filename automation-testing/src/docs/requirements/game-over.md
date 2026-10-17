# GAMEOVER — Hết lượt, ghi tên vào bảng điểm

Truy vết phía app: FR-11 · FR-12 · FR-19 · FR-22 · US-01 (bước 6) · US-02 · US-07 (bước 4) · NFR-A11Y-06 · NFR-ROB-02 · ADR-0016 · ADR-0017 · ADR-0019.

- **REQ-GAMEOVER-01** Hết mạng thì màn "HẾT LƯỢT" hiện điểm, wave đạt được và thứ hạng; vùng thông báo cho trình đọc màn hình nói "Hết lượt. Tổng điểm N." với đúng số điểm trên panel.
- **REQ-GAMEOVER-02** Thứ hạng là hạng của điểm trong bảng **của mức vừa chơi**, chốt trước khi ghi — kể cả ở ván đầu tiên sau khi tải trang.
- **REQ-GAMEOVER-03** Điểm lọt top 10 thì hỏi tên: nhãn "Tên của bạn" và dòng hướng dẫn nhìn thấy được, ba ký tự bắt đầu bằng `AAA`, focus nằm sẵn ở khối ký tự.
- **REQ-GAMEOVER-04** Đổi tên được bằng bàn phím (gõ chữ thì điền ô đang chọn rồi sang ô sau; mũi tên lên/xuống đổi chữ, trái/phải đổi ô) và bằng nút ▲/▼ của từng ô; chữ chạy vòng A↔Z.
- **REQ-GAMEOVER-05** "Lưu điểm" ghi điểm (tên, điểm, wave, thời điểm) vào bảng của mức vừa chơi rồi mở Bảng điểm ở đúng tab đó, dòng vừa thêm nằm đúng hạng và được làm nổi; điểm còn đó sau khi tải lại trang.
- **REQ-GAMEOVER-06** Không đổi tên mà lưu thì tên là `AAA`.
- **REQ-GAMEOVER-07** Điểm không lọt top 10 thì không hỏi tên: hiện "Không lọt bảng", không có ô tên, không có cảnh báo, focus ở "Chơi lại".
- **REQ-GAMEOVER-08** Câu "Điểm này lọt bảng nhưng chưa lưu. Về menu là mất." chỉ hiện khi có hạng và chưa lưu.
- **REQ-GAMEOVER-09** "Chơi lại" bắt đầu ngay một ván mới cùng mức (điểm 0, đủ mạng); "Về menu" về màn hình chính.
- **REQ-GAMEOVER-10** `localStorage` bị chặn: vẫn chơi tới hết lượt không lỗi, và vì điểm không lưu được nên không hỏi tên — hỏi rồi vứt đi tệ hơn không hỏi.
