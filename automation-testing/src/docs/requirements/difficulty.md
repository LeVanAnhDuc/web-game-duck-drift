# DIFFICULTY — Ba mức độ khó chọn ở menu

Truy vết phía app: FR-20 · US-07 · NFR-ROB-01 · NFR-ROB-02 · ADR-0010 · ADR-0011 · ADR-0020.

- **REQ-DIFFICULTY-01** Menu có dãy ba mức Dễ · Thường · Khó ngay trên nút Chơi; máy chưa chọn bao giờ thì Thường được chọn sẵn. Mức đang chọn được nói bằng trạng thái nút (`aria-pressed`), không chỉ bằng màu.
- **REQ-DIFFICULTY-02** Bấm một mức thì chỉ mức đó được chọn, và dòng điểm cao nhất đổi sang bảng điểm của mức đó.
- **REQ-DIFFICULTY-03** Lựa chọn mức được nhớ cho lần mở trang sau.
- **REQ-DIFFICULTY-04** Bấm Chơi vào ván ngay với bộ núm của mức đang chọn — số mạng lúc vào ván: Dễ 5, Thường 3, Khó 2.
- **REQ-DIFFICULTY-05** Giá trị mức lưu trong máy không hợp lệ (bị sửa tay, hoặc không phải một trong ba mức sẵn) thì menu về Thường, không crash.
- **REQ-DIFFICULTY-06** `localStorage` bị chặn: vẫn chọn và chơi được mức bất kỳ, chỉ không nhớ lựa chọn sau khi tải lại trang.
