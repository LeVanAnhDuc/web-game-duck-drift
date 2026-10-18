# SCORING — Quyết định

Đi cặp với `docs/requirements/scoring.md`.

## Nguồn

Đọc ngày 2026-10-18 (đường dẫn tính từ gốc repo app).

- **Tài liệu:** `docs/02-requirements/scope.md` (FR-04, FR-05, FR-10, FR-19), `docs/02-requirements/nfr.md`
  (NFR-A11Y-06), `docs/specs/asteroids-core/design.md` §2–3 (bảng điểm, mốc +1 mạng), `README.md` §Features.
- **Code:** `client/src/game/core/asteroids.ts` (`breakAsteroid`), `client/src/game/core/score.ts` (`grantExtraLives`),
  `client/src/game/core/collision.ts`, `client/src/game/core/constants.ts` (`ASTEROID_SCORE`, `ASTEROID_CHILD`,
  `SCORING`), `client/src/views/Home/components/LiveRegion/index.tsx`, `client/src/i18n/vi.ts` (`announce.extraLife`).
- **Test có sẵn:** không có e2e; TC-MENU-007 chỉ kiểm màn Cách chơi liệt kê các dòng điểm.

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
- **Q3** Mốc 10.000 điểm kiểm thế nào mà không phải chơi tới 10.000? → Đặt điểm của ván sát mốc (`setScore`) rồi bắn
  một viên thật: biên đúng mốc (9.980 + 20 = 10.000 → thưởng), ngay dưới (9.960 + 20 = 9.980 → chưa), và qua mốc rồi ăn
  thêm điểm (không thưởng lần hai).
- **Q4** Thiên thạch tàu đâm vỡ cũng cho điểm — đã có ở TC-PLAY-005; ở đây chỉ bắn.

## Tài khoản test

Không có.

## Ngoài phạm vi

- UFO (200 / 1.000 điểm, FR-07): xuất hiện theo đồng hồ ngẫu nhiên từ wave 3, lõi đã có unit test; chưa dựng.
- Rơi vật phẩm khi vỡ (xác suất 8 %): module `power-ups` kiểm hiệu lực khi nhặt, không kiểm xúc xắc.

## Tech debt liên quan

_(chưa có)_
