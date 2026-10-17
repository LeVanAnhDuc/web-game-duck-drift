# HIGHSCORES — Quyết định

Đi cặp với `docs/requirements/high-scores.md`.

## Nguồn

Đọc ngày 2026-10-17 (đường dẫn tính từ gốc repo app).

- **Tài liệu:** `docs/01-product/journeys.md` (US-02 "Dữ liệu bảng điểm bị hỏng", US-06, US-07 bước 5 + "Điều gì có thể
  sai"), `docs/02-requirements/scope.md` (FR-12, FR-22), `docs/02-requirements/nfr.md` (NFR-ROB-01, NFR-I18N-02/03),
  `docs/03-design/invariants.md` (#9), `docs/decisions/0006-scorestore-interface-local-only.md`,
  `docs/decisions/0011-one-storage-key-per-difficulty.md`, `docs/specs/game-modes/design.md`.
- **Code:** `client/src/views/Home/mains/HighScoresScreen/index.tsx`, `client/src/views/Home/index.tsx` (`table` tách khỏi
  `preset`, `showTable`), `client/src/storage/localScoreStore.ts` (`SCORE_KEYS`), `client/src/storage/scoreStore.ts`
  (`isValidEntry`, `sortEntries`, `TOP_N`).
- **Test đã gom (gợi ý):** `client/e2e/modes.spec.ts` "bảng điểm có ba tab" → TC-HIGHSCORES-001.

## Quyết định chốt (Chốt bởi agent — user uỷ quyền)

- **Q1** Ngày hiện theo múi giờ nào? → NFR-I18N-02: lưu UTC (epoch ms), đổi múi giờ ở tầng hiển thị. Dữ liệu mẫu ghi lúc
  12:00 UTC nên ngày như nhau ở mọi múi giờ từ UTC−11 tới UTC+11; case khoá `01/10/2026`.
- **Q2** "Tối đa 10 dòng" kiểm bằng gì? → Ghi 12 dòng hợp lệ vào khoá của bảng; app chỉ đọc 10 dòng tốt nhất. Đây là
  phân vùng "dữ liệu nhiều hơn trần", không phải dữ liệu hỏng.
- **Q3** Dòng hợp lệ là gì? → Theo `isValidEntry`: tên đúng ba chữ A–Z, điểm / wave là số hữu hạn ≥ 0, thời điểm là số.
  Case dữ liệu hỏng trộn một dòng đúng với ba dòng sai (tên thường, điểm chuỗi, thiếu trường) để chứng minh "bỏ dòng
  sai, giữ dòng đúng".
- **Q4** Cột Ngày ẩn ở khổ hẹp: module `responsive`.

## Tài khoản test

Không có.

## Ngoài phạm vi

- Ghi điểm mới vào bảng và làm nổi dòng vừa thêm: module `game-over`.
- Bảng xếp hạng online: Non-Goal (`docs/01-product/overview.md` §4).

## Tech debt liên quan

_(không có)_
