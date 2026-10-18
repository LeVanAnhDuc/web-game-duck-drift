# PLAY — Quyết định

Đi cặp với `docs/requirements/play.md`.

## Nguồn

Đọc ngày 2026-10-17 (đường dẫn tính từ gốc repo app).

- **Tài liệu:** `docs/01-product/journeys.md` (US-01 bước 2–5 + "Điều gì có thể sai"), `docs/02-requirements/scope.md`
  (FR-01, FR-05, FR-10, FR-11, FR-14, FR-19), `docs/02-requirements/nfr.md` (NFR-A11Y-06), `docs/03-design/architecture.md`,
  `docs/decisions/0003-fixed-timestep-and-fixed-world-size.md`, `docs/decisions/0015-game-keys-are-owned-per-phase.md`,
  `docs/decisions/0018-ship-reads-first-and-controls-hint.md`, `docs/specs/visible-controls/design.md`, `README.md`
  §Controls.
- **Code:** `client/src/hooks/useGame.ts`, `client/src/game/loop.ts`, `client/src/input/keyboard.ts`,
  `client/src/views/Home/mains/Hud/index.tsx`, `client/src/views/Home/components/ControlsHint/index.tsx`,
  `client/src/views/Home/components/LiveRegion/index.tsx`, `client/src/game/core/constants.ts` (`SHIP.invulnMs` 2000).
- **Test đã gom (gợi ý):** `client/e2e/game.spec.ts` "bắt đầu một ván" (3 case) + "phím game không cuộn trang" →
  TC-PLAY-001…003, 006; `client/e2e/visible-controls.spec.ts` hai case chuột/bàn phím → TC-PLAY-007, 008. Phần tạm dừng
  của `game.spec.ts` sang module `pause`, phần cảm ứng sang `touch`, case "vùng aria-live tồn tại" sang `accessibility`.

## Quyết định chốt (Chốt bởi agent — user uỷ quyền)

- **Q1** Bộ cũ cố ý không assert điểm hay vị trí vật thể vì chạy thời gian thực trên máy CI bận. Ở đây thời gian là
  `page.clock` (vòng lặp đọc `performance.now` + `requestAnimationFrame`, cả hai giả được), nên một ván đứng yên chạy
  được tới lúc va chạm mà không tốn thời gian thật. Vẫn không assert **con số** điểm cụ thể (phụ thuộc cân bằng game), chỉ
  assert quan hệ: điểm > 0, mạng giảm đúng 1, câu thông báo khớp số mạng trên HUD.
- **Q2** Xoay, đẩy, bắn, dịch chuyển có làm đúng việc không? → Không quan sát được từ DOM (canvas). Luật nằm trong
  `step()` và đã có unit test (`ship.test.ts`, `bullets.test.ts`, `step.test.ts`). E2E chỉ chứng minh phím **thuộc về
  game** ở pha chơi (REQ-PLAY-06).
- **Q3** Gợi ý điều khiển ẩn từ wave 2 (ADR-0018): tới được wave 2 cần bắn hết wave 1, không dựng được ổn định từ DOM →
  phần "ẩn ở wave 2" để unit test `ControlsHint` (đã có), e2e giữ phần "có mặt và nêu đúng phím" + "không mất khi điểm lên".
- **Q4** Bộ cũ kiểm "không mất khi điểm lên" bằng cách chờ chữ `20` tới 30 giây thật. Nay chạy đồng hồ giả tới khi điểm
  HUD > 0.

## Tài khoản test

Không có.

## Ngoài phạm vi

- Tạm dừng, tự tạm dừng khi ẩn tab, không mô phỏng bù: module `pause`. Hết lượt: `game-over`.
- Nút cảm ứng và việc không hiện chữ gợi ý trên màn cảm ứng: `touch`.
- Luật chơi từng chỉ để cho unit test nay có module e2e riêng (2026-10-18): điểm khi vỡ và +1 mạng mỗi 10.000 điểm →
  `scoring`; hyperspace và thời gian hồi → `hyperspace`; năm vật phẩm và khe vũ khí → `power-ups`; bọc mép và wave
  tăng dần → `world`.
- Hiệu ứng (particle, rung màn) và UFO: chỉ vẽ trên canvas / xuất hiện ngẫu nhiên, vẫn để unit test của lõi.

## Tech debt liên quan

- `docs/04-state/backlog.md` §Nợ kỹ thuật "`e2e/game.spec.ts` — helper `startGame`" (bấm Chơi với timeout 2s bọc
  `toPass`): thay bằng `GamePage.waitHydrated()` (chờ Chơi có focus) + một cú bấm, không còn vòng thử lại.
