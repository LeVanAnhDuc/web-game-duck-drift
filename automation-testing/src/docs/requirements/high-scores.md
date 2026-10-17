# HIGHSCORES — Bảng điểm top 10 theo mức

Truy vết phía app: FR-12 · FR-22 · US-02 · US-06 · US-07 · NFR-ROB-01 · NFR-I18N-02 · NFR-I18N-03 · ADR-0006 · ADR-0011 · ADR-0020.

- **REQ-HIGHSCORES-01** Màn Bảng điểm có ba tab Dễ · Thường · Khó và mở sẵn tab của mức đang chọn ở menu.
- **REQ-HIGHSCORES-02** Mỗi dòng có hạng, tên, điểm (định dạng số vi-VN), wave và ngày ghi (`dd/mm/yyyy`); điểm cao đứng trước; một bảng hiện tối đa 10 dòng.
- **REQ-HIGHSCORES-03** Bảng của một mức chưa có điểm nào thì nói rõ "Chưa có điểm nào ở mức <mức>. Chơi một ván đi." và nút xoá biến mất hẳn.
- **REQ-HIGHSCORES-04** Nút xoá ghi rõ nó xoá bảng nào ("Xoá bảng <mức>") và chỉ xoá bảng của tab đang mở; hai bảng kia còn nguyên, kể cả sau khi tải lại trang.
- **REQ-HIGHSCORES-05** Dữ liệu bảng điểm bị hỏng hoặc bị sửa tay thì bị bỏ qua (dòng sai bị loại, JSON hỏng thành bảng trống), không crash.
- **REQ-HIGHSCORES-06** Màn nói rõ bảng chỉ lưu trên máy ("Bảng điểm này chỉ lưu trên máy bạn."); "Quay lại" về màn hình chính.
- **REQ-HIGHSCORES-07** Đổi tab chỉ đổi bảng đang xem, không đổi mức sẽ chơi ở menu.
