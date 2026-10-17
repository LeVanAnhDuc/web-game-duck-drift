# HIGHSCORES — Test cases

Requirement: `docs/requirements/high-scores.md` · quyết định: `docs/decisions/high-scores.md`.
Lăng kính: 1 truy vết · 2 phân vùng · 3 biên · 4 chuyển trạng thái · 5 negative · 6 ngoài lề. Bảng được dựng sẵn trong
khoá localStorage của game.

### TC-HIGHSCORES-001 — ba tab, mở sẵn tab của mức đang chọn

- **Requirement:** REQ-HIGHSCORES-01
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 1
- **Tiền điều kiện:** mức đã chọn = Khó
- **Bước:** menu → "Bảng điểm"
- **Mong đợi:** tablist "Bảng điểm theo mức" có đúng ba tab Dễ, Thường, Khó; Khó `aria-selected=true`
- **Automated:** `tests/e2e/high-scores/table.e2e.ts`

### TC-HIGHSCORES-002 — mỗi dòng có hạng, tên, điểm, wave, ngày, điểm cao đứng trước

- **Requirement:** REQ-HIGHSCORES-02
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 1
- **Tiền điều kiện:** bảng Thường lưu không theo thứ tự: BOB 300 (wave 2), ANA 12.500 (wave 9), CAT 4.000 (wave 5), cùng ngày 01/10/2026
- **Mong đợi:** tiêu đề cột Hạng · Tên · Điểm · Wave · Ngày; dòng 1 `1 ANA 12.500 9 01/10/2026`, dòng 2 `2 CAT 4.000 5 …`, dòng 3 `3 BOB 300 2 …`
- **Automated:** `tests/e2e/high-scores/table.e2e.ts`

### TC-HIGHSCORES-003 — lưu 12 dòng thì chỉ hiện 10 dòng tốt nhất

- **Requirement:** REQ-HIGHSCORES-02
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 3
- **Tiền điều kiện:** bảng Thường có 12 dòng hợp lệ 5.000 → 3.900
- **Mong đợi:** đúng 10 dòng; dòng cuối là hạng 10 với 4.100
- **Automated:** `tests/e2e/high-scores/table.e2e.ts`

### TC-HIGHSCORES-004 — bảng trống nói rõ chưa có điểm ở mức đó và không có nút xoá

- **Requirement:** REQ-HIGHSCORES-03
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 2
- **Bước:** "Bảng điểm" với localStorage trống → lần lượt ba tab
- **Mong đợi:** mỗi tab: "Chưa có điểm nào ở mức <mức>. Chơi một ván đi."; không có nút nào bắt đầu bằng "Xoá bảng"
- **Automated:** `tests/e2e/high-scores/table.e2e.ts`

### TC-HIGHSCORES-005 — xoá bảng Khó chỉ mất bảng Khó, kể cả sau khi tải lại

- **Requirement:** REQ-HIGHSCORES-04
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 4
- **Tiền điều kiện:** ba bảng đều có điểm
- **Bước:** "Bảng điểm" → tab Khó → "Xoá bảng Khó" → tab Dễ → tab Thường → tải lại → "Bảng điểm" → ba tab
- **Mong đợi:** nút ghi đúng "Xoá bảng Khó"; Khó thành bảng trống và nút xoá biến mất; Dễ và Thường còn nguyên dòng của chúng, trước và sau tải lại
- **Automated:** `tests/e2e/high-scores/table.e2e.ts`

### TC-HIGHSCORES-006 — dữ liệu hỏng bị bỏ qua, không crash

- **Requirement:** REQ-HIGHSCORES-05
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 5
- **Tiền điều kiện:** bảng Thường = JSON hỏng `[{oops`; bảng Khó = một dòng đúng `OKK 700` + ba dòng sai (tên `abc`, điểm `"999"`, thiếu `at`); bảng Dễ = `{"not":"an array"}`
- **Mong đợi:** không lỗi trang; Thường và Dễ hiện câu bảng trống; Khó chỉ có một dòng `OKK 700`
- **Automated:** `tests/e2e/high-scores/table.e2e.ts`

### TC-HIGHSCORES-007 — màn nói bảng chỉ lưu trên máy, Quay lại về màn hình chính

- **Requirement:** REQ-HIGHSCORES-06
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 1
- **Mong đợi:** "Bảng điểm này chỉ lưu trên máy bạn."; "Quay lại" → heading "DUCK DRIFT"
- **Automated:** `tests/e2e/high-scores/table.e2e.ts`

### TC-HIGHSCORES-008 — đổi tab không đổi mức sẽ chơi

- **Requirement:** REQ-HIGHSCORES-07
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 4
- **Bước:** menu (Thường) → "Bảng điểm" → tab Khó → "Quay lại" → "Chơi"
- **Mong đợi:** ở menu Thường vẫn được chọn; ván vào với "Mạng: 3"
- **Automated:** `tests/e2e/high-scores/table.e2e.ts`
