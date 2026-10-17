# DIFFICULTY — Test cases

Requirement: `docs/requirements/difficulty.md` · quyết định: `docs/decisions/difficulty.md`.
Lăng kính: 1 truy vết · 2 phân vùng · 3 biên · 4 chuyển trạng thái · 5 negative · 6 ngoài lề.

### TC-DIFFICULTY-001 — ba mức ở menu, Thường được chọn sẵn

- **Requirement:** REQ-DIFFICULTY-01
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 1
- **Tiền điều kiện:** localStorage trống
- **Mong đợi:** nhóm "Độ khó" có đúng ba nút Dễ, Thường, Khó; chỉ Thường `aria-pressed=true`
- **Automated:** `tests/e2e/difficulty/presets.e2e.ts`

### TC-DIFFICULTY-002 — đổi mức thì chỉ mức đó được chọn và dòng điểm đổi sang bảng của mức đó

- **Requirement:** REQ-DIFFICULTY-02
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 2
- **Tiền điều kiện:** bảng Khó có 900 điểm, bảng Dễ trống
- **Bước:** bấm Khó → bấm Dễ
- **Mong đợi:** sau Khó: chỉ Khó pressed, "Điểm cao nhất — Khó  900"; sau Dễ: chỉ Dễ pressed, "Chưa có điểm nào — Dễ"
- **Automated:** `tests/e2e/difficulty/presets.e2e.ts`

### TC-DIFFICULTY-003 — lựa chọn mức sống qua một lần tải lại trang

- **Requirement:** REQ-DIFFICULTY-03
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 4
- **Bước:** bấm Khó → tải lại trang
- **Mong đợi:** Khó vẫn được chọn
- **Automated:** `tests/e2e/difficulty/presets.e2e.ts`

### TC-DIFFICULTY-004 — mỗi mức vào ván với đúng số mạng của nó

- **Requirement:** REQ-DIFFICULTY-04
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 2
- **Bước:** với từng mức Dễ / Thường / Khó: chọn mức → Chơi
- **Mong đợi:** HUD "Mạng: 5" / "Mạng: 3" / "Mạng: 2" ngay lúc vào ván
- **Automated:** `tests/e2e/difficulty/presets.e2e.ts`

### TC-DIFFICULTY-005 — giá trị mức lưu không hợp lệ thì menu về Thường

- **Requirement:** REQ-DIFFICULTY-05
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 5
- **Tiền điều kiện:** lần lượt: `"nightmare"`, `"custom"`, chuỗi JSON hỏng `{bad`
- **Mong đợi:** menu hiện, Thường được chọn, không lỗi trang
- **Automated:** `tests/e2e/difficulty/presets.e2e.ts`

### TC-DIFFICULTY-006 — localStorage bị chặn: vẫn chọn và chơi được mức Khó, tải lại thì không nhớ

- **Requirement:** REQ-DIFFICULTY-06
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 5
- **Tiền điều kiện:** mọi truy cập localStorage ném lỗi
- **Bước:** bấm Khó → Chơi → kiểm HUD → tải lại trang
- **Mong đợi:** Khó pressed; HUD "Mạng: 2"; sau tải lại Thường được chọn; không lỗi trang
- **Automated:** `tests/e2e/difficulty/presets.e2e.ts`
