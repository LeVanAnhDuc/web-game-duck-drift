# DUCKERID — Đăng nhập Ducker ID tuỳ chọn (sau cờ tính năng)

Truy vết phía app: FR-23 · US-09 · NFR-SEC-03 · NFR-A11Y-03 · ADR-0021 · `docs/specs/ducker-id-sign-in/design.md`.

- **REQ-DUCKERID-01** Cờ tắt (bản deploy): không nút đăng nhập, không menu tài khoản, không đọc URL (`?code=` để nguyên), không chạm `sessionStorage`, không request ra ngoài site.
- **REQ-DUCKERID-02** Cờ tắt: cột menu y như trước khi có tính năng đăng nhập — căn giữa theo chiều dọc, không phải một vùng cuộn.
- **REQ-DUCKERID-03** Cờ bật: bấm "Đăng nhập" đi qua Ducker ID rồi quay về menu, URL sạch (không `code` / `state`), khoá `ducker.pkce` đã xoá, nút tài khoản (avatar) hiện; không lỗi hydration.
- **REQ-DUCKERID-04** Menu tài khoản hiện tên, email, "Mở hồ sơ Ducker ID" (trang hồ sơ trên issuer, mở tab mới) và "Đăng xuất"; mở ra thì focus vào mục đầu, ↓/↑ đi vòng các mục, Esc đóng và trả focus về nút tài khoản.
- **REQ-DUCKERID-05** Đăng xuất đưa nút "Đăng nhập" trở lại đúng chỗ và đặt focus vào nó.
- **REQ-DUCKERID-06** Hồ sơ chỉ nằm trong bộ nhớ: không ghi xuống `localStorage` / `sessionStorage`, và tải lại trang là chưa đăng nhập.
- **REQ-DUCKERID-07** Huỷ / từ chối ở Ducker ID, hoặc `state` bị sửa: về chưa đăng nhập, im lặng, URL sạch; `state` sai thì không bao giờ gọi token endpoint.
- **REQ-DUCKERID-08** Ducker ID không trả lời: sau tối đa 15 giây về lại chưa đăng nhập.
- **REQ-DUCKERID-09** Bấm "Đăng nhập" hai lần liên tiếp chỉ chuyển trang một lần.
- **REQ-DUCKERID-10** `sessionStorage` bị chặn: bấm "Đăng nhập" không đưa đi đâu cả (không kẹt ở callback), nút vẫn dùng được.
- **REQ-DUCKERID-11** Nút "Đăng nhập" nằm dưới dòng "Điểm chỉ lưu trên máy này", vùng bấm ≥ 44px, không đè nút hay chữ bên cạnh.
- **REQ-DUCKERID-12** Menu tài khoản mở ra không đẩy bố cục (nút và màn hình không xê dịch) và nằm trọn trong khung nhìn, ở 320, 375 và 1440px.
- **REQ-DUCKERID-13** Cờ bật ở điện thoại: dọc 375×667 cột menu không phải cuộn; ngang 667×375 cột cuộn được, tiêu đề không bị cắt và với tới được nút tài khoản.
- **REQ-DUCKERID-14** Đăng nhập không đổi gì về cách chơi: đã đăng nhập vẫn vào ván như thường.
