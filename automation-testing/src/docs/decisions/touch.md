# TOUCH — Quyết định

Đi cặp với `docs/requirements/touch.md`.

## Nguồn

Đọc ngày 2026-10-17 (đường dẫn tính từ gốc repo app).

- **Tài liệu:** `docs/01-product/journeys.md` (US-03 đủ các mục), `docs/02-requirements/scope.md` (FR-13, FR-17),
  `docs/02-requirements/nfr.md` (NFR-A11Y-03 "e2e đo `boundingBox` trên Pixel 5"),
  `docs/decisions/0018-ship-reads-first-and-controls-hint.md`, `docs/specs/visible-controls/design.md`, `README.md`
  §Controls (đoạn cảm ứng).
- **Code:** `client/src/views/Home/components/TouchControls/index.tsx` (`HoldButton`: pointer capture, `touch-action:
  none`, chặn `contextmenu`), `client/src/input/touch.ts` (`isCoarsePointer`), `client/src/views/Home/index.tsx`
  (`coarse` quyết định nút hay chữ gợi ý), `client/src/app/layout.tsx` (viewport `userScalable: false`).
- **Test đã gom (gợi ý):** `client/e2e/game.spec.ts` "nút cảm ứng — US-03" (3 case) → TC-TOUCH-001, 002, 004;
  `client/e2e/visible-controls.spec.ts` "cảm ứng: KHÔNG hiện chữ" → TC-TOUCH-001. Nửa "không có nút cảm ứng khi dùng
  chuột" của case đầu sang module `responsive`.

## Quyết định chốt (Chốt bởi agent — user uỷ quyền)

- **Q1** Chạy ở đâu? → Project `app-touch` (Pixel 5: `hasTouch`, `pointer: coarse`, 393×727) — chỉ file trong
  `tests/e2e/touch/`.
- **Q2** "Giữ nút" bằng gì? → Ngón thật qua CDP `Input.dispatchTouchEvent` (touchStart … touchEnd). `pointerdown` giả
  không đủ: nút gọi `setPointerCapture`, và trình duyệt từ chối capture một pointer nó chưa thấy chạm xuống, nên case giả
  không bao giờ vào nhánh "đang giữ".
- **Q3** "Tàu bắn khi giữ Bắn" thấy được ở đâu? → Điểm: với đồng hồ giả bị đóng băng rồi chạy đúng 8 giây, ván là tất định
  (cùng seed, cùng chuỗi bước). Đứng yên 8 giây chỉ có điểm của viên đá va vào tàu; giữ Bắn thì đạn phá đá và điểm cao
  hơn hẳn. Case so hai lần chạy trong cùng test, không khoá con số.
- **Q4** Trượt ngón ra khỏi nút / hai nút cùng lúc / tạm dừng khi đang giữ (US-03 "Điều gì có thể sai"): trạng thái giữ
  không lộ ra DOM; đã có unit test (`touch.test.ts`, `TouchControls/index.test.tsx`). Không lặp ở e2e.

## Tài khoản test

Không có.

## Ngoài phạm vi

- Bố cục theo khổ màn hình không cảm ứng: module `responsive`.

## Tech debt liên quan

_(không có)_
