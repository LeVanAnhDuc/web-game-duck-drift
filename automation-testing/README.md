# web-game-duck-drift-automation-testing

E2E Playwright cho **Duck Drift**: test UI trên trình duyệt thật và test API qua HTTP, chạy với môi trường dev (bản xuất tĩnh build tại chỗ) và prd (GitHub Pages).
Quy ước đầy đủ (cấu trúc, phân lớp, tag, format, luật cứng): `CLAUDE.md`. Mỗi thư mục trong `src/` có `README.md` riêng.

## Bắt đầu

1. `pnpm install && pnpm exec playwright install chromium`
2. `cp .env.example .env` (không cần tài khoản: game tĩnh, không backend)
3. `pnpm test:unit && pnpm test:smoke`
4. Viết test cho một module: mở Claude Code trong thư mục này rồi gõ `/write-tests <module>`

## Bố cục

```
src/docs/       requirements/<module>.md (REQ-*), decisions/<module>.md, traceability-matrix.md (sinh tự động)
src/test-cases/ <module>.md (TC-*)
src/defects/    <module>.md (BUG-*, đang mở / đã sửa)
src/config/ utils/ data/ api/ components/ pages/ fixtures/    code test, phân lớp theo CLAUDE.md
src/tests/      e2e/<module>/*.e2e.ts · api/<module>/*.api.ts · setup/*.setup.ts · seed.spec.ts
```

## Viết một test

```ts
import { test, expect } from "@/fixtures";

test("email chưa đăng ký hiện thông báo", { tag: ["@TC-SIGNIN-007"] }, async ({ signInPage }) => {
  await signInPage.goto();
  await signInPage.submitEmail("nobody@example.com");
  await expect(signInPage.notification.withText(/does not exist/)).toBeVisible();
});
```

Mỗi test gắn mã test case nó chứng minh; `pnpm coverage:check` kiểm REQ ↔ TC ↔ spec ↔ bug.
