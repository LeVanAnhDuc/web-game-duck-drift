# PRIVACY — Test cases

Requirement: `docs/requirements/privacy.md` · quyết định: `docs/decisions/privacy.md`.
Lăng kính: 1 truy vết · 2 phân vùng · 3 biên · 4 chuyển trạng thái · 5 negative · 6 ngoài lề. "Một ván" = tải → Khó →
Chơi → đứng yên tới hết lượt → Lưu điểm → Bảng điểm, trên đồng hồ giả.

### TC-PRIVACY-001 — cả một ván không có request nào ra ngoài origin

- **Requirement:** REQ-PRIVACY-01
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 6
- **Mong đợi:** mọi request (kể cả font, script, ảnh) cùng origin với site
- **Automated:** `tests/e2e/privacy/network-storage.e2e.ts`

### TC-PRIVACY-002 — mất mạng sau khi tải xong vẫn chơi tới hết lượt và lưu điểm được

- **Requirement:** REQ-PRIVACY-02
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 5
- **Bước:** tải trang → ngắt mạng → một ván
- **Mong đợi:** màn Hết lượt hiện; "Lưu điểm" mở Bảng điểm với dòng vừa lưu; không lỗi trang
- **Automated:** `tests/e2e/privacy/network-storage.e2e.ts`

### TC-PRIVACY-003 — không cookie, không sessionStorage

- **Requirement:** REQ-PRIVACY-03
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 6
- **Bước:** một ván
- **Mong đợi:** `context.cookies()` rỗng; `sessionStorage.length` = 0
- **Automated:** `tests/e2e/privacy/network-storage.e2e.ts`

### TC-PRIVACY-004 — localStorage chỉ có khoá của game

- **Requirement:** REQ-PRIVACY-04
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 6
- **Bước:** đổi một thanh trượt ở Tuỳ chỉnh → một ván
- **Mong đợi:** mọi khoá bắt đầu bằng `asteroids.`; có đúng khoá mức, khoá bốn núm và khoá bảng Khó
- **Automated:** `tests/e2e/privacy/network-storage.e2e.ts`

### TC-PRIVACY-005 — console không có lỗi suốt một vòng chơi đầy đủ

- **Requirement:** REQ-PRIVACY-05
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 6
- **Bước:** Cách chơi → Tuỳ chỉnh → một ván
- **Mong đợi:** không có `console.error`, không có `pageerror`
- **Automated:** `tests/e2e/privacy/network-storage.e2e.ts`
