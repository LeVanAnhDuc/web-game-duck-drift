# DEPLOY — Test cases

Requirement: `docs/requirements/deploy.md` · quyết định: `docs/decisions/deploy.md`.
Lăng kính: 1 truy vết · 2 phân vùng · 3 biên · 4 chuyển trạng thái · 5 negative · 6 ngoài lề. Chạy được trên dev và prd.

### TC-DEPLOY-001 — mở trang và vào ván không có resource nào lỗi

- **Requirement:** REQ-DEPLOY-01
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 1
- **Bước:** mở `./` → "Chơi"
- **Mong đợi:** không `requestfailed`, không response ≥ 400
- **Automated:** `tests/e2e/deploy/static-export.e2e.ts`

### TC-DEPLOY-002 — mọi request của site nằm dưới base path

- **Requirement:** REQ-DEPLOY-02
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 6
- **Bước:** mở `./` → "Chơi"
- **Mong đợi:** mọi request cùng origin có đường dẫn bắt đầu bằng path của `baseURL`
- **Automated:** `tests/e2e/deploy/static-export.e2e.ts`
