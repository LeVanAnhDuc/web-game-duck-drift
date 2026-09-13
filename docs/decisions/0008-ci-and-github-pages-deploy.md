# ADR-0008 · CI hai job song song, deploy GitHub Pages tự động, và e2e Playwright ở năm cấu hình

> **Ngày:** 2026-09-07
> **Trạng thái:** accepted
> **Liên quan:** FR-17 · NFR-PERF-04 · NFR-SEC-02 · NFR-A11Y-03 · ADR-0001

## 1. Bối cảnh

Bản đầu của game đã xong nhưng chưa có gì tự động: không ai kiểm lint/test trên PR, không có đường lên production, và ba khổ màn hình 375 / 768 / 1024 **chưa từng được nhìn thấy chạy thật** — trong tab automation của phiên làm việc, lệnh đổi kích thước cửa sổ không đổi được viewport và `requestAnimationFrame` bị throttle. Đó là mục nợ đầu tiên trong `backlog.md`.

Ba dự án cùng thư mục `web-game/` (`minesweeper`, `gomoku`, `tetris`) đã có sẵn khuôn cho việc này. `minesweeper` là bản gần nhất về stack: Next.js static export + Yarn + Vitest + Playwright.

## 2. Quyết định

Ba workflow, theo đúng khuôn của `minesweeper`:

- `ci.yml` — hai job **song song**: (1) lint, typecheck, unit test, `yarn audit` qua `scripts/check-audit.mjs`; (2) build, ngân sách JS lần tải đầu qua `scripts/check-bundle-size.mjs`, rồi e2e.
- `deploy.yml` — push vào `main` thì build với `GITHUB_PAGES=true` và publish `out/`. Nó **chạy lại test** thay vì tin vào `ci.yml`.
- `release.yml` — xem ADR-0009.

Playwright chạy trên **bản export tĩnh** qua `scripts/serve.mjs`, ở **năm cấu hình**: 375 / 768 / 1024 / 1440 và một Pixel 5 cảm ứng thật. Hai ngưỡng vốn chỉ nằm trên giấy giờ do script gate: `NFR-PERF-04` (bundle) và `NFR-SEC-02` (audit).

`next.config.ts` bật lại `basePath`/`assetPrefix` theo `GITHUB_PAGES`, và `trailingSlash: true` vì Pages phục vụ `/foo/` chứ không phải `/foo`.

## 3. Phương án đã loại

| Phương án                                           | Vì sao loại                                                                                                                                                                                                                                                                                                                 |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Một job CI duy nhất làm tất cả                      | Đơn giản hơn, nhưng "lint hỏng" và "game hỏng" là hai tin khác nhau; gộp lại thì tin thứ hai phải chờ tin thứ nhất, và một lỗi format chặn luôn kết quả e2e                                                                                                                                                                 |
| Deploy tin vào `ci.yml` đã xanh                     | Tiết kiệm vài phút, nhưng hai workflow độc lập: một deploy giả định có lần chạy xanh mà nó không nhìn thấy là deploy sớm muộn sẽ đẩy bản đỏ lên                                                                                                                                                                             |
| E2E trên `next dev`                                 | Nhanh hơn, nhưng dev server không phải thứ GitHub Pages phục vụ. Đúng những thứ chỉ sai ở bản export — `basePath`, `trailingSlash`, đường dẫn asset — sẽ không bị bắt                                                                                                                                                       |
| `yarn audit` trực tiếp trong workflow               | Yarn 1 trả về bitmask gộp mọi mức severity, nên một advisory mức moderate cũng làm đỏ build. Chặt hơn ngưỡng đã thoả thuận, và một gate không ai đồng ý là gate người ta bắt đầu tìm cách vượt                                                                                                                              |
| `yarn audit` qua script, **dùng làm gate trong CI** | Đã ship rồi mới phát hiện là sai: endpoint audit của yarn 1 trả về summary rỗng (`dependencies: 515`, `devDependencies: 0` trên dự án khai 20 devDependency) kèm exit 0, nên gate xanh vĩnh viễn. Thay bằng `dependency-review` + Dependabot; script giữ lại cho việc chạy ở máy và giờ báo đỏ khi audit không thật sự chạy |
| Đọc số bundle từ bảng `next build` in ra            | Dễ hơn, nhưng vỡ mỗi lần Next đổi định dạng bảng. Đo từ `out/index.html` thì chỉ vỡ khi bundle thật sự phình                                                                                                                                                                                                                |
| Chỉ chạy e2e ở một khổ                              | Rẻ hơn, nhưng khổ hẹp mới là chỗ bố cục vỡ, và đó chính là khoảng trống mà ADR này tồn tại để đóng                                                                                                                                                                                                                          |

## 4. Hệ quả

**Được:**

- Ba khổ hẹp và một màn hình cảm ứng thật được kiểm ở **mỗi** PR, thay vì chờ ai đó nhớ mở tay.
- `NFR-PERF-04` và `NFR-SEC-02` từ chỗ là câu chữ trong tài liệu thành gate chạy được. Số đo hiện tại: 114.1 kB / 200 kB.
- Mọi push vào `main` tự lên `https://levananhduc.github.io/web-game-duck-drift/`.
- Script chạy được ở máy (`pnpm check:bundle`, `pnpm check:audit`), nên gate nào đỏ cũng tái hiện được mà không cần đẩy lên CI.

**Mất / phải chấp nhận:**

- CI chậm hơn: cài Chromium mỗi lần chạy job e2e.
- Thêm `@playwright/test` và năm script vào repo. Chi phí bảo trì có thật.
- E2E **không** assert vào điểm số hay vị trí vật thể: đó là mô phỏng thời gian thực trên máy CI chia sẻ, và test phụ thuộc vào nó sẽ đỏ vì máy bận chứ không vì game sai. Luật chơi vẫn thuộc phần test đơn vị gọi thẳng `step()`.
- **Bật Pages là một bước một-lần nằm ngoài workflow.** Đã thử `enablement: true` của `actions/configure-pages` và nó đỏ: `GITHUB_TOKEN` có `pages: write` nên **deploy** được, nhưng **tạo** Pages site cần quyền admin repo mà token của workflow không có (`Resource not accessible by integration`). Repo này đã bật ngày 07.09.2026 bằng `gh api -X POST repos/.../pages -f build_type=workflow`; một fork sẽ phải tự làm lại. Cách duy nhất để tự động hoá là cấp cho workflow một PAT có quyền admin — đắt hơn nhiều so với một lần bấm.

**Điều kiện xem lại quyết định này:** nếu thời gian CI thành nút cổ chai, bước đầu tiên là cache Chromium chứ không phải bỏ e2e.
