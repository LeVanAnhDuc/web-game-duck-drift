# Thiết kế · `ducker-id-sign-in`

**Liên quan:** FR-23 · US-09 · NFR-SEC-03 · NFR-A11Y-03 · NFR-I18N-01 · ADR-0007 · ADR-0021

Phần dùng chung của cả 11 game (hành vi, cấu hình, test, rollout) nằm ở spec chung: `web-game/docs/superpowers/specs/2026-10-04-ducker-id-sign-in-design.md`. File này chỉ ghi phần riêng của Duck Drift.

## 1. Chỗ đặt và hình dạng

- **Vị trí:** `views/Home/mains/MenuScreen`, ngay dưới dòng "Điểm chỉ lưu trên máy này". Game không có header; các màn khác (Hud, Custom, Help, HighScores) không có nút.
- **Nút chưa đăng nhập:** `components/Button` biến thể `ghost`, biểu tượng người bằng SVG inline (không có thư viện icon), cao 44px. Đang đăng nhập: `disabled` + `aria-busy`.
- **Đã đăng nhập:** nút tròn 44px chứa avatar 32px (ảnh, hoặc chữ cái đầu trên nền `accent`).
- **Menu:** `.panel` (viền hairline, bo 10, bốn vạch góc — MASTER §0, ADR-0007 thắng catalog) mở **lên trên** nút, glow thay cho bóng, chuyển động chỉ là `transition-colors` 180ms. Chỉ tối. Màu lấy từ `tailwind.config.ts`, không thêm hex.
- Chữ trong `src/i18n/vi.ts` (`account.*`, NFR-I18N-01).

## 2. Hành vi menu

`role="menu"`/`menuitem`, `aria-haspopup`, `aria-expanded`. Mở thì focus vào mục đầu. ↓/↑ vòng quanh, Home/End nhảy đầu/cuối. Esc đóng và trả focus về nút mở. Tab, hoặc focus sang phần tử thật ngoài menu, đóng mà không giành focus. Bấm ngoài đóng. `focusout` với `relatedTarget = null` KHÔNG đóng (Safari không focus nút khi bấm). Đăng xuất đưa focus sang nút "Đăng nhập" cùng chỗ. Thiếu email thì không hiện dòng email; thiếu tên thì email là dòng chính.

## 3. Tệp

`src/auth/{types,config,pkce,duckerAuth,requests,duckerSession}.ts` (+test), `src/lib/initials.ts`, `src/hooks/{useDuckerAuth,useAccountMenu}.ts`, `src/views/Home/components/AccountButton/`, `src/env.d.ts`, `scripts/build-e2e-auth.mjs`, `e2e/ducker-id-*.spec.ts`.

`src/types/` bị R-14 bác nên kiểu nằm cạnh module (`src/auth/types.ts`). `AccountButton` chỉ dùng ở một view nên nằm ở `views/Home/components/` (R-03), không phải `src/components/`.

## 4. Ngoại lệ NFR

NFR-SEC-03: sessionStorage khoá `ducker.pkce` và không gì khác, xoá khi quay về; mạng chỉ tới issuer đã cấu hình và tới URL ảnh đại diện mà nó trả về, chỉ sau khi người chơi bấm đăng nhập; không gì cả khi cờ tắt. Xem ADR-0021.

Drift không có bất biến nào cấm mạng nên `invariants.md` không đổi; không có test grep/mạng nào cần allowlist (kiểm bằng e2e cờ tắt: không request ra ngoài origin).

## 5. Cổng e2e

Bản build cờ bật (issuer giả `http://ducker.test`, mọi request bị `page.route` chặn) xuất ra `out-auth/` và phục vụ ở cổng 4312; bản mặc định ở 4311. Project `auth-375` / `auth-1440` chỉ chạy `ducker-id-sign-in.spec.ts`.
