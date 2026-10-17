# CUSTOM — Quyết định

Đi cặp với `docs/requirements/custom.md`.

## Nguồn

Đọc ngày 2026-10-17 (đường dẫn tính từ gốc repo app).

- **Tài liệu:** `docs/01-product/journeys.md` (US-08 đủ các mục), `docs/02-requirements/scope.md` (FR-21),
  `docs/02-requirements/nfr.md` (NFR-ROB-01, NFR-A11Y-02), `docs/03-design/invariants.md` (#9),
  `docs/decisions/0010-tuning-lives-in-gamestate.md`, `docs/decisions/0015-game-keys-are-owned-per-phase.md`,
  `docs/specs/game-modes/design.md`, `docs/specs/keyboard-and-gameover-fixes/design.md` (F-06, F-09), `README.md` §Features.
- **Code:** `client/src/views/Home/mains/CustomScreen/index.tsx` (`valueTextOf`), `client/src/components/TuningSlider/index.tsx`,
  `client/src/storage/settingsStore.ts` (`clampTuning`, `asteroids.tuning.v1`), `client/src/game/core/constants.ts`
  (`TUNING_LIMITS`, `UFO_NEVER` = 10, `DIFFICULTY.normal`), `client/src/views/Home/components/GameOverOverlay/index.tsx`
  (`canSave`).
- **Test đã gom (gợi ý):** `client/e2e/modes.spec.ts` "vào ván từ màn Tuỳ chỉnh được" → TC-CUSTOM-006;
  `client/e2e/keyboard-and-gameover.spec.ts` "mũi tên đổi được giá trị cả bốn thanh trượt", "kéo UFO từ wave tới mốc
  tắt chỉ bằng bàn phím" → TC-CUSTOM-003, 004. "Bốn thanh trượt, vùng bấm ≥ 44px" sang `responsive`.

## Quyết định chốt (Chốt bởi agent — user uỷ quyền)

- **Q1** "Ván chạy đúng bốn số đó" kiểm thế nào? → Số mạng hiện trên HUD; ba số còn lại là luật trong `step()` (unit test
  `difficulty.test.ts`). Như module `difficulty` Q1.
- **Q2** US-08 bước 2 nói "kéo"; e2e đổi giá trị bằng bàn phím (Home / End / mũi tên) vì đó cũng là REQ-CUSTOM-04 và cho
  giá trị chính xác. Kéo chuột trên `input[type=range]` là hành vi gốc của trình duyệt.
- **Q3** Ván tuỳ chỉnh tới Hết lượt nhanh: Số mạng 1 (Home), tốc độ 1.6× (End), đứng yên trên `page.clock`.
- **Q4** Mặc định của trường hỏng là gì? → Số của mức Thường cho đúng trường đó (`clampTuning` bắt đầu từ
  `DIFFICULTY.normal`); ba trường còn lại giữ giá trị đã lưu (code: "người chơi mất công kéo chúng").

## Tài khoản test

Không có.

## Ngoài phạm vi

- Vùng bấm 44px của thanh trượt (NFR-A11Y-03): module `responsive`.
- Tốc độ, tỉ lệ rơi và UFO thật sự áp vào ván: unit test.

## Tech debt liên quan

_(không có)_
