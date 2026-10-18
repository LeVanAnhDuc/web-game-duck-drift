# SCORING — Test cases

Requirement: `docs/requirements/scoring.md` · quyết định: `docs/decisions/scoring.md`.
Lăng kính: 1 truy vết · 2 phân vùng · 3 biên · 4 chuyển trạng thái · 5 negative · 6 ngoài lề. Mọi case chạy trên ván mức
Thường với đồng hồ giả đứng yên (`GamePage.startFrozen`); "bắn" = giữ Space 0,1 giây thật trên bàn phím, đúng một viên.

### TC-SCORING-001 — bắn vỡ thiên thạch to được 20 điểm và tách thành hai mảnh vừa

- **Requirement:** REQ-SCORING-01
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 2
- **Tiền điều kiện:** sân chỉ còn một thiên thạch to, đứng yên ngay trước mũi tàu
- **Bước:** bắn → 0,3 giây trôi
- **Mong đợi:** điểm HUD "20"; trên sân còn đúng hai thiên thạch vừa
- **Automated:** `tests/e2e/scoring/asteroid-split.e2e.ts`

### TC-SCORING-002 — bắn vỡ thiên thạch vừa được 50 điểm và tách thành hai mảnh nhỏ

- **Requirement:** REQ-SCORING-02
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 2
- **Tiền điều kiện:** sân chỉ còn một thiên thạch vừa trước mũi tàu
- **Bước:** bắn → 0,3 giây trôi
- **Mong đợi:** điểm HUD "50"; còn đúng hai thiên thạch nhỏ
- **Automated:** `tests/e2e/scoring/asteroid-split.e2e.ts`

### TC-SCORING-003 — bắn vỡ thiên thạch nhỏ được 100 điểm và nó biến mất, không sinh mảnh

- **Requirement:** REQ-SCORING-03
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 2
- **Tiền điều kiện:** sân chỉ còn một thiên thạch nhỏ trước mũi tàu
- **Bước:** bắn → 0,3 giây trôi
- **Mong đợi:** điểm HUD "100"; sân trống
- **Automated:** `tests/e2e/scoring/asteroid-split.e2e.ts`

### TC-SCORING-004 — cả chuỗi một thiên thạch to cộng đúng 20 + 2×50 + 4×100 = 520 điểm

- **Requirement:** REQ-SCORING-04
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 4
- **Tiền điều kiện:** sân chỉ còn một thiên thạch to trước mũi tàu
- **Bước:** bắn; mỗi lần vỡ, đưa một mảnh vào trước mũi tàu (các mảnh kia dồn ra mép), bắn tiếp — 7 lần
- **Mong đợi:** sân trống; điểm HUD 520
- **Automated:** `tests/e2e/scoring/asteroid-split.e2e.ts`

### TC-SCORING-005 — chạm đúng mốc 10.000 điểm thì được thêm một mạng và có thông báo

- **Requirement:** REQ-SCORING-05
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 3
- **Tiền điều kiện:** điểm của ván 9.980; một thiên thạch to trước mũi tàu
- **Bước:** bắn → 0,3 giây trôi
- **Mong đợi:** điểm HUD 10.000; "Mạng: 4"; vùng thông báo "Được thêm một mạng"
- **Automated:** `tests/e2e/scoring/extra-life.e2e.ts`

### TC-SCORING-006 — dưới mốc 10.000 điểm thì chưa được thêm mạng

- **Requirement:** REQ-SCORING-06
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 3
- **Tiền điều kiện:** điểm của ván 9.960; một thiên thạch to trước mũi tàu
- **Bước:** bắn → 0,3 giây trôi
- **Mong đợi:** điểm HUD 9.980; vẫn "Mạng: 3"; vùng thông báo không nói "Được thêm một mạng"
- **Automated:** `tests/e2e/scoring/extra-life.e2e.ts`

### TC-SCORING-007 — mỗi mốc chỉ thưởng một lần: điểm tiếp theo sau mốc không cộng thêm mạng

- **Requirement:** REQ-SCORING-06
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 5
- **Tiền điều kiện:** điểm của ván 9.980; một thiên thạch to trước mũi tàu
- **Bước:** bắn (→ 10.000, 4 mạng) → đặt một thiên thạch vừa trước mũi tàu → bắn
- **Mong đợi:** điểm HUD 10.050; vẫn "Mạng: 4"
- **Automated:** `tests/e2e/scoring/extra-life.e2e.ts`
