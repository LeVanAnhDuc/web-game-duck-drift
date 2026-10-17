# ACCESSIBILITY — Test cases

Requirement: `docs/requirements/accessibility.md` · quyết định: `docs/decisions/accessibility.md`.
Lăng kính: 1 truy vết · 2 phân vùng · 3 biên · 4 chuyển trạng thái · 5 negative · 6 ngoài lề.

### TC-ACCESSIBILITY-001 — Tab đi qua các nút của menu theo thứ tự đọc

- **Requirement:** REQ-ACCESSIBILITY-01
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 1
- **Bước:** menu (focus ở "Chơi") → Tab ×3; rồi Shift+Tab ×6
- **Mong đợi:** Tab: Bảng điểm → Cách chơi → Tuỳ chỉnh; Shift+Tab ngược lại về Chơi rồi Khó → Thường → Dễ
- **Automated:** `tests/e2e/accessibility/keyboard.e2e.ts`

### TC-ACCESSIBILITY-002 — Space bấm nút đang có focus ở menu

- **Requirement:** REQ-ACCESSIBILITY-02
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 2
- **Bước:** Tab tới "Cách chơi" → Space
- **Mong đợi:** màn Cách chơi mở (heading "Cách chơi", nút "Quay lại")
- **Automated:** `tests/e2e/accessibility/keyboard.e2e.ts`

### TC-ACCESSIBILITY-003 — Enter bấm nút đang có focus, kể cả để quay lại

- **Requirement:** REQ-ACCESSIBILITY-02
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 2
- **Bước:** Tab tới "Bảng điểm" → Enter → (focus ở "Quay lại") Enter
- **Mong đợi:** Bảng điểm mở; "Quay lại" có focus; Enter về menu
- **Automated:** `tests/e2e/accessibility/keyboard.e2e.ts`

### TC-ACCESSIBILITY-004 — phần tử vừa Tab tới có viền focus nhìn thấy được

- **Requirement:** REQ-ACCESSIBILITY-03
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 1
- **Bước:** Tab từ "Chơi" sang "Bảng điểm"; ở màn Tuỳ chỉnh Tab tới một thanh trượt
- **Mong đợi:** `outline-style` khác `none`, `outline-width` ≥ 2px trên phần tử đang focus
- **Automated:** `tests/e2e/accessibility/keyboard.e2e.ts`

### TC-ACCESSIBILITY-005 — canvas có nhãn thay thế

- **Requirement:** REQ-ACCESSIBILITY-04
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 1
- **Mong đợi:** đúng một phần tử role `img` tên "Khu vực chơi. Điều khiển bằng bàn phím hoặc bằng các nút bên dưới." — ở menu và trong ván
- **Automated:** `tests/e2e/accessibility/screen-reader.e2e.ts`

### TC-ACCESSIBILITY-006 — đúng một vùng thông báo polite, có sẵn từ menu

- **Requirement:** REQ-ACCESSIBILITY-05
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 6
- **Mong đợi:** ở menu: đúng một phần tử `aria-live="polite"` (`aria-atomic="true"`); trong ván vẫn đúng một và nó nói "Wave 1" (vùng `assertive` rỗng mà Next.js tự thêm để báo đổi route không tính — decision Q5)
- **Automated:** `tests/e2e/accessibility/screen-reader.e2e.ts`

### TC-ACCESSIBILITY-007 — mức đang chọn không chỉ khác màu

- **Requirement:** REQ-ACCESSIBILITY-06
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 2
- **Mong đợi:** nút mức đang chọn: `aria-pressed=true`, chữ đậm hơn nút không chọn, có một chấm chỉ thị; nút không chọn không có chấm
- **Automated:** `tests/e2e/accessibility/screen-reader.e2e.ts`

### TC-ACCESSIBILITY-008 — giảm chuyển động thì transition của DOM tắt

- **Requirement:** REQ-ACCESSIBILITY-07
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 2
- **Tiền điều kiện:** `prefers-reduced-motion: reduce`
- **Mong đợi:** `transition-duration` của nút menu ≤ 0,01 ms; không giảm chuyển động thì > 0
- **Automated:** `tests/e2e/accessibility/motion.e2e.ts`

### TC-ACCESSIBILITY-009 — giảm chuyển động không đổi gameplay

- **Requirement:** REQ-ACCESSIBILITY-07
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 2
- **Bước:** đồng hồ giả đóng băng → Chơi → 10 giây, một lần thường, một lần `reduce`
- **Mong đợi:** điểm và mạng của hai lần bằng nhau
- **Automated:** `tests/e2e/accessibility/motion.e2e.ts`

### TC-ACCESSIBILITY-010 — trang khai báo tiếng Việt

- **Requirement:** REQ-ACCESSIBILITY-08
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 1
- **Mong đợi:** `<html lang="vi">`
- **Automated:** `tests/e2e/accessibility/screen-reader.e2e.ts`
