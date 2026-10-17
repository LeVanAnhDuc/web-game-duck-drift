# CUSTOM — Test cases

Requirement: `docs/requirements/custom.md` · quyết định: `docs/decisions/custom.md`.
Lăng kính: 1 truy vết · 2 phân vùng · 3 biên · 4 chuyển trạng thái · 5 negative · 6 ngoài lề.

### TC-CUSTOM-001 — bốn thanh trượt có nhãn, lần đầu bằng mức Thường

- **Requirement:** REQ-CUSTOM-01
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 1
- **Tiền điều kiện:** localStorage trống
- **Bước:** menu → "Tuỳ chỉnh"
- **Mong đợi:** heading "TUỲ CHỈNH"; bốn slider tìm được bằng nhãn; số hiện: Số mạng 3, Tốc độ 1.0×, Tỉ lệ rơi 8%, UFO từ wave 3
- **Automated:** `tests/e2e/custom/tuning.e2e.ts`

### TC-CUSTOM-002 — Home và End đưa bốn thanh về đúng hai biên

- **Requirement:** REQ-CUSTOM-02, REQ-CUSTOM-03, REQ-CUSTOM-04
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 3
- **Bước:** với từng thanh: Home rồi End
- **Mong đợi:** Home → 1 · 0.6× · 0% · 1; End → 6 · 1.6× · 30% · tắt (số hiện và `aria-valuetext` khớp nhau)
- **Automated:** `tests/e2e/custom/tuning.e2e.ts`

### TC-CUSTOM-003 — mũi tên đổi đúng một bước trên cả bốn thanh

- **Requirement:** REQ-CUSTOM-02, REQ-CUSTOM-04
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 3
- **Bước:** với từng thanh: Home → mũi tên phải
- **Mong đợi:** 2 · 0.7× · 1% · 2
- **Automated:** `tests/e2e/custom/tuning.e2e.ts`

### TC-CUSTOM-004 — mốc cuối của thanh UFO ghi "tắt", ngay dưới đó là wave 9

- **Requirement:** REQ-CUSTOM-03
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 3
- **Bước:** thanh UFO: End → mũi tên trái
- **Mong đợi:** End: chữ "tắt" hiện và `aria-valuetext="tắt"`; một bước trái: "9"
- **Automated:** `tests/e2e/custom/tuning.e2e.ts`

### TC-CUSTOM-005 — dòng "không được ghi vào bảng điểm" nằm trên nút Chơi

- **Requirement:** REQ-CUSTOM-05
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 1
- **Mong đợi:** dòng hiện; đáy của nó ở trên đỉnh nút "Chơi"
- **Automated:** `tests/e2e/custom/tuning.e2e.ts`

### TC-CUSTOM-006 — Chơi vào ván với số mạng đã đặt

- **Requirement:** REQ-CUSTOM-06
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 2
- **Bước:** Số mạng End (6) → "Chơi"
- **Mong đợi:** HUD "Mạng: 6"
- **Automated:** `tests/e2e/custom/tuning.e2e.ts`

### TC-CUSTOM-007 — hết lượt ván tuỳ chỉnh: không hạng, không hỏi tên, bảng điểm không đổi

- **Requirement:** REQ-CUSTOM-07
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 4
- **Tiền điều kiện:** bảng Thường có một dòng; đồng hồ giả
- **Bước:** Số mạng 1, tốc độ 1.6× → Chơi → đứng yên tới khi hết lượt
- **Mong đợi:** "HẾT LƯỢT" với Điểm và Wave; không có "Hạng"; "Ván tuỳ chỉnh không ghi vào bảng điểm."; không có khối tên, không có "Lưu điểm"; ba khoá bảng điểm trong localStorage y như trước
- **Automated:** `tests/e2e/custom/tuning.e2e.ts`

### TC-CUSTOM-008 — bốn số được nhớ sau khi tải lại

- **Requirement:** REQ-CUSTOM-08
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 4
- **Bước:** đặt 5 · 1.2× · 15% · tắt → tải lại → "Tuỳ chỉnh"
- **Mong đợi:** bốn số y như đã đặt
- **Automated:** `tests/e2e/custom/tuning.e2e.ts`

### TC-CUSTOM-009 — số lưu ngoài biên kéo về biên, trường hỏng chỉ trường đó về mặc định

- **Requirement:** REQ-CUSTOM-09
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 5
- **Tiền điều kiện:** `asteroids.tuning.v1` = `{ startLives: 99, asteroidSpeed: 0.1, dropChance: "x", ufoFirstWave: 4 }`
- **Mong đợi:** không lỗi trang; Số mạng 6, Tốc độ 0.6×, Tỉ lệ rơi 8% (mặc định), UFO từ wave 4; Chơi vào ván với "Mạng: 6"
- **Automated:** `tests/e2e/custom/tuning.e2e.ts`

### TC-CUSTOM-010 — Về menu về màn hình chính, mức ở menu không đổi

- **Requirement:** REQ-CUSTOM-10
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 4
- **Tiền điều kiện:** mức Khó đang chọn
- **Bước:** "Tuỳ chỉnh" → "Về menu"
- **Mong đợi:** heading "DUCK DRIFT"; Khó vẫn được chọn
- **Automated:** `tests/e2e/custom/tuning.e2e.ts`
