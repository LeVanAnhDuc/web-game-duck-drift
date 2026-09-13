---
name: ux-persona-review
description: Use when you want to know how a real stranger experiences Duck Drift — dispatches blind persona subagents that actually drive the running app in a browser, then returns UX findings mapped to ISO 9241-11, LATCH, trigger words, interaction design, visual hierarchy and form design, every finding backed by a quote from a session log. Trigger on "chay persona", "test UX", "nguoi dung that thay sao", "UX review", "red route", or before opening a PR that changes user-facing behaviour.
---

# Duck Drift — UX persona review

## Sản phẩm này

- Thư mục: `D:/Learn/web-app-ecosystem/web-game/web-game-asteroids`
- Port: **`:4173`** — bản export tĩnh, đúng thứ GitHub Pages phục vụ. `:3000` là `pnpm dev`,
  **đừng dùng cho persona**: nó đụng client của Ducker ID, cũng Next.js, cũng `:3000`.
- Bật app: `pnpm build && node scripts/serve.mjs 4173 out`
- Dấu hiệu nhận biết đúng app: tab tên đúng `Duck Drift`; màn đầu là nền tối gần đen với
  chữ `DUCK DRIFT` và bốn nút `Chơi` · `Bảng điểm` · `Cách chơi` · `Tuỳ chỉnh`, phía trên
  nút `Chơi` là dãy `Dễ · Thường · Khó`. Thấy form đăng nhập hay chữ "Ducker" → **sai app,
  dừng lại**.
- Email dùng-một-lần cho persona: **không áp dụng** — game không có tài khoản, không có
  backend, không có ô email nào (ADR-0001). Persona nào định "đăng ký" là đang lạc.
- Tài khoản thử: **không có**. Không Red Route nào cần đăng nhập.
- Ngôn ngữ UI: **tiếng Việt toàn bộ** (`src/i18n/vi.ts`, NFR-I18N-01). Persona phải là
  người đọc tiếng Việt.

## Bật app — được phép tự bật, khác với mặc định

`lib/orchestration.md` cấm tự bật app. Ở project này **ghi đè điều đó**: app là một bản
export tĩnh, không backend, không database, không dữ liệu dùng chung; `:4173` là port riêng
của chính project này (`playwright.config.ts`). Bật nó không phá được gì và không đụng
project khác. Cứ tự chạy hai lệnh trên rồi kiểm dấu hiệu nhận biết.

Điều **không** được bỏ qua là bước đối chiếu dấu hiệu nhận biết. Đó mới là thứ bảo vệ bạn.

## Trần của phương pháp trên project này — đọc trước khi diễn giải kết quả

Đây là game hành động 60Hz. Một subagent điều khiển qua MCP mất hàng giây cho mỗi thao tác,
nên **nó không chơi được phần gameplay** — không né được thiên thạch, không bắn trúng gì.
Cái đo được là **vỏ ngoài**: menu, chọn độ khó, màn Tuỳ chỉnh, Cách chơi, Bảng điểm, Tạm
dừng, Hết lượt. Chính vì vậy `references/red-routes.md` chỉ chốt Red Route ở lớp vỏ đó.

Hệ quả bắt buộc ghi vào báo cáo: **"persona chết nhanh" không phải phát hiện UX.** Nó là
giới hạn của công cụ. Phát hiện chỉ được rút ra từ chỗ persona *không hiểu phải làm gì*,
không phải từ chỗ persona *không kịp bấm*.

## Chạy

Toàn bộ quy trình nằm ở `lib/orchestration.md`. Đọc nó trước, rồi làm theo.

Dữ liệu riêng của sản phẩm này:

| Cần gì | Ở đâu |
| --- | --- |
| Red Route đã chốt | `references/red-routes.md` |
| Dàn persona | `references/personas/` |
| Rule đã dùng để sinh persona | `references/persona-rules.md` |
| Khung đánh giá, luật xếp hạng | `lib/frameworks.md` |
| Thứ tự công cụ trình duyệt | `lib/browser-capability.md` |

Báo cáo của project này đi vào `docs/ux-reviews/YYYY-MM-DD-<scope>.md` khi không ở nhánh
feature. Thư mục đó **không** thuộc hai tầng tài liệu trong `.claude/CLAUDE.md` — nó là
kết quả đo, không phải tài liệu thường trực, nên không có header 4 dòng và không vào bảng
trạng thái ở `docs/README.md`.

## Hai agent

`ux-persona` (Sonnet, chỉ có trình duyệt) đóng vai người dùng.
`ux-expert` (Opus, chỉ có Read) dịch log sang khung đánh giá.

Cả hai định nghĩa ở `D:/Learn/web-app-ecosystem/web-game/web-game-asteroids/.claude/agents/`.
Nếu Claude Code báo không tìm thấy agent type, phiên hiện tại được mở trước khi hai file đó
tồn tại — khởi động lại phiên.

⚠️ **Tên tool MCP ở máy này có tiền tố của plugin**, không phải `mcp__playwright__*` như
template của máy phát giả định. Đúng phải là `mcp__plugin_playwright_playwright__*` và
`mcp__plugin_chrome-devtools-mcp_chrome-devtools__*`. Hai file agent đã được sửa tay theo
đúng tên thật. **`--update` sẽ render lại agent và xoá bản sửa đó** — chạy `--update` xong
phải sửa lại dòng `tools:`, nếu không mọi phiên persona sẽ chạy mà không có trình duyệt.

## Bảo trì

Nâng cấp phần logic: `bash D:/Learn/web-app-ecosystem/.claude/skills/ux-persona-lab/scripts/install.sh D:/Learn/web-app-ecosystem/web-game/web-game-asteroids --update`
Lấy lại rule persona mới: cùng lệnh với `--refresh-rules`.
Cả hai đều **không** đụng tới `red-routes.md` và `personas/`.

Cả thư mục `.claude/` của project này **bị `.gitignore` chặn** (`/.claude/`, dòng 1) và
không phải git repo riêng. Skill này vì vậy **chỉ tồn tại trên máy** — không commit được ở
đâu cả. `install.sh` in `repo-target: app`, và ở đây dòng đó **sai**. Thứ commit được chỉ
là báo cáo dưới `docs/`.
