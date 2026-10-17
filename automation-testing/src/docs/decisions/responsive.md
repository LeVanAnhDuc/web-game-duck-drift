# RESPONSIVE — Quyết định

Đi cặp với `docs/requirements/responsive.md`.

## Nguồn

Đọc ngày 2026-10-17 (đường dẫn tính từ gốc repo app).

- **Tài liệu:** `docs/02-requirements/scope.md` (FR-17 "Canvas scale-to-fit, bố cục đổi theo 375 / 768 / 1440"),
  `docs/01-product/journeys.md` (US-03), `docs/02-requirements/nfr.md` (NFR-A11Y-03), `docs/03-design/architecture.md`
  (E2E ở 375 / 768 / 1024 / 1440), `docs/decisions/0003-fixed-timestep-and-fixed-world-size.md`,
  `docs/design-system/asteroids/MASTER.md`, `README.md` §What runs on GitHub ("the only automated check of the narrow
  layouts").
- **Code:** `client/src/views/Home/index.tsx` (`h-[100dvh] overflow-hidden`, canvas `h-full w-full`),
  `client/src/components/Button/index.tsx` (`min-h-11`), `client/src/components/Segmented/index.tsx` (`min-h-11`),
  `client/src/components/TuningSlider/index.tsx` (`h-11`), `client/src/views/Home/mains/HighScoresScreen/index.tsx`
  (cột Ngày `hidden sm:table-cell`).
- **Test đã gom (gợi ý):** `client/e2e/layout.spec.ts` "bố cục không bao giờ tràn ngang" (3 case) và "canvas nằm gọn
  trong khung nhìn" → TC-RESPONSIVE-001, 002; `client/e2e/modes.spec.ts` "bốn thanh trượt, vùng bấm ≥ 44px" →
  TC-RESPONSIVE-003; `client/e2e/game.spec.ts` "chỉ xuất hiện trên thiết bị cảm ứng" (nửa chuột) → TC-RESPONSIVE-005.

## Quyết định chốt (Chốt bởi agent — user uỷ quyền)

- **Q1** Bộ cũ chạy **mọi** spec ở năm project (375 / 768 / 1024 / 1440 + Pixel 5). Nay logic chạy một lần ở `app`, còn
  mọi khẳng định phụ thuộc khổ gom về đây, mỗi khổ một vòng trong cùng test (`setViewportSize`): 320 (khổ hẹp nhất còn
  gặp), 375, 768, 1024, 1440. Thêm 320 vì đó là biên dưới thật; FR-17 chỉ kể ba khổ.
- **Q2** Biên 640px của cột Ngày lấy từ code (`sm:` của Tailwind = 640px); docs không nói số. Đây là chi tiết trình bày,
  ghi thành REQ vì nó là thứ duy nhất đổi theo khổ trong bảng điểm; kiểm hai phía biên (639 / 640).
- **Q3** Màn ngang thấp (điện thoại xoay ngang, 667×375): ở bản deploy (cờ đăng nhập tắt) tiêu đề "DUCK DRIFT" bị cắt
  ~24px phía trên (đo 2026-10-17: `y = -23,75`), các nút vẫn bấm được. US-03 chỉ nói cầm **dọc** và FR-17 không có khổ
  ngang, nên đây **không** phải requirement và không ghi bug; ghi lại ở đây làm quan sát. Bản bật đăng nhập đã xử lý
  khổ này (TC-DUCKERID-014).

## Tài khoản test

Không có.

## Ngoài phạm vi

- Bố cục nút cảm ứng trên điện thoại thật: module `touch` (Pixel 5).

## Tech debt liên quan

- `docs/04-state/backlog.md` "Nhìn ba khổ 375 / 768 / 1024 bằng mắt": phần đo được bằng máy nằm ở module này.
