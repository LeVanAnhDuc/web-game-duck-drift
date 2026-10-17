# MENU — Quyết định

Đi cặp với `docs/requirements/menu.md`.

## Nguồn

Đọc ngày 2026-10-17 (đường dẫn tính từ gốc repo app).

- **Tài liệu:** `docs/01-product/journeys.md` (US-01 bước 1, US-06, US-07 bước 2), `docs/02-requirements/scope.md`
  (FR-11), `docs/decisions/0020-set-leaderboard-expectations-at-the-menu.md`,
  `docs/specs/expectations-and-contrast/design.md` §1–2 (F-07, F-08), `README.md` §Controls và §Features.
- **Code:** `client/src/views/Home/mains/MenuScreen/index.tsx`, `client/src/views/Home/mains/HelpScreen/index.tsx`,
  `client/src/i18n/vi.ts` (`menu`, `help`, `powerUps`), `client/src/game/core/constants.ts` (`ASTEROID_SCORE`, `UFO`).
- **Test đã gom (gợi ý):** `client/e2e/layout.spec.ts` "màn hình chính" (3 case) và "màn Cách chơi liệt kê đủ năm vật
  phẩm" (2 case) → TC-MENU-001, 003, 005, 007, 008.

## Quyết định chốt (Chốt bởi agent — user uỷ quyền)

- **Q1** US-01 bước 1 nói menu có "điểm cao nhất của máy này"; code (F-07, ADR-0020) nêu điểm cao nhất **của mức đang
  chọn**. Docs mới hơn (US-07 bước 2, design `expectations-and-contrast`) nói rõ dòng này đổi theo mức → REQ-MENU-03 theo
  mức. Không mâu thuẫn thật.
- **Q2** Điểm có sẵn dựng bằng gì? → Ghi bảng điểm vào khoá localStorage của chính game (`asteroids.highscores.*`) rồi
  tải lại (`GamePage.seedStorage`).
- **Q3** "Focus sẵn ở Chơi" là requirement hay chi tiết code? → Requirement: `autoFocus` có chủ ý trong MenuScreen và
  NFR-A11Y-02 (thao tác được bằng bàn phím). Nó cũng là tín hiệu "đã hydrate" mà page object dùng.
- **Q4** Bản cũ chạy năm khổ cho cả ba case màn chính. Nội dung menu không đổi theo khổ → chạy một lần ở `app`; phần
  phụ thuộc khổ (tràn ngang) thuộc module `responsive`.

## Tài khoản test

Không có (game không có tài khoản).

## Ngoài phạm vi

- Màn Bảng điểm: module `high-scores`. Dãy độ khó: module `difficulty`. Màn Tuỳ chỉnh: module `custom`.
- Tương phản màu (NFR-A11Y-01): đã đo bằng số trong `docs/specs/expectations-and-contrast/design.md` §4; e2e không đo lại.

## Tech debt liên quan

_(không có)_
