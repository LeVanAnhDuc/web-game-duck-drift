# DEPLOY — Quyết định

Đi cặp với `docs/requirements/deploy.md`.

## Nguồn

Đọc ngày 2026-10-17 (đường dẫn tính từ gốc repo app).

- **Tài liệu:** `docs/decisions/0001-nextjs-static-export-with-yarn.md`, `docs/decisions/0008-ci-and-github-pages-deploy.md`
  (basePath, `trailingSlash`), `docs/decisions/0021-ducker-id-sign-in.md` (`NEXT_PUBLIC_BASE_PATH` thay `GITHUB_PAGES`),
  `README.md` §What runs on GitHub, `client/.env.example` (`NEXT_PUBLIC_BASE_PATH`).
- **Code:** `client/next.config.ts` (`output: 'export'`, `basePath`, `assetPrefix`, `trailingSlash`),
  `.github/workflows/deploy.yml` (`NEXT_PUBLIC_BASE_PATH: /${{ github.event.repository.name }}`).

## Quyết định chốt (Chốt bởi agent — user uỷ quyền)

- **Q1** Hai case này chạy nguyên văn trên cả dev (gốc, `http://127.0.0.1:4311/`) lẫn prd
  (`https://levananhduc.github.io/web-game-duck-drift/`): base path lấy từ `baseURL` của project, không viết cứng.
- **Q2** "Vào một ván" thay vì chỉ tải trang: chunk JS / font của HUD chỉ được tải khi màn chơi hiện, nên một resource
  hỏng ở đó không lộ ra ở menu.
- **Q3** Trên prd, chỉ đọc: hai case không ghi gì ngoài localStorage của trình duyệt test, không có `@creates-data`.

## Tài khoản test

Không có.

## Ngoài phạm vi

- Ngân sách JS lần tải đầu (NFR-PERF-04): `pnpm check:bundle` trong CI của `client/`.
- Bật Pages lần đầu cho repo (`gh api … pages`): việc một lần ngoài workflow (ADR-0008).

## Tech debt liên quan

_(không có)_
