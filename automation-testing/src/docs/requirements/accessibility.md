# ACCESSIBILITY — Bàn phím ngoài canvas, focus, trình đọc màn hình, màu, chuyển động

Truy vết phía app: FR-16 · FR-19 · NFR-A11Y-02 · NFR-A11Y-04 · NFR-A11Y-05 · NFR-A11Y-06 · NFR-I18N-01 · ADR-0015 · ADR-0020.

- **REQ-ACCESSIBILITY-01** Mọi nút ngoài canvas tới được bằng Tab theo thứ tự đọc của màn hình.
- **REQ-ACCESSIBILITY-02** Ngoài lúc chơi, game không chiếm phím: Space và Enter bấm được nút đang có focus.
- **REQ-ACCESSIBILITY-03** Focus bằng bàn phím luôn nhìn thấy được (viền rõ quanh phần tử đang focus).
- **REQ-ACCESSIBILITY-04** Canvas có nhãn thay thế cho trình đọc màn hình: vai trò hình ảnh, tên "Khu vực chơi. Điều khiển bằng bàn phím hoặc bằng các nút bên dưới."
- **REQ-ACCESSIBILITY-05** Diễn biến của ván được công bố qua đúng một vùng `aria-live="polite"` có mặt sẵn ở mọi màn.
- **REQ-ACCESSIBILITY-06** Trạng thái chọn không mã hoá chỉ bằng màu: mức đang chọn còn có chữ đậm, chấm chỉ thị và `aria-pressed`.
- **REQ-ACCESSIBILITY-07** `prefers-reduced-motion: reduce` tắt chuyển động của DOM (transition, animation), còn gameplay không đổi: cùng một ván cho cùng điểm và mạng.
- **REQ-ACCESSIBILITY-08** Trang khai báo ngôn ngữ tiếng Việt (`lang="vi"`) để trình đọc màn hình đọc đúng giọng.
