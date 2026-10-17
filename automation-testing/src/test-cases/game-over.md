# GAMEOVER — Test cases

Requirement: `docs/requirements/game-over.md` · quyết định: `docs/decisions/game-over.md`.
Lăng kính: 1 truy vết · 2 phân vùng · 3 biên · 4 chuyển trạng thái · 5 negative · 6 ngoài lề. Mọi case tới màn Hết lượt
bằng một ván mức Khó đứng yên trên đồng hồ giả (`page.clock`).

### TC-GAMEOVER-001 — hết mạng thì màn Hết lượt hiện điểm, wave, hạng, và câu đọc lên khớp panel

- **Requirement:** REQ-GAMEOVER-01
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 1
- **Bước:** mức Khó → Chơi → đứng yên tới khi hết mạng
- **Mong đợi:** heading "HẾT LƯỢT"; "Điểm" = điểm HUD; "Wave" = 1; "Hạng" có giá trị; vùng thông báo "Hết lượt. Tổng điểm N." với N = số trên panel
- **Automated:** `tests/e2e/game-over/result.e2e.ts`

### TC-GAMEOVER-002 — ván đầu tiên sau khi tải trang: bảng trống thì có hạng #1 và có form tên

- **Requirement:** REQ-GAMEOVER-02, REQ-GAMEOVER-03
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 4
- **Tiền điều kiện:** localStorage trống, vừa tải trang
- **Mong đợi:** "Hạng" = "#1", không có "Không lọt bảng"; nhãn "Tên của bạn" nhìn thấy được (không chỉ là aria-label); dòng hướng dẫn; ba ký tự `AAA`; khối ký tự có focus
- **Automated:** `tests/e2e/game-over/result.e2e.ts`

### TC-GAMEOVER-003 — hạng là hạng trong bảng của mức vừa chơi

- **Requirement:** REQ-GAMEOVER-02
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 2
- **Tiền điều kiện:** bảng Khó có 100.000 và 1; bảng Thường đủ 10 dòng điểm cao
- **Mong đợi:** "Hạng" = "#2"
- **Automated:** `tests/e2e/game-over/result.e2e.ts`

### TC-GAMEOVER-004 — gõ chữ và mũi tên đổi được ba ký tự tên

- **Requirement:** REQ-GAMEOVER-04
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 2
- **Bước:** gõ `d` `u` `c` → `DUC`; rồi ← ← (về ô đầu) → ↑ → `EUC`; ↓ ↓ → `CUC`; → ↓ → `CTC`
- **Mong đợi:** khối ký tự hiện đúng từng bước
- **Automated:** `tests/e2e/game-over/initials.e2e.ts`

### TC-GAMEOVER-005 — nút ▲/▼ đổi từng ô, chạy vòng A↔Z

- **Requirement:** REQ-GAMEOVER-04
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 3
- **Bước:** ô 1 ▼ (A → Z); ô 3 ▲ ▲ (A → C)
- **Mong đợi:** `ZAC`
- **Automated:** `tests/e2e/game-over/initials.e2e.ts`

### TC-GAMEOVER-006 — Lưu điểm mở Bảng điểm đúng mức, dòng mới đúng hạng và được làm nổi, còn sau khi tải lại

- **Requirement:** REQ-GAMEOVER-05
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 1
- **Tiền điều kiện:** bảng Khó có 100.000 và 1
- **Bước:** gõ `duc` → "Lưu điểm" → tải lại trang → "Bảng điểm"
- **Mong đợi:** heading "Bảng điểm", tab Khó được chọn; dòng 2 là `DUC` với điểm của ván, chỉ dòng đó có nền; sau tải lại dòng `DUC` vẫn ở hạng 2 của bảng Khó; bảng Thường không có dòng nào
- **Automated:** `tests/e2e/game-over/initials.e2e.ts`

### TC-GAMEOVER-007 — lưu mà không đổi tên thì tên là AAA

- **Requirement:** REQ-GAMEOVER-06
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 5
- **Bước:** "Lưu điểm" ngay
- **Mong đợi:** dòng hạng 1 của bảng Khó có tên `AAA`
- **Automated:** `tests/e2e/game-over/initials.e2e.ts`

### TC-GAMEOVER-008 — không lọt top 10 thì không hỏi tên, không cảnh báo, focus ở Chơi lại

- **Requirement:** REQ-GAMEOVER-07, REQ-GAMEOVER-08
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 3
- **Tiền điều kiện:** bảng Khó đủ 10 dòng, thấp nhất 4.100
- **Mong đợi:** "Hạng" = "Không lọt bảng"; không có khối "Tên của bạn", không có nút "Lưu điểm"; không có câu "lọt bảng nhưng chưa lưu"; "Chơi lại" có focus
- **Automated:** `tests/e2e/game-over/result.e2e.ts`

### TC-GAMEOVER-009 — câu "lọt bảng nhưng chưa lưu" hiện khi có hạng và chưa lưu, biến mất khi đã lưu

- **Requirement:** REQ-GAMEOVER-08
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 4
- **Bước:** tới Hết lượt với điểm lọt bảng → đọc câu → "Lưu điểm"
- **Mong đợi:** câu hiện ngay trên "Về menu" trước khi lưu; sau "Lưu điểm" không còn câu đó ở đâu trên màn (phía "không có hạng" là TC-GAMEOVER-008)
- **Automated:** `tests/e2e/game-over/result.e2e.ts`

### TC-GAMEOVER-010 — Chơi lại vào ván mới cùng mức; Về menu về màn hình chính

- **Requirement:** REQ-GAMEOVER-09
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 4
- **Bước:** tới Hết lượt (mức Khó) → "Chơi lại" → kiểm HUD → tới Hết lượt lần nữa → "Về menu"
- **Mong đợi:** sau Chơi lại: điểm "0", "Mạng: 2", không còn màn Hết lượt; sau Về menu: heading "DUCK DRIFT"
- **Automated:** `tests/e2e/game-over/result.e2e.ts`

### TC-GAMEOVER-011 — localStorage bị chặn: hết lượt không lỗi và không hỏi tên

- **Requirement:** REQ-GAMEOVER-10
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 5
- **Tiền điều kiện:** mọi truy cập localStorage ném lỗi
- **Mong đợi:** màn Hết lượt hiện, không lỗi trang; không có khối "Tên của bạn", không có nút "Lưu điểm"
- **Automated:** `tests/e2e/game-over/result.e2e.ts`
