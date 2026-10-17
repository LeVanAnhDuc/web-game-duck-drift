# PRIVACY — Mạng, lưu trữ trên máy, chạy không cần mạng, console sạch

Truy vết phía app: NFR-SEC-03 · NFR-SEC-01 · ADR-0001 · ADR-0006 · ADR-0021 · `docs/01-product/overview.md` (không server, không analytics).

- **REQ-PRIVACY-01** Bản deploy (cờ đăng nhập tắt): suốt một ván từ lúc tải trang tới khi lưu điểm, không có request nào ra ngoài origin của site — không analytics, không font hay script từ CDN.
- **REQ-PRIVACY-02** Tải xong rồi thì chơi không cần mạng: mất mạng giữa chừng vẫn chơi tới hết lượt, lưu điểm và xem Bảng điểm được.
- **REQ-PRIVACY-03** Game không đặt cookie nào và không dùng sessionStorage (khi cờ đăng nhập tắt).
- **REQ-PRIVACY-04** localStorage chỉ chứa khoá của game (`asteroids.*`): điểm và lựa chọn của người chơi, không gì khác.
- **REQ-PRIVACY-05** Console không có lỗi nào suốt một vòng chơi đầy đủ (tải, chọn mức, Tuỳ chỉnh, chơi, hết lượt, lưu, Bảng điểm).
