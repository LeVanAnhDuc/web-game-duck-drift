# Test đã gom về lúc scaffold

Bộ e2e Playwright cũ của app (`client/e2e/`, chạy bằng `client/playwright.config.ts` → `pnpm test:e2e`) được `git mv`
về đây khi dựng `automation-testing/`. Config cũ (năm project viewport 375/768/1024/1440 + Pixel 5, ba project
`auth-*`, hai webServer ở :4311/:4312) gộp vào `playwright.config.ts`: project `app` (Desktop Chrome), `app-touch`
(Pixel 5), `app-auth` (bản bật cờ Ducker ID, chỉ dev); bố cục theo khổ gom về module `responsive`, mỗi khổ một test.

| Từ | Về | Trạng thái |
|---|---|---|
| `client/e2e/game.spec.ts` | `src/tests/e2e/play/session.e2e.ts` | chưa chuẩn hóa |
| `client/e2e/visible-controls.spec.ts` | `src/tests/e2e/play/controls-hint.e2e.ts` | chưa chuẩn hóa |
| `client/e2e/modes.spec.ts` | `src/tests/e2e/difficulty/presets.e2e.ts` | chưa chuẩn hóa |
| `client/e2e/keyboard-and-gameover.spec.ts` | `src/tests/e2e/game-over/first-game.e2e.ts` | chưa chuẩn hóa |
| `client/e2e/layout.spec.ts` | `src/tests/e2e/responsive/layout.e2e.ts` | chưa chuẩn hóa |
| `client/e2e/ducker-id-flag-off.spec.ts` | `src/tests/e2e/ducker-id/flag-off.e2e.ts` | chưa chuẩn hóa |
| `client/e2e/ducker-id-sign-in.spec.ts` | `src/tests/e2e/ducker-id/sign-in.e2e.ts` | chưa chuẩn hóa |
| `client/playwright.config.ts` | `playwright.config.ts` | gộp |

Sửa tối thiểu lúc gom: `page.goto('/')` → `./` (baseURL giữ path của GitHub Pages), import `vi` trỏ lại
`../client/src/i18n/vi`, tên project trong `testInfo.project.name` đổi sang `app` / `app-touch`. Case chỉ chạy ở
project cảm ứng (`app-touch`) nằm ngoài `tests/e2e/touch/` nên tạm thời bị skip cho tới khi `/write-tests touch`
chuẩn hóa.

Unit + component test (vitest, `client/src/**/*.test.ts(x)`) ở lại `client/`: chúng thuộc về code.

## Còn trỏ về nơi cũ

- `docs/specs/*/plan.md`, `docs/specs/*/design.md`, `docs/decisions/00*.md` — tài liệu lịch sử (đã ship), giữ nguyên văn.
- `docs/04-state/backlog.md` — mục nợ kỹ thuật "`e2e/game.spec.ts` — helper `startGame`" và số liệu "122 test e2e"
  là ảnh chụp trạng thái lúc ghi; helper đó đã thay bằng `GamePage.start()` khi chuẩn hóa module `play`.
- `docs/03-design/architecture.md` — dòng "E2E: Playwright, 5 cấu hình, chạy trên `out/`" mô tả bộ cũ.
- `docs/ux-reviews/` — nhật ký phiên cũ.
