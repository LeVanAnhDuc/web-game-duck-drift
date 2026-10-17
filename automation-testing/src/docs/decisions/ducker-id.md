# DUCKERID — Quyết định

Đi cặp với `docs/requirements/ducker-id.md`.

## Nguồn

Đọc ngày 2026-10-17 (đường dẫn tính từ gốc repo app).

- **Tài liệu:** `docs/01-product/journeys.md` (US-09 đủ các mục), `docs/02-requirements/scope.md` (FR-23),
  `docs/02-requirements/nfr.md` (NFR-SEC-03 ngoại lệ có giới hạn), `docs/decisions/0021-ducker-id-sign-in.md`,
  `docs/specs/ducker-id-sign-in/design.md` (§1 chỗ đặt, §2 hành vi menu, §4 ngoại lệ NFR, §5 cổng e2e).
- **Code:** `client/src/auth/*` (`config.ts`, `duckerAuth.ts`: `startLogin` chặn bấm đúp, `settleCallbackUrl`;
  `requests.ts`: `REQUEST_TIMEOUT_MS` 15 000), `client/src/hooks/useDuckerAuth.ts`, `client/src/hooks/useAccountMenu.ts`,
  `client/src/views/Home/components/AccountButton/index.tsx`, `client/src/views/Home/mains/MenuScreen/index.tsx`
  (`COLUMN_CLASSES` / `COLUMN_CLASSES_WITH_ACCOUNT`), `client/scripts/build-e2e.mjs` (bản `auth`: issuer giả
  `http://ducker.test`, ra `out-auth/`).
- **Test đã gom (gợi ý):** `client/e2e/ducker-id-flag-off.spec.ts` (2 case) → TC-DUCKERID-001, 002;
  `client/e2e/ducker-id-sign-in.spec.ts` (7 case) → TC-DUCKERID-003, 005, 006, 007, 011, 012, 013.

## Quyết định chốt (Chốt bởi agent — user uỷ quyền)

- **Q1** Chạy ở đâu? → Case cờ tắt ở project `app` (bản deploy); case cờ bật ở `app-auth` (bản `out-auth`, cổng 4312,
  khổ 375×720), chỉ có trên dev. Mọi request tới issuer giả đi qua fixture `fakeIssuer` (`ok` · `deny` · `tamper` ·
  `hang`); không có mạng thật nào.
- **Q2** Bộ cũ khoá cột menu bằng nguyên chuỗi class Tailwind. Đó là chi tiết cài đặt; điều design nói là "cờ tắt thì
  cột này y hệt trước đây" → kiểm bằng style tính toán: `justify-content: center`, không `overflow-y: auto`
  (REQ-DUCKERID-02).
- **Q3** Bộ cũ chạy spec cờ bật ở ba project (375 / 320 / 1440) và có helper "bấm lại tới khi đăng nhập được" vì cú bấm có
  thể rơi vào nút chưa hydrate. Nay `GamePage.waitHydrated()` chờ trước, nên bấm một lần; khổ chỉ quan trọng cho bố cục
  menu (TC-DUCKERID-012 lặp 320 / 375 / 1440 trong một test).
- **Q4** "Không trả lời" chờ thật 15 giây: `AbortSignal.timeout` là bộ đếm gốc của trình duyệt, `page.clock` không tua
  được. Case đó đặt timeout riêng 45 giây.
- **Q5** "Bấm hai lần chỉ chuyển trang một lần": đếm số lần trình duyệt tới `/oauth/authorize` khi bấm đúp nút.

## Tài khoản test

Không có tài khoản thật: issuer giả trả về `DUCKER.user` (`src/data/test-data.ts`).

## Ngoài phạm vi

- Ảnh đại diện từ issuer và fallback chữ cái đầu khi ảnh hỏng: unit test `AccountButton/index.test.tsx`.
- Đăng nhập trên GitHub Pages: bản deploy không bật cờ (ADR-0021), nên prd chỉ chạy TC-DUCKERID-001, 002.

## Tech debt liên quan

_(không có)_
