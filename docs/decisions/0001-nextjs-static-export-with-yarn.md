# ADR-0001 · Dùng Next.js 15 static export + React 19 + Tailwind + Vitest, quản lý gói bằng Yarn classic

> **Ngày:** 2026-09-04
> **Trạng thái:** accepted
> **Liên quan:** NFR-PERF-04 · NFR-SEC-03

## 1. Bối cảnh

Game này là một trang duy nhất, không backend, trần chi phí hạ tầng 0 đồng (`overview.md` §5), nên đích deploy là GitHub Pages. Thư mục `web-game/` đã có ba dự án cùng khuôn — `flappy-bird`, `gomoku`, `minesweeper` — đều Next.js 15 + React 19 + Tailwind 3 + Vitest, và `tetris` đi Vite + npm. Cần chọn một, và chọn sớm vì nó quyết định cấu trúc thư mục của mọi task sau đó.

## 2. Quyết định

Next.js 15 App Router với `output: 'export'`, React 19, TypeScript 5, Tailwind CSS 3, Vitest + happy-dom + Testing Library, quản lý gói bằng **Yarn classic 1.x**. Build ra `out/` là file tĩnh thuần. Font Space Grotesk và JetBrains Mono tải kèm build qua `next/font`, không lấy từ CDN lúc chạy (`NFR-SEC-03`).

> **Superseded 13.09.2026** — the workspace moved to pnpm 10; see the `build(deps)` commit that converted this repo.

## 3. Phương án đã loại

| Phương án                                | Vì sao loại                                                                                                                                                                    |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Vite + React (như `tetris`)              | Nhẹ hơn và hợp lý về kỹ thuật, nhưng lệch khỏi khuôn của ba dự án còn lại. Cái giá của việc trộn hai khuôn trong cùng một thư mục lớn hơn phần bundle tiết kiệm được           |
| HTML + TypeScript thuần, không framework | Bundle nhỏ nhất và đủ cho phần canvas, nhưng phần menu, bảng điểm và overlay là UI thật, và viết lại tay thứ React làm sẵn không đổi lấy được gì                               |
| npm thay Yarn                            | `CLAUDE.md` của workspace ghi rõ hai thế hệ dùng hai toolchain khác nhau; nhóm `web-game` theo khuôn Yarn classic. Trộn lockfile trong cùng nhóm là bẫy cho phiên làm việc sau |

## 4. Hệ quả

**Được:**

- Cùng lệnh `dev` / `build` / `test` / `typecheck` với ba dự án anh em, không phải nhớ riêng.
- `output: export` cho một artifact tĩnh, deploy GitHub Pages không cần cấu hình runtime.
- Tailwind áp trực tiếp token trong `MASTER.md`.

**Mất / phải chấp nhận:**

- Next.js là framework nặng cho một trang không có routing thật; phần lớn tính năng của nó không dùng tới.
- Phải tự canh `NFR-PERF-04` (≤ 200KB gzip) vì Next mang theo runtime của nó.
- `output: export` loại bỏ mọi tính năng cần server, nên sau này muốn thêm bảng xếp hạng online thì phải dựng dịch vụ riêng chứ không thêm route được.

**Điều kiện xem lại quyết định này:** nếu bundle vượt 200KB gzip mà không cắt được, hoặc nếu nhóm `web-game` chuyển đồng loạt sang Vite.
