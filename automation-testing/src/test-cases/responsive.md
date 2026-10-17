# RESPONSIVE — Test cases

Requirement: `docs/requirements/responsive.md` · quyết định: `docs/decisions/responsive.md`.
Lăng kính: 1 truy vết · 2 phân vùng · 3 biên · 4 chuyển trạng thái · 5 negative · 6 ngoài lề. Khổ: 320, 375, 768,
1024, 1440 (cao 720, riêng 1440 cao 900).

### TC-RESPONSIVE-001 — không màn nào cuộn ngang, từ 320 tới 1440px

- **Requirement:** REQ-RESPONSIVE-01
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 3
- **Tiền điều kiện:** bảng Thường có 10 dòng (bảng dài nhất có thể)
- **Bước:** ở từng khổ: màn hình chính → Cách chơi → Bảng điểm → Tuỳ chỉnh
- **Mong đợi:** `scrollWidth - clientWidth ≤ 0` trên cả bốn màn ở cả năm khổ
- **Automated:** `tests/e2e/responsive/layout.e2e.ts`

### TC-RESPONSIVE-002 — trong ván, canvas và HUD nằm trọn trong khung nhìn ở mọi khổ

- **Requirement:** REQ-RESPONSIVE-02
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 3
- **Bước:** ở từng khổ: vào ván
- **Mong đợi:** không cuộn ngang; canvas: `x ≥ 0`, `x + width ≤ khổ`, `y + height ≤ cao`; điểm, wave và nút Tạm dừng nằm trong khung nhìn
- **Automated:** `tests/e2e/responsive/layout.e2e.ts`

### TC-RESPONSIVE-003 — nút, nút chọn mức và thanh trượt cao ít nhất 44px ở 320 và 1440

- **Requirement:** REQ-RESPONSIVE-03
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 3
- **Mong đợi:** ở 320 và 1440: bốn nút menu, ba nút chọn mức và bốn thanh trượt Tuỳ chỉnh đều cao ≥ 44
- **Automated:** `tests/e2e/responsive/layout.e2e.ts`

### TC-RESPONSIVE-004 — cột Ngày của bảng điểm ẩn dưới 640px, hiện từ 640px

- **Requirement:** REQ-RESPONSIVE-04
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 3
- **Tiền điều kiện:** bảng Thường có một dòng
- **Mong đợi:** 375 và 639: bốn cột Hạng · Tên · Điểm · Wave; 640 và 1024: thêm Ngày
- **Automated:** `tests/e2e/responsive/layout.e2e.ts`

### TC-RESPONSIVE-005 — máy dùng chuột không thấy nút cảm ứng

- **Requirement:** REQ-RESPONSIVE-05
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 2
- **Bước:** Desktop Chrome (con trỏ chuột) → vào ván, ở 375 và 1440
- **Mong đợi:** không có nút Xoay trái, Xoay phải, Dịch chuyển, Đẩy, Bắn
- **Automated:** `tests/e2e/responsive/layout.e2e.ts`
