# WORLD — Quyết định

Đi cặp với `docs/requirements/world.md`.

## Nguồn

Đọc ngày 2026-10-18 (đường dẫn tính từ gốc repo app).

- **Tài liệu:** `docs/02-requirements/scope.md` (FR-04, FR-06), `docs/decisions/0003-fixed-timestep-and-fixed-world-size.md`
  (thế giới 1600 × 1200), `docs/03-design/invariants.md` (#5 khoảng cách có wrap), `docs/specs/asteroids-core/design.md`
  §2–3 (wave `min(2 + n, 11)`, hệ số tốc độ, nghỉ 1,5 s), `docs/02-requirements/nfr.md` (NFR-A11Y-06).
- **Code:** `client/src/game/core/vector.ts` (`wrapBody`, `shortestDelta*`, `overlaps`), `client/src/game/core/spawn.ts`
  (`waveAsteroidCount`, `spawnWave`, vòng an toàn wave 1), `client/src/game/core/asteroids.ts` (`waveSpeedFactor`),
  `client/src/game/core/step.ts` (bước 7: nghỉ rồi sinh wave).

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
- **Q3** Trần 11 kiểm ở wave nào? → 9 (2 + 9 = 11, bước tăng cuối), 10 và 11 (vẫn 11), cộng wave 3 làm đại diện vùng
  dưới trần. Nhảy tới đó bằng `setWave` rồi dọn sân — việc dọn sân chạy đúng nhánh "hết thiên thạch → nghỉ → sinh wave"
  của `step()`. Trong lúc đếm, tàu được giữ bất tử (`setInvulnerable`): từ wave 2 thiên thạch có thể sinh đè lên tàu, va
  chạm làm vỡ một viên và sai số đếm.
- **Q4** Tốc độ ngẫu nhiên trong khoảng: assert mọi viên nằm trong `[60, 130] × hệ số` của wave, và viên chậm nhất wave
  10 vẫn nhanh hơn mức thấp nhất wave 1 có thể có.

## Tài khoản test

Không có.

## Ngoài phạm vi

- Đạn, UFO, vật phẩm, particle cũng bọc mép (cùng hàm `wrapBody`): đại diện bằng tàu và thiên thạch.
- Banner "WAVE n" trên canvas mờ dần trong 1,8 s: chỉ vẽ; vùng thông báo đã nói số wave.

## Tech debt liên quan

_(chưa có)_
