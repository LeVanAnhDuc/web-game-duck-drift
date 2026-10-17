# ACCESSIBILITY — Quyết định

Đi cặp với `docs/requirements/accessibility.md`.

## Nguồn

Đọc ngày 2026-10-17 (đường dẫn tính từ gốc repo app).

- **Tài liệu:** `docs/02-requirements/nfr.md` (NFR-A11Y-02, 04, 05, 06; NFR-I18N-01), `docs/02-requirements/scope.md`
  (FR-16, FR-19), `docs/decisions/0015-game-keys-are-owned-per-phase.md`, `docs/specs/keyboard-and-gameover-fixes/design.md`
  (F-09), `docs/specs/expectations-and-contrast/design.md` §1 (ba tín hiệu cho trạng thái chọn) và §3 (F-10: focus ra
  khỏi trang ở cuối là hành vi trình duyệt, không sửa), `docs/design-system/asteroids/MASTER.md`.
- **Code:** `client/src/app/globals.css` (`:focus-visible` outline 2px, khối `prefers-reduced-motion`),
  `client/src/app/layout.tsx` (`lang="vi"`), `client/src/components/Segmented/index.tsx`,
  `client/src/views/Home/index.tsx` (canvas `role="img"`), `client/src/views/Home/components/LiveRegion/index.tsx`,
  `client/src/hooks/useGame.ts` (`matchMedia('(prefers-reduced-motion: reduce)')` → renderer),
  `client/src/input/keyboard.ts`.
- **Test đã gom (gợi ý):** `client/e2e/keyboard-and-gameover.spec.ts` "Space bấm được nút đang có tiêu điểm" →
  TC-ACCESSIBILITY-002; `client/e2e/game.spec.ts` "vùng aria-live tồn tại" → TC-ACCESSIBILITY-006; `client/e2e/layout.spec.ts` "canvas có
  nhãn thay thế" → TC-ACCESSIBILITY-005.

## Quyết định chốt (Chốt bởi agent — user uỷ quyền)

- **Q1** NFR-A11Y-05 nói "gameplay không đổi" — kiểm thế nào? → Cùng một ván trên đồng hồ giả đóng băng, chạy đúng 10 giây,
  một lần thường và một lần với `reducedMotion: "reduce"`: điểm và mạng phải bằng nhau. Particle / rung màn / vệt đẩy là
  phần vẽ canvas, không đọc được từ DOM; unit test `draw.test.ts` đã kiểm renderer bỏ chúng.
- **Q2** "Focus thấy được" đo bằng gì? → `outline-style` khác `none` và `outline-width` ≥ 2px trên phần tử vừa Tab tới
  (`:focus-visible`). Không đo màu.
- **Q3** Nội dung câu thông báo (wave, mất mạng, hết lượt) đã kiểm ở `play` (TC-PLAY-003, 005) và `game-over`
  (TC-GAMEOVER-001); module này chỉ kiểm vùng thông báo tồn tại đúng một, polite, ngay cả ở menu (vùng `aria-live` phải
  có sẵn trước khi có chữ, nếu không trình đọc màn hình bỏ lỡ câu đầu).
- **Q4** F-10 (Tab qua nút cuối thì focus ra thanh trình duyệt) là quyết định không sửa có lý do → không viết case.
- **Q5** Next.js tự chèn một `next-route-announcer` (vùng `aria-live="assertive"` rỗng, trong shadow root) vào mọi
  trang. Nó của framework, không nói gì trong game một trang này → REQ-ACCESSIBILITY-05 đếm vùng **polite**, không đếm vùng đó.

## Tài khoản test

Không có.

## Ngoài phạm vi

- Tương phản (NFR-A11Y-01): đo bằng số trong design `expectations-and-contrast` §4.
- Vùng bấm 44px (NFR-A11Y-03): `touch` và `responsive`. Vật phẩm có tên + hình trong Cách chơi: `menu` (TC-MENU-007).
- Thanh trượt bằng bàn phím: `custom`.

## Tech debt liên quan

_(không có)_
