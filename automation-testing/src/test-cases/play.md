# PLAY — Test cases

Requirement: `docs/requirements/play.md` · quyết định: `docs/decisions/play.md`.
Lăng kính: 1 truy vết · 2 phân vùng · 3 biên · 4 chuyển trạng thái · 5 negative · 6 ngoài lề. Thời gian của ván chạy
bằng `page.clock` khi case cần ván tiến tới một trạng thái.

### TC-PLAY-001 — bấm Chơi thì vào thẳng ván, không có màn chờ

- **Requirement:** REQ-PLAY-01
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 4
- **Bước:** menu → "Chơi"
- **Mong đợi:** nút "Tạm dừng" của HUD hiện; heading "DUCK DRIFT" không còn
- **Automated:** `tests/e2e/play/session.e2e.ts`

### TC-PLAY-002 — HUD lúc vào ván: điểm 0, Wave 1, đủ mạng, nút Tạm dừng

- **Requirement:** REQ-PLAY-02
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 1
- **Bước:** mức Thường → "Chơi"
- **Mong đợi:** điểm "0"; "Wave 1"; "Mạng: 3"; nút "Tạm dừng"
- **Automated:** `tests/e2e/play/session.e2e.ts`

### TC-PLAY-003 — vòng lặp chạy: vùng thông báo nói Wave 1

- **Requirement:** REQ-PLAY-03
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 1
- **Mong đợi:** vùng `aria-live="polite"` có chữ "Wave 1" (chỉ có khi `step()` đã chạy và sinh wave)
- **Automated:** `tests/e2e/play/session.e2e.ts`

### TC-PLAY-004 — đứng yên 2 giây đầu ván không mất mạng

- **Requirement:** REQ-PLAY-04
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 3
- **Bước:** mức Khó (đá nhanh nhất) → Chơi → 1,9 giây giả trôi, không bấm gì
- **Mong đợi:** vẫn "Mạng: 2"
- **Automated:** `tests/e2e/play/session.e2e.ts`

### TC-PLAY-005 — va thiên thạch thì mất đúng một mạng, có thông báo, và viên đá vỡ cho điểm

- **Requirement:** REQ-PLAY-05
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 4
- **Bước:** mức Thường → Chơi → đứng yên, đồng hồ giả chạy tới khi mạng đổi
- **Mong đợi:** "Mạng: 2"; vùng thông báo "Mất một mạng. Còn 2 mạng."; điểm HUD > 0
- **Automated:** `tests/e2e/play/session.e2e.ts`

### TC-PLAY-006 — trong lúc chơi, phím điều khiển không cuộn trang

- **Requirement:** REQ-PLAY-06
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 2
- **Bước:** vào ván → với từng phím ←, →, ↑, A, D, W, Space, Shift: gửi keydown; bấm thật ↑ ↓ Space
- **Mong đợi:** mỗi keydown bị game nhận (`defaultPrevented`); `scrollY` vẫn 0
- **Automated:** `tests/e2e/play/session.e2e.ts`

### TC-PLAY-007 — chuột/bàn phím: gợi ý điều khiển có mặt lúc vào ván và nêu đúng ba phím

- **Requirement:** REQ-PLAY-07
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 1
- **Mong đợi:** dòng "Điều khiển ← →  hoặc  A D · ↑  hoặc  W · Space" hiện
- **Automated:** `tests/e2e/play/controls-hint.e2e.ts`

### TC-PLAY-008 — gợi ý không biến mất chỉ vì điểm lên

- **Requirement:** REQ-PLAY-08
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 4
- **Bước:** vào ván → đứng yên, đồng hồ giả chạy tới khi điểm HUD > 0
- **Mong đợi:** dòng gợi ý vẫn hiện
- **Automated:** `tests/e2e/play/controls-hint.e2e.ts`
