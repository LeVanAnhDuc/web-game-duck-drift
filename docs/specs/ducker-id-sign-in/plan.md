# Kế hoạch · `ducker-id-sign-in`

Bản rút gọn cho Duck Drift của plan chung `web-game/docs/superpowers/plans/2026-10-04-ducker-id-sign-in.md`. Thiết kế: [design.md](design.md).

- [x] **Task 0** Worktree `.worktrees/ducker-id-sign-in` từ `origin/main`, cài đặt, gate nền xanh (lint · typecheck · test · build).
- [x] **Task 1** Biến môi trường và base path: `next.config.ts` đọc `NEXT_PUBLIC_BASE_PATH`, `.env.example`, `deploy.yml` (không truyền cờ), `src/auth/config.ts` + test.
- [x] **Task 2** Lõi auth: PKCE, bắt callback (+ `settleCallbackUrl`), request token/userinfo (có timeout, kiểm hình dạng), store ngoài React, chặn bấm đúp, bfcache, dọn entry khi start lỗi.
- [x] **Task 3** UI: `AccountButton` ở `MenuScreen`, hooks, chuỗi `vi.account`, menu bàn phím, test component.
- [x] **Task 4** e2e: bản build cờ bật + issuer giả, spec vòng đăng nhập, spec cờ tắt.
- [x] **Task 5** Tài liệu: Non-Goal, ADR-0021, NFR-SEC-03, FR-23, US-09, README, spec này.
- [ ] **Task 6** Gate đầy đủ, push, mở PR (không merge).
