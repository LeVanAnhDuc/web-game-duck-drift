# WORLD — Test cases

Requirement: `docs/requirements/world.md` · quyết định: `docs/decisions/world.md`.
Lăng kính: 1 truy vết · 2 phân vùng · 3 biên · 4 chuyển trạng thái · 5 negative · 6 ngoài lề. Mọi case chạy trên ván mức
Thường với đồng hồ giả đứng yên. Toạ độ là đơn vị thế giới 1600 × 1200.

### TC-WORLD-001 — tàu bay ra mép phải thì hiện lại ở mép trái, cùng độ cao

- **Requirement:** REQ-WORLD-01
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 3
- **Bước:** tàu ở x = 1590 bay sang phải 300 đv/s → 0,2 giây
- **Mong đợi:** 0 ≤ x < 100; y không đổi
- **Automated:** `tests/e2e/world/wrap.e2e.ts`

### TC-WORLD-002 — tàu bay ra mép trên thì hiện lại ở mép dưới

- **Requirement:** REQ-WORLD-01
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 2
- **Bước:** tàu ở y = 10 bay lên 300 đv/s → 0,2 giây
- **Mong đợi:** 1100 < y < 1200
- **Automated:** `tests/e2e/world/wrap.e2e.ts`

### TC-WORLD-003 — thiên thạch trôi ra mép trái thì hiện lại ở mép phải

- **Requirement:** REQ-WORLD-02
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 1
- **Bước:** thiên thạch nhỏ ở x = 10 trôi sang trái 100 đv/s → 0,3 giây
- **Mong đợi:** x > 1500; y không đổi
- **Automated:** `tests/e2e/world/wrap.e2e.ts`

### TC-WORLD-004 — va chạm tính qua mép: thiên thạch ở sát mép đối diện vẫn đâm trúng tàu

- **Requirement:** REQ-WORLD-03
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 3
- **Bước:** tàu ở x = 5, thiên thạch nhỏ ở x = 1595 cùng độ cao (cách 10 đv qua mép), hết bất tử → 0,1 giây
- **Mong đợi:** "Mạng: 2"
- **Automated:** `tests/e2e/world/wrap.e2e.ts`

### TC-WORLD-005 — wave 1 có 3 thiên thạch to, không viên nào sát tàu

- **Requirement:** REQ-WORLD-04
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 1
- **Bước:** vào ván → 0,1 giây
- **Mong đợi:** đúng 3 thiên thạch, đều to; mỗi viên cách tàu hơn 245 đv (vòng 260 trừ 0,1 giây trôi)
- **Automated:** `tests/e2e/world/waves.e2e.ts`

### TC-WORLD-006 — bắn hết thiên thạch thì nghỉ 1,5 giây rồi sang wave 2 với 4 thiên thạch to

- **Requirement:** REQ-WORLD-05, REQ-WORLD-06
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 4
- **Tiền điều kiện:** sân chỉ còn một thiên thạch nhỏ trước mũi tàu
- **Bước:** bắn → 1,2 giây → 0,4 giây nữa
- **Mong đợi:** lúc 1,2 s: sân trống, HUD vẫn "Wave 1"; sau đó: "Wave 2", vùng thông báo "Wave 2", 4 thiên thạch to
- **Automated:** `tests/e2e/world/waves.e2e.ts`

### TC-WORLD-007 — số thiên thạch mỗi wave là 2 + n, dừng ở trần 11

- **Requirement:** REQ-WORLD-06
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 3
- **Bước:** giữ tàu bất tử → với từng wave 3, 9, 10, 11: đặt wave trước đó, dọn sân, 1,6 giây
- **Mong đợi:** HUD "Wave n"; số thiên thạch 5, 11, 11, 11
- **Automated:** `tests/e2e/world/waves.e2e.ts`

### TC-WORLD-008 — wave sau thiên thạch nhanh hơn: tốc độ nằm trong khoảng của wave đó

- **Requirement:** REQ-WORLD-07
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 2
- **Bước:** đọc tốc độ wave 1 → giữ tàu bất tử, đặt wave 9, dọn sân, 1,6 giây → đọc tốc độ wave 10
- **Mong đợi:** wave 1 trong [60, 130]; wave 10 trong [60, 130] × 1,54; viên chậm nhất wave 10 nhanh hơn 60
- **Automated:** `tests/e2e/world/waves.e2e.ts`
