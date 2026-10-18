# HYPERSPACE — Quyết định

Đi cặp với `docs/requirements/hyperspace.md`.

## Nguồn

Đọc ngày 2026-10-18 (đường dẫn tính từ gốc repo app).

- **Tài liệu:** `docs/02-requirements/scope.md` (FR-08, FR-13, FR-14), `docs/decisions/0005-hyperspace-cooldown-no-random-death.md`,
  `docs/decisions/0015-game-keys-are-owned-per-phase.md`, `docs/specs/asteroids-core/design.md` §3 (cooldown 5,0 s),
  `docs/01-product/journeys.md` (US-03 bước 3: nút dịch chuyển ở giữa), `README.md` §Controls.
- **Code:** `client/src/game/core/ship.ts` (`hyperspace`, `tickShip`, `respawnShip`), `client/src/input/keyboard.ts`
  (`ShiftLeft`, `ShiftRight`), `client/src/input/touch.ts`, `client/src/views/Home/components/TouchControls/index.tsx`,
  `client/src/game/core/state.ts` (`hudOf().hyperReady`).
- **Test có sẵn:** TC-TOUCH-003 chỉ kiểm vị trí nút; TC-PLAY-006 kiểm Shift thuộc về game.

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
- **Q3** "Tới chỗ khác" đo thế nào khi điểm đến ngẫu nhiên? → Ván có seed cố định (`useGame(20260904)`), nên điểm đến
  của cùng một kịch bản luôn như nhau; assert tàu dời hơn 100 đơn vị và vận tốc = 0, không assert toạ độ cụ thể.
- **Q4** Biên của 5 giây: bấm ở ~0,5 s, ~2,5 s, ~4,8 s (không tác dụng) và ở 5,1 s (tác dụng). Nhịp mô phỏng là 1/60 s nên
  không đo được chính xác 5.000 ms; mỗi lần bấm trong vùng hồi đều kiểm `hyperMs > 0` trước.
- **Q5** ADR-0005 §4 viết "cooldown còn lại, hiện ngay trên nút hyperspace", `HudSnapshot` có `hyperReady`, nhưng không
  thành phần nào đọc nó: nút "Dịch chuyển" trông và đọc giống hệt khi đang hồi. ADR là quyết định đã chấp nhận và không
  có ADR nào thay → coi là **bug** (BUG-HYPERSPACE-01), không phải requirement bỏ đi. Kiểm trên màn cảm ứng vì chỉ ở đó
  có nút; bàn phím không có chỗ hiện. Spec đó tự đặt ngữ cảnh điện thoại (`test.use` ở đầu file) để nằm cùng module.

## Tài khoản test

Không có.

## Ngoài phạm vi

- Shift lúc tạm dừng / ở menu không làm gì: phím theo pha đã ở `accessibility` và `pause` (ADR-0015).
- Điểm đến có thể sát thiên thạch (ADR-0005 chấp nhận rủi ro "vị trí xấu"): hành vi cố ý, không kiểm.

## Tech debt liên quan

_(chưa có)_
