# TOUCH — Test cases

Requirement: `docs/requirements/touch.md` · quyết định: `docs/decisions/touch.md`.
Lăng kính: 1 truy vết · 2 phân vùng · 3 biên · 4 chuyển trạng thái · 5 negative · 6 ngoài lề. Mọi case chạy trên
project `app-touch` (Pixel 5, màn cảm ứng thật).

### TC-TOUCH-001 — vào ván trên màn cảm ứng: năm nút, không có chữ gợi ý phím

- **Requirement:** REQ-TOUCH-01
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 1
- **Bước:** chạm "Chơi"
- **Mong đợi:** năm nút Xoay trái, Xoay phải, Dịch chuyển, Đẩy, Bắn hiện; dòng "Điều khiển …" không có
- **Automated:** `tests/e2e/touch/controls.e2e.ts`

### TC-TOUCH-002 — năm nút và nút Tạm dừng đều không nhỏ hơn 44px

- **Requirement:** REQ-TOUCH-02
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 3
- **Mong đợi:** `boundingBox` của sáu nút đều rộng và cao ≥ 44
- **Automated:** `tests/e2e/touch/controls.e2e.ts`

### TC-TOUCH-003 — xoay bên trái, đẩy và bắn bên phải, dịch chuyển ở giữa, tất cả dưới khu vực chơi

- **Requirement:** REQ-TOUCH-03
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 1
- **Mong đợi:** hai nút xoay ở nửa trái, Đẩy và Bắn ở nửa phải, Dịch chuyển giữa hai cụm; đỉnh mọi nút ở dưới đáy canvas và ở nửa dưới màn hình
- **Automated:** `tests/e2e/touch/controls.e2e.ts`

### TC-TOUCH-004 — chạm và giữ nút không cuộn, không phóng to, không mở menu nhấn-giữ

- **Requirement:** REQ-TOUCH-04
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 5
- **Bước:** giữ "Đẩy" bằng ngón thật 1 giây rồi thả; gửi `contextmenu` lên từng nút
- **Mong đợi:** `scrollY` 0, không tràn ngang, `visualViewport.scale` 1; mọi `contextmenu` bị huỷ
- **Automated:** `tests/e2e/touch/controls.e2e.ts`

### TC-TOUCH-005 — giữ nút Bắn thì tàu bắn suốt lúc giữ

- **Requirement:** REQ-TOUCH-05
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 2
- **Bước:** đồng hồ giả đóng băng → vào ván → 8 giây đứng yên (ghi điểm) → tải lại, vào ván → giữ "Bắn" 8 giây
- **Mong đợi:** điểm khi giữ Bắn cao hơn điểm khi đứng yên cùng thời gian
- **Automated:** `tests/e2e/touch/controls.e2e.ts`
