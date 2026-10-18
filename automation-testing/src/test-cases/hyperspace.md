# HYPERSPACE — Test cases

Requirement: `docs/requirements/hyperspace.md` · quyết định: `docs/decisions/hyperspace.md`.
Lăng kính: 1 truy vết · 2 phân vùng · 3 biên · 4 chuyển trạng thái · 5 negative · 6 ngoài lề. Mọi case chạy trên ván mức
Thường với đồng hồ giả đứng yên; trên sân chỉ để một thiên thạch nhỏ đứng yên ở góc để wave không kết thúc giữa chừng.
"Bấm Shift" = giữ phím 50 ms giả (vài nhịp mô phỏng; nhịp thứ hai trở đi đã bị thời gian hồi chặn).

### TC-HYPERSPACE-001 — Shift dịch chuyển tàu tới chỗ khác và tàu đứng yên ở đó

- **Requirement:** REQ-HYPERSPACE-01
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 1
- **Bước:** giữ ↑ 0,5 giây (tàu đang trôi) → bấm Shift (trái) → 1 giây trôi
- **Mong đợi:** tàu dời hơn 100 đơn vị so với ngay trước khi bấm; vận tốc 0; một giây sau vẫn đúng chỗ đó
- **Automated:** `tests/e2e/hyperspace/cooldown.e2e.ts`

### TC-HYPERSPACE-002 — Shift phải cũng dịch chuyển như Shift trái

- **Requirement:** REQ-HYPERSPACE-01
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 2
- **Bước:** bấm Shift phải
- **Mong đợi:** tàu dời hơn 100 đơn vị
- **Automated:** `tests/e2e/hyperspace/cooldown.e2e.ts`

### TC-HYPERSPACE-003 — trong 5 giây sau một lần dịch chuyển, bấm Shift không có tác dụng

- **Requirement:** REQ-HYPERSPACE-02
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 3
- **Bước:** bấm Shift → bấm lại ở ~0,5 s, ~2,5 s và ~4,8 s sau lần đầu
- **Mong đợi:** mỗi lần, tàu vẫn ở đúng chỗ lần dịch chuyển đầu đã đặt
- **Automated:** `tests/e2e/hyperspace/cooldown.e2e.ts`

### TC-HYPERSPACE-004 — hết 5 giây hồi thì Shift dịch chuyển được lại

- **Requirement:** REQ-HYPERSPACE-03
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 3
- **Bước:** bấm Shift → 5,1 giây trôi → bấm Shift
- **Mong đợi:** tàu dời hơn 100 đơn vị so với chỗ lần đầu
- **Automated:** `tests/e2e/hyperspace/cooldown.e2e.ts`

### TC-HYPERSPACE-005 — mất mạng thì mạng mới dịch chuyển được ngay, không phải chờ hết hồi của mạng trước

- **Requirement:** REQ-HYPERSPACE-04
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 4
- **Bước:** bấm Shift → hết bất tử, một thiên thạch to đè lên tàu → mất mạng → 1 giây (hồi sinh ở giữa) → bấm Shift
- **Mong đợi:** "Mạng: 2"; tàu hồi sinh ở giữa; Shift dời tàu hơn 100 đơn vị dù chưa hết 5 giây từ lần đầu
- **Automated:** `tests/e2e/hyperspace/cooldown.e2e.ts`

### TC-HYPERSPACE-006 — nút Dịch chuyển dịch chuyển tàu khi giữ

- **Requirement:** REQ-HYPERSPACE-05
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 2
- **Tiền điều kiện:** màn cảm ứng (điện thoại 393 × 727, `pointer: coarse`)
- **Bước:** đặt ngón lên nút "Dịch chuyển" 50 ms → nhấc
- **Mong đợi:** tàu dời hơn 100 đơn vị
- **Automated:** `tests/e2e/hyperspace/touch-button.e2e.ts`

### TC-HYPERSPACE-007 — trong lúc hồi, nút Dịch chuyển cho thấy nó chưa dùng được

- **Requirement:** REQ-HYPERSPACE-06
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 4
- **Tiền điều kiện:** màn cảm ứng
- **Bước:** ghi lại nút "Dịch chuyển" lúc sẵn sàng → giữ nút 50 ms → 1 giây trôi
- **Mong đợi:** đang hồi (kiểm chứng: lõi còn thời gian hồi), và nút khác lúc sẵn sàng ở ít nhất một điểm: tên, chữ, title,
  mô tả, trạng thái disabled / `aria-disabled`, hay class (cách hiện thời gian hồi)
- **Automated:** `tests/e2e/hyperspace/touch-button.e2e.ts`
