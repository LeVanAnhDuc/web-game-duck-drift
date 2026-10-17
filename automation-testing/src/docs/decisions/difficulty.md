# DIFFICULTY — Quyết định

Đi cặp với `docs/requirements/difficulty.md`.

## Nguồn

Đọc ngày 2026-10-17 (đường dẫn tính từ gốc repo app).

- **Tài liệu:** `docs/01-product/journeys.md` (US-07 "Các bước" + "Điều gì có thể sai"), `docs/02-requirements/scope.md`
  (FR-20), `docs/02-requirements/nfr.md` (NFR-ROB-01, NFR-ROB-02), `docs/decisions/0010-tuning-lives-in-gamestate.md`,
  `docs/decisions/0011-one-storage-key-per-difficulty.md`, `docs/specs/game-modes/design.md`,
  `docs/specs/expectations-and-contrast/design.md` §1 (F-07: ba tín hiệu cho trạng thái chọn), `README.md` §Features.
- **Code:** `client/src/views/Home/index.tsx` (`presetOf`, `choosePreset`), `client/src/views/Home/mains/MenuScreen/index.tsx`,
  `client/src/components/Segmented/index.tsx`, `client/src/storage/settingsStore.ts` (`asteroids.difficulty.v1`),
  `client/src/game/core/constants.ts` (`DIFFICULTY`).
- **Test đã gom (gợi ý):** `client/e2e/modes.spec.ts` "ba mức ở menu, Thường được chọn sẵn", "lựa chọn mức sống qua một
  lần tải lại trang" → TC-DIFFICULTY-001, 003. Ba case còn lại của file đó chuyển sang `high-scores` (ba tab) và
  `custom` (bốn thanh trượt, vào ván).

## Quyết định chốt (Chốt bởi agent — user uỷ quyền)

- **Q1** "Ván bắt đầu với bộ núm của mức" kiểm thế nào trong e2e? → Chỉ số mạng là thứ HUD cho thấy (FR-10). Tốc độ
  thiên thạch, tỉ lệ rơi vật phẩm, wave UFO là luật trong `step()` và đã có unit test (`difficulty.test.ts`); e2e không đo
  vị trí hay tốc độ vật thể (README §What runs on GitHub).
- **Q2** Mức `custom` lưu trong máy thì menu hiện gì? → Thường (`presetOf`); menu chỉ chọn được ba mức sẵn (US-07 bước 1).
  Gộp vào cùng phân vùng "giá trị không hợp lệ cho menu" với chuỗi lạ và JSON hỏng (REQ-DIFFICULTY-05).
- **Q3** Chặn storage bằng gì? → Getter `window.localStorage` ném `SecurityError` trước khi trang chạy, giống chế độ riêng
  tư (`GamePage.blockStorage`).

## Tài khoản test

Không có.

## Ngoài phạm vi

- Bảng điểm tách theo mức (ba tab, xoá theo tab): module `high-scores`. Điểm ghi vào bảng của mức vừa chơi: `game-over`.
- Bốn núm tuỳ chỉnh: module `custom`.

## Tech debt liên quan

- `docs/04-state/backlog.md` §Nợ kỹ thuật: số của Dễ và Khó là ước lượng trên giấy. Test chỉ khoá số mạng, không khoá
  tốc độ hay tỉ lệ rơi.
