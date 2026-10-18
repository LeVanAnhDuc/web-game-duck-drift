# PAUSE — Test cases

Requirement: `docs/requirements/pause.md` · quyết định: `docs/decisions/pause.md`.
Lăng kính: 1 truy vết · 2 phân vùng · 3 biên · 4 chuyển trạng thái · 5 negative · 6 ngoài lề. Đồng hồ giả (`page.clock`).

### TC-PAUSE-001 — Esc mở overlay Tạm dừng, focus ở Tiếp tục

- **Requirement:** REQ-PAUSE-01
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 4
- **Bước:** vào ván → Esc
- **Mong đợi:** heading "TẠM DỪNG"; "Tiếp tục" có focus; nút "Về menu"
- **Automated:** `tests/e2e/pause/pause.e2e.ts`

### TC-PAUSE-002 — phím P tạm dừng, P lần nữa chơi tiếp

- **Requirement:** REQ-PAUSE-01, REQ-PAUSE-02
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 2
- **Bước:** vào ván → P → P
- **Mong đợi:** overlay hiện sau P đầu, mất sau P thứ hai, HUD còn
- **Automated:** `tests/e2e/pause/pause.e2e.ts`

### TC-PAUSE-003 — nút Tạm dừng trên HUD mở overlay

- **Requirement:** REQ-PAUSE-01
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 2
- **Bước:** vào ván → bấm nút "Tạm dừng"
- **Mong đợi:** heading "TẠM DỪNG"
- **Automated:** `tests/e2e/pause/pause.e2e.ts`

### TC-PAUSE-004 — Tiếp tục và Esc đưa về đúng ván: điểm, mạng, wave giữ nguyên

- **Requirement:** REQ-PAUSE-02
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 4
- **Bước:** chơi tới khi điểm > 0 → Esc → "Tiếp tục" → Esc → Esc
- **Mong đợi:** overlay đóng mỗi lần; điểm, mạng, wave sau khi tiếp tục bằng lúc tạm dừng
- **Automated:** `tests/e2e/pause/pause.e2e.ts`

### TC-PAUSE-005 — đang tạm dừng thì thời gian trôi không đổi gì

- **Requirement:** REQ-PAUSE-03
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 4
- **Bước:** vào ván (mức Khó) → Esc → 60 giây giả trôi (2 giây từng frame + 58 lần nhảy 1 giây)
- **Mong đợi:** điểm, mạng, wave như lúc tạm dừng; overlay vẫn mở
- **Automated:** `tests/e2e/pause/pause.e2e.ts`

### TC-PAUSE-006 — chuyển sang tab khác thì tự tạm dừng

- **Requirement:** REQ-PAUSE-04
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 4
- **Bước:** vào ván → tab bị ẩn (`visibilitychange` → hidden)
- **Mong đợi:** overlay "TẠM DỪNG" hiện
- **Automated:** `tests/e2e/pause/pause.e2e.ts`

### TC-PAUSE-007 — cửa sổ mất focus thì tự tạm dừng

- **Requirement:** REQ-PAUSE-04
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 2
- **Bước:** vào ván → `blur` trên window
- **Mong đợi:** overlay "TẠM DỪNG" hiện
- **Automated:** `tests/e2e/pause/pause.e2e.ts`

### TC-PAUSE-008 — tab ẩn 10 phút rồi quay lại: không chạy bù, không mất mạng

- **Requirement:** REQ-PAUSE-04, REQ-PAUSE-05
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 3
- **Bước:** vào ván (mức Khó) → tab ẩn → đồng hồ nhảy 10 phút → "Tiếp tục" → 0,5 giây giả
- **Mong đợi:** "Mạng: 2", wave 1, không có màn Hết lượt
- **Automated:** `tests/e2e/pause/pause.e2e.ts`

### TC-PAUSE-009 — đồng hồ nhảy 10 phút giữa hai frame khi không tạm dừng: ván chỉ tiến tối đa 0,25 giây

- **Requirement:** REQ-PAUSE-05
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 3
- **Bước:** vào ván (mức Khó) → đồng hồ nhảy 10 phút (máy ngủ dậy) → vài frame
- **Mong đợi:** vẫn "Mạng: 2", không có màn Hết lượt (10 phút chạy bù thật thì chắc chắn hết lượt)
- **Automated:** `tests/e2e/pause/pause.e2e.ts`

### TC-PAUSE-010 — chưa có điểm: cảnh báo chỉ nói bỏ ván, không nhắc điểm

- **Requirement:** REQ-PAUSE-06
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 3
- **Bước:** vào ván → Esc ngay (điểm 0)
- **Mong đợi:** câu đúng "Về menu là bỏ ván này." — không có chữ "điểm"
- **Automated:** `tests/e2e/pause/pause.e2e.ts`

### TC-PAUSE-011 — có điểm: cảnh báo nêu số điểm sẽ không được ghi, và Về menu bỏ ván không ghi điểm

- **Requirement:** REQ-PAUSE-06, REQ-PAUSE-07
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 4
- **Bước:** chơi tới khi điểm > 0 → Esc → đọc cảnh báo → "Về menu" → mở Bảng điểm
- **Mong đợi:** "Về menu là bỏ ván này. <điểm HUD> điểm sẽ không được ghi."; về màn hình chính; bảng Thường vẫn trống
- **Automated:** `tests/e2e/pause/pause.e2e.ts`
