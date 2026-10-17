# PAUSE — Quyết định

Đi cặp với `docs/requirements/pause.md`.

## Nguồn

Đọc ngày 2026-10-17 (đường dẫn tính từ gốc repo app).

- **Tài liệu:** `docs/01-product/journeys.md` (US-04 đủ các mục; US-01 "chuyển sang tab khác giữa ván"),
  `docs/02-requirements/scope.md` (FR-11, FR-15), `docs/02-requirements/nfr.md` (NFR-ROB-03),
  `docs/decisions/0015-game-keys-are-owned-per-phase.md`, `docs/decisions/0019-consequences-announced-before-the-click.md`,
  `docs/specs/no-silent-score-loss/design.md` §1 (F-05), `README.md` §Controls (`Esc` hoặc `P`).
- **Code:** `client/src/hooks/useGame.ts` (`pause`, `resume`, `visibilitychange`, `blur`), `client/src/game/loop.ts`
  (`MAX_FRAME_S` 0,25 s, `MAX_STEPS_PER_FRAME`), `client/src/input/keyboard.ts` (`PAUSE` = Escape, KeyP),
  `client/src/views/Home/components/PauseOverlay/index.tsx`, `client/src/i18n/vi.ts` (`pause.toMenuWarning`).
- **Test đã gom (gợi ý):** `client/e2e/game.spec.ts` "tạm dừng — US-04" (4 case) → TC-PAUSE-001, 003, 004, 006, 011.

## Quyết định chốt (Chốt bởi agent — user uỷ quyền)

- **Q1** US-04 bước 1 nói "nút tạm dừng ở góc HUD trên điện thoại"; code hiện nút đó trên mọi thiết bị. Không mâu thuẫn:
  REQ-PAUSE-01 đòi nút có mặt, không đòi nó vắng trên desktop.
- **Q2** "Không mô phỏng bù khi quay lại" kiểm bằng gì? → `page.clock.fastForward(10 phút)` khi ván đang chạy: đồng hồ
  nhảy một bước, frame kế tiếp thấy khoảng 10 phút. Không có trần 0,25 s thì 10 phút đứng yên là hết lượt chắc chắn; có
  trần thì vẫn đủ mạng (tàu còn bất tử). Kiểm cả hai đường: tab ẩn 10 phút rồi Tiếp tục, và đồng hồ nhảy khi không ai
  tạm dừng.
- **Q3** "Ẩn tab" mô phỏng thế nào? → Đặt `document.visibilityState = "hidden"` rồi phát `visibilitychange` — đúng tín hiệu
  game nghe; Playwright không có API ẩn tab mà giữ trang sống. "Mất focus" = phát `blur` trên `window`.
- **Q4** Điểm của ván bỏ dở có thể lọt bảng không? → Không (design `no-silent-score-loss` §1: "giữ nguyên luật chỉ ghi điểm
  khi hết mạng"). REQ-PAUSE-07 kiểm bảng của mức đó vẫn trống sau khi bỏ một ván có điểm.

## Tài khoản test

Không có.

## Ngoài phạm vi

- Nhả nút cảm ứng đang giữ khi tạm dừng: unit test (`touch.test.ts`, `releaseAll`), DOM không cho thấy trạng thái giữ.

## Tech debt liên quan

_(không có)_
