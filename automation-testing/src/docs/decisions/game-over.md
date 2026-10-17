# GAMEOVER — Quyết định

Đi cặp với `docs/requirements/game-over.md`.

## Nguồn

Đọc ngày 2026-10-17 (đường dẫn tính từ gốc repo app).

- **Tài liệu:** `docs/01-product/journeys.md` (US-01 bước 6 + "Kết quả mong đợi" + "Trình duyệt chặn localStorage";
  US-02 đủ các mục; US-07 bước 4), `docs/02-requirements/scope.md` (FR-11, FR-12, FR-22), `docs/02-requirements/nfr.md`
  (NFR-ROB-02, NFR-A11Y-06), `docs/decisions/0016-gameover-rank-lives-in-react-state.md`,
  `docs/decisions/0017-gameover-announcement-emitted-at-end-of-step.md`, `docs/decisions/0019-consequences-announced-before-the-click.md`,
  `docs/specs/keyboard-and-gameover-fixes/design.md` (F-01), `docs/specs/no-silent-score-loss/design.md` (F-04, F-05).
- **Code:** `client/src/views/Home/index.tsx` (`submit`, `resolveRank`, `canSave`),
  `client/src/views/Home/components/GameOverOverlay/index.tsx`, `client/src/views/Home/components/InitialsInput/index.tsx`,
  `client/src/views/Home/ghosts/FreezeRankAtGameOver/index.tsx`, `client/src/storage/localScoreStore.ts`
  (`safeStorage`, `rankOf`), `client/src/storage/scoreStore.ts` (`normalizeInitials`).
- **Test đã gom (gợi ý):** `client/e2e/keyboard-and-gameover.spec.ts` "ván ĐẦU TIÊN sau khi tải trang: có hạng, có form,
  và câu đọc lên khớp panel" → TC-GAMEOVER-001, 002, 003. Ba case bàn phím của file đó sang `accessibility` và `custom`;
  case Space ở pha chơi đã ở `play` (TC-PLAY-006).

## Quyết định chốt (Chốt bởi agent — user uỷ quyền)

- **Q1** Tới màn Hết lượt bằng gì? → Như bộ cũ: mức Khó, đứng yên (cách persona tới đó), nhưng trên `page.clock` nên
  ~20 giây giả chạy trong vài giây thật. Bộ cũ phải gộp mọi kiểm vào một test vì mỗi lần tới đó tốn 22 giây thật.
- **Q2** Điểm của một ván đứng yên không được khoá thành số cụ thể (phụ thuộc cân bằng game). Hạng được dựng bằng bảng
  có sẵn có điểm rất cao và rất thấp (100.000 và 1): mọi điểm > 1 rơi đúng hạng #2. Không lọt bảng: bảng đủ 10 dòng
  ≥ 4.100 điểm.
- **Q3** "Làm nổi dòng vừa thêm" kiểm thế nào? → Chỉ dòng đó có nền (computed `background-color` khác trong suốt); không
  khoá màu cụ thể.
- **Q4** localStorage bị chặn mà vẫn hỏi tên: US-01 nói "vẫn chơi được, chỉ không lưu được điểm"; US-02 và US-08 nói
  "Hỏi tên rồi vứt điểm đi: tệ hơn không hỏi". Code: `rankOf` trên kho rỗng trả hạng #1, nên màn Hết lượt hiện "#1", hỏi
  tên, cảnh báo "lọt bảng nhưng chưa lưu", rồi "Lưu điểm" mở một bảng trống. Docs > code → REQ-GAMEOVER-10 như docs, app
  lệch là **bug** (BUG-GAMEOVER-01). Không sửa game trong PR thêm bộ test.
- **Q5** Ván tuỳ chỉnh không hỏi tên / không xếp hạng: module `custom`.

## Tài khoản test

Không có.

## Ngoài phạm vi

- Bảng điểm (ba tab, xoá, dữ liệu hỏng): module `high-scores`.
- Thứ hạng hiển thị khi người chơi đổi mức ở menu trong lúc màn Hết lượt còn mở: không đổi được mức khi màn đó đang mở
  (menu không hiện), nên không có đường UI để kiểm.

## Tech debt liên quan

_(không có)_
