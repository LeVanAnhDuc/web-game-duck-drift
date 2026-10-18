# POWERUPS — Quyết định

Đi cặp với `docs/requirements/power-ups.md`.

## Nguồn

Đọc ngày 2026-10-18 (đường dẫn tính từ gốc repo app).

- **Tài liệu:** `docs/02-requirements/scope.md` (FR-03, FR-09, FR-10), `docs/decisions/0004-single-weapon-slot-for-powerups.md`,
  `docs/02-requirements/nfr.md` (NFR-A11Y-04), `docs/specs/asteroids-core/design.md` §3 (hiệu lực 12 s, trần 20 s),
  `README.md` §Features.
- **Code:** `client/src/game/core/powerups.ts` (`applyPowerUp`), `client/src/game/core/bullets.ts` (`fireBullets`,
  trần đạn, bắn toả, xuyên), `client/src/game/core/ship.ts` (`damageShip`, `dropPowerUps`), `client/src/game/core/collision.ts`,
  `client/src/views/Home/mains/Hud/index.tsx` (thanh vũ khí, dấu khiên), `client/src/i18n/vi.ts` (`powerUps`).
- **Test có sẵn:** TC-MENU-007 chỉ kiểm màn Cách chơi có đủ năm tên.

## Quyết định chốt (Chốt bởi agent — user uỷ quyền)

- **Q1** Luật này chỉ hiện trên canvas; e2e có nên kiểm không, hay để hết cho unit test như `play.md` từng ghi? → Kiểm,
  vì unit test gọi `step()` thẳng và không chứng minh được bản build thật nối đúng: phím/nút → input → vòng lặp → HUD
  → vùng thông báo. Thế giới sau canvas đọc qua `WorldProbe` (`src/components/world-probe.component.ts`): đi từ React
  fiber của `<canvas>` lên `Home` và lấy ref `GameState` mà `useGame` giữ — có cả trong bản production, không cần sửa
  code game. Dựng tình huống (đặt thiên thạch trước mũi tàu, thả vật phẩm dưới tàu, đặt điểm sát mốc) là **setup** như
  `seedStorage`, làm giữa hai nhịp của đồng hồ giả đứng yên (`GamePage.startFrozen`); bóp cò, dịch chuyển, nhặt, va
  chạm, cộng điểm, đổi wave đều do vòng lặp thật chạy. Kết quả assert trên HUD/thông báo khi có, trên `WorldProbe.read()`
  khi chỉ canvas thấy được. Rủi ro chấp nhận: probe phụ thuộc cấu trúc fiber của React (tìm theo hình dạng state, không
  theo vị trí hook hay tên component) — React đổi cấu trúc thì probe báo lỗi rõ ràng, không cho kết quả sai.
- **Q2** Số cụ thể (20/50/100, 5 giây, 12/20 giây, 2 + n…) là requirement hay chi tiết cân bằng? → Requirement: chúng nằm
  trong FR/ADR/design §3 và màn Cách chơi, người chơi đọc được. Lấy một chỗ ở `src/data/test-data.ts` (`RULES`) kèm nguồn.
- **Q3** Dấu khiên trên HUD là một hình `aria-hidden` trong nhóm "Mạng: N", không có tên. Có phải bug NFR-A11Y-04? →
  Không: NFR-A11Y-04 cấm mã hoá **chỉ bằng màu**, dấu khiên có hình riêng (lục giác). Nhận biết = số hình trong nhóm mạng
  nhiều hơn số mạng một (`Hud.pips()`).
- **Q4** `vi.announce.powerUp` ("Nhặt được …") có trong file chuỗi nhưng lõi không bao giờ phát. NFR-A11Y-06 chỉ đòi
  công bố đổi mạng, đổi wave và hết lượt → không phải requirement, không coi là bug; ghi lại ở đây để ai làm a11y biết.
- **Q5** "Nhịp gấp đôi" đo bằng khoảng cách giữa hai viên liên tiếp (quãng đường / 780 đv/s): 140 ms thay vì 280 ms, cho
  phép dài thêm tối đa một nhịp 1/60 s vì cooldown chỉ hết ở ranh giới nhịp mô phỏng.
- **Q6** Thanh thời gian hiện số giây làm tròn lên (`Math.ceil`), nên "12s" ngay khi nhặt và "1s" ở 0,3 s cuối.

## Tài khoản test

Không có.

## Ngoài phạm vi

- Xác suất rơi (8 %, Dễ 16 %, Khó 5 %), trần 2 vật phẩm trên màn, nhấp nháy 3 giây cuối: ngẫu nhiên hoặc chỉ vẽ trên
  canvas; lõi đã có unit test.

## Tech debt liên quan

_(chưa có)_
