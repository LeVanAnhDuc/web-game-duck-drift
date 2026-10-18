# POWERUPS — Test cases

Requirement: `docs/requirements/power-ups.md` · quyết định: `docs/decisions/power-ups.md`.
Lăng kính: 1 truy vết · 2 phân vùng · 3 biên · 4 chuyển trạng thái · 5 negative · 6 ngoài lề. Mọi case chạy trên ván mức
Thường với đồng hồ giả đứng yên; "nhặt X" = thả vật phẩm X ngay dưới tàu rồi để 50 ms trôi (vòng lặp tự nhặt).
"Va chạm" = hết bất tử, một thiên thạch to đè lên tàu, 0,1 giây trôi.

### TC-POWERUPS-001 — nhặt Khiên: HUD có thêm dấu khiên cạnh số mạng, không có thanh vũ khí

- **Requirement:** REQ-POWERUPS-01
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 1
- **Bước:** nhặt Khiên
- **Mong đợi:** nhóm mạng có 4 hình (3 tàu + khiên) mà vẫn "Mạng: 3"; không có thanh vũ khí
- **Automated:** `tests/e2e/power-ups/pickup.e2e.ts`

### TC-POWERUPS-002 — Khiên chặn đúng một lần va chạm: không mất mạng, dấu khiên mất

- **Requirement:** REQ-POWERUPS-02
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 4
- **Bước:** nhặt Khiên → va chạm → va chạm lần nữa
- **Mong đợi:** sau lần 1: "Mạng: 3", còn 3 hình, điểm 20 (viên đá vẫn vỡ); sau lần 2: "Mạng: 2"
- **Automated:** `tests/e2e/power-ups/pickup.e2e.ts`

### TC-POWERUPS-003 — Khiên không hết hạn theo thời gian

- **Requirement:** REQ-POWERUPS-03
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 3
- **Bước:** nhặt Khiên → 25 giây trôi (quá trần 20 giây của vũ khí)
- **Mong đợi:** vẫn 4 hình trong nhóm mạng
- **Automated:** `tests/e2e/power-ups/pickup.e2e.ts`

### TC-POWERUPS-004 — nhặt Thêm mạng: số mạng tăng một ngay, không chiếm khe nào

- **Requirement:** REQ-POWERUPS-04
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 1
- **Bước:** nhặt Thêm mạng
- **Mong đợi:** "Mạng: 4", 4 hình; không có thanh vũ khí
- **Automated:** `tests/e2e/power-ups/pickup.e2e.ts`

### TC-POWERUPS-005 — nhặt vũ khí: thanh vũ khí hiện tên và 12 giây

- **Requirement:** REQ-POWERUPS-05
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 2
- **Bước:** với từng loại Bắn nhanh, Bắn toả, Đạn xuyên (mỗi loại một ván): nhặt
- **Mong đợi:** thanh vũ khí hiện tên loại đó và "12s"
- **Automated:** `tests/e2e/power-ups/pickup.e2e.ts`

### TC-POWERUPS-006 — nhặt vũ khí khác loại thì thay hẳn vũ khí cũ và đếm lại từ 12 giây

- **Requirement:** REQ-POWERUPS-06
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 4
- **Bước:** nhặt Bắn nhanh → 5 giây ("7s") → nhặt Bắn toả
- **Mong đợi:** thanh chỉ còn "Bắn toả", không còn "Bắn nhanh"; "12s"
- **Automated:** `tests/e2e/power-ups/weapon-slot.e2e.ts`

### TC-POWERUPS-007 — nhặt trùng loại thì cộng dồn thời gian

- **Requirement:** REQ-POWERUPS-07
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 3
- **Bước:** nhặt Đạn xuyên → 5 giây → nhặt Đạn xuyên
- **Mong đợi:** "19s" (7 + 12, dưới trần); vẫn "Đạn xuyên"
- **Automated:** `tests/e2e/power-ups/weapon-slot.e2e.ts`

### TC-POWERUPS-008 — cộng dồn không vượt trần 20 giây

