# MENU — Test cases

Requirement: `docs/requirements/menu.md` · quyết định: `docs/decisions/menu.md`.
Lăng kính: 1 truy vết · 2 phân vùng · 3 biên · 4 chuyển trạng thái · 5 negative · 6 ngoài lề.

### TC-MENU-001 — mở trang thấy tên game, dãy độ khó và bốn lối vào

- **Requirement:** REQ-MENU-01
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 1
- **Bước:** mở `./`
- **Mong đợi:** heading "DUCK DRIFT"; nhóm "Độ khó"; nút "Chơi", "Bảng điểm", "Cách chơi", "Tuỳ chỉnh"; title "Duck Drift"
- **Automated:** `tests/e2e/menu/home.e2e.ts`

### TC-MENU-002 — nút Chơi có focus sẵn, Enter vào ván

- **Requirement:** REQ-MENU-02
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 4
- **Bước:** mở `./` → bấm Enter
- **Mong đợi:** "Chơi" đang có focus; sau Enter HUD hiện (nút "Tạm dừng"), menu biến mất
- **Automated:** `tests/e2e/menu/home.e2e.ts`

### TC-MENU-003 — máy chưa chơi bao giờ: dòng điểm nói chưa có điểm, và của mức nào

- **Requirement:** REQ-MENU-03
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 2
- **Tiền điều kiện:** localStorage trống
- **Mong đợi:** "Chưa có điểm nào — Thường"
- **Automated:** `tests/e2e/menu/home.e2e.ts`

### TC-MENU-004 — có điểm: dòng điểm nêu mức và điểm cao nhất của bảng mức đó

- **Requirement:** REQ-MENU-03
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 2
- **Tiền điều kiện:** bảng Thường có 300 và 1.250 (lưu không theo thứ tự)
- **Mong đợi:** "Điểm cao nhất — Thường  1.250"
- **Automated:** `tests/e2e/menu/home.e2e.ts`

### TC-MENU-005 — menu nói điểm chỉ lưu trên máy này

- **Requirement:** REQ-MENU-04
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 1
- **Mong đợi:** dòng "Điểm chỉ lưu trên máy này" nhìn thấy được ở menu
- **Automated:** `tests/e2e/menu/home.e2e.ts`

### TC-MENU-006 — Cách chơi liệt kê phím của năm hành động

- **Requirement:** REQ-MENU-05
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 1
- **Bước:** menu → "Cách chơi"
- **Mong đợi:** Xoay trái / phải → "← →  hoặc  A D"; Đẩy → "↑  hoặc  W"; Bắn → "Space"; Dịch chuyển → "Shift"; Tạm dừng → "Esc  hoặc  P"
- **Automated:** `tests/e2e/menu/help.e2e.ts`

### TC-MENU-007 — Cách chơi nêu cách tính điểm và năm vật phẩm có tên, mô tả, hình

- **Requirement:** REQ-MENU-06
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 1
- **Mong đợi:** năm dòng điểm (20 / 50 / 100 / 200 / 1.000) + "Thêm một mạng mỗi 10.000 điểm"; năm vật phẩm Khiên, Bắn nhanh, Bắn toả, Đạn xuyên, Thêm mạng, mỗi mục có mô tả và một hình (svg)
- **Automated:** `tests/e2e/menu/help.e2e.ts`

### TC-MENU-008 — Quay lại từ Cách chơi về màn hình chính

- **Requirement:** REQ-MENU-07
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 4
- **Mong đợi:** heading "DUCK DRIFT" hiện lại, "Chơi" có focus
- **Automated:** `tests/e2e/menu/help.e2e.ts`