- **Requirement:** REQ-POWERUPS-07
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 3
- **Bước:** nhặt Bắn nhanh → 2 giây → nhặt Bắn nhanh (10 + 12 = 22)
- **Mong đợi:** "20s"
- **Automated:** `tests/e2e/power-ups/weapon-slot.e2e.ts`

### TC-POWERUPS-009 — hết 12 giây thì vũ khí hết và thanh vũ khí biến mất

- **Requirement:** REQ-POWERUPS-08
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 3
- **Bước:** nhặt Bắn toả → 11,7 giây → 0,5 giây nữa
- **Mong đợi:** lúc 11,7 s thanh còn "1s"; sau đó thanh biến mất và tàu không còn vũ khí
- **Automated:** `tests/e2e/power-ups/weapon-slot.e2e.ts`

### TC-POWERUPS-010 — Khiên không chiếm khe vũ khí: nhặt Khiên khi đang có vũ khí thì giữ cả hai

- **Requirement:** REQ-POWERUPS-09
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 2
- **Bước:** nhặt Bắn nhanh → nhặt Khiên
- **Mong đợi:** thanh "Bắn nhanh" vẫn còn; nhóm mạng 4 hình
- **Automated:** `tests/e2e/power-ups/weapon-slot.e2e.ts`

### TC-POWERUPS-011 — mất mạng thì mất cả vũ khí lẫn khiên đang có

- **Requirement:** REQ-POWERUPS-10
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 4
- **Bước:** nhặt Bắn nhanh + Khiên → va chạm (khiên đỡ) → va chạm
- **Mong đợi:** sau lần 1: "Mạng: 3", còn thanh "Bắn nhanh"; sau lần 2: "Mạng: 2", không còn thanh vũ khí, 2 hình
- **Automated:** `tests/e2e/power-ups/weapon-slot.e2e.ts`

### TC-POWERUPS-012 — không có vũ khí: giữ Space một giây bắn tối đa 4 viên

- **Requirement:** REQ-POWERUPS-11
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 2
- **Bước:** không vật phẩm → giữ Space 1 giây (không có gì trong đường đạn)
- **Mong đợi:** đúng 4 viên đạn của tàu trên sân
- **Automated:** `tests/e2e/power-ups/weapon-effects.e2e.ts`

### TC-POWERUPS-013 — Bắn nhanh: giữ Space thì nhịp bắn nhanh gấp đôi

- **Requirement:** REQ-POWERUPS-11
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 2
- **Bước:** nhặt Bắn nhanh → giữ Space 1 giây
- **Mong đợi:** nhiều hơn 4 viên; hai viên liên tiếp cách nhau 140 ms (tối đa thêm một nhịp 1/60 s), không phải 280 ms
- **Automated:** `tests/e2e/power-ups/weapon-effects.e2e.ts`

### TC-POWERUPS-014 — Bắn toả: một lần bóp cò ra ba viên

- **Requirement:** REQ-POWERUPS-11
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 2
- **Bước:** nhặt Bắn toả → giữ Space 0,1 giây
- **Mong đợi:** 3 viên đạn
- **Automated:** `tests/e2e/power-ups/weapon-effects.e2e.ts`

### TC-POWERUPS-015 — Đạn xuyên: viên đạn bắn vỡ thiên thạch rồi bay tiếp

- **Requirement:** REQ-POWERUPS-11
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 2
- **Bước:** nhặt Đạn xuyên → một thiên thạch nhỏ trước mũi tàu → bắn → 0,2 giây
- **Mong đợi:** điểm 100; viên đạn vẫn còn trên sân
- **Automated:** `tests/e2e/power-ups/weapon-effects.e2e.ts`

### TC-POWERUPS-016 — đạn thường thì mất khi trúng thiên thạch

- **Requirement:** REQ-POWERUPS-11
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 5
- **Bước:** không vật phẩm → một thiên thạch nhỏ trước mũi tàu → bắn → 0,2 giây
- **Mong đợi:** điểm 100; không còn viên đạn nào (đối chứng của TC-POWERUPS-015)
- **Automated:** `tests/e2e/power-ups/weapon-effects.e2e.ts`
