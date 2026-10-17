# Test đã gom về lúc scaffold

Bộ e2e Playwright cũ của app (`client/e2e/`, chạy bằng `client/playwright.config.ts` → `pnpm test:e2e`) được `git mv`
về đây khi dựng `automation-testing/`. Config cũ (năm project viewport 375/768/1024/1440 + Pixel 5, ba project
`auth-*`, hai webServer ở :4311/:4312) gộp vào `playwright.config.ts`: project `app` (Desktop Chrome), `app-touch`
(Pixel 5), `app-auth` (bản bật cờ Ducker ID, chỉ dev); bố cục theo khổ gom về module `responsive`, mỗi khổ một vòng.

| Từ | Về | Trạng thái |
|---|---|---|
| `client/e2e/game.spec.ts` | `src/tests/e2e/play/session.e2e.ts` (git mv); tạm dừng → `pause/pause.e2e.ts`, nút cảm ứng → `touch/controls.e2e.ts` + `responsive/layout.e2e.ts` (nửa chuột), vùng aria-live → `accessibility/screen-reader.e2e.ts` | đã chuẩn hóa |
| `client/e2e/visible-controls.spec.ts` | `src/tests/e2e/play/controls-hint.e2e.ts` (git mv); case cảm ứng → `touch/controls.e2e.ts` | đã chuẩn hóa |
| `client/e2e/modes.spec.ts` | `src/tests/e2e/difficulty/presets.e2e.ts` (git mv); ba tab → `high-scores/table.e2e.ts`, bốn thanh trượt 44px → `responsive/layout.e2e.ts`, vào ván từ Tuỳ chỉnh → `custom/tuning.e2e.ts` | đã chuẩn hóa |
| `client/e2e/keyboard-and-gameover.spec.ts` | `src/tests/e2e/game-over/result.e2e.ts` (git mv) + `game-over/initials.e2e.ts`; Space bấm nút → `accessibility/keyboard.e2e.ts`, thanh trượt bằng phím → `custom/tuning.e2e.ts`, Space ở pha chơi → `play/session.e2e.ts` | đã chuẩn hóa |
| `client/e2e/layout.spec.ts` | `src/tests/e2e/responsive/layout.e2e.ts` (git mv); màn hình chính + Cách chơi → `menu/home.e2e.ts`, `menu/help.e2e.ts`; nhãn canvas → `accessibility/screen-reader.e2e.ts` | đã chuẩn hóa |
| `client/e2e/ducker-id-flag-off.spec.ts` | `src/tests/e2e/ducker-id/flag-off.e2e.ts` | đã chuẩn hóa |
| `client/e2e/ducker-id-sign-in.spec.ts` | `src/tests/e2e/ducker-id/sign-in.e2e.ts`; issuer giả → `src/fixtures/issuer.fixture.ts` | đã chuẩn hóa |
| `client/playwright.config.ts` | `playwright.config.ts` | gộp |

Case cũ bị bỏ khi chuẩn hóa: không có. Hai case đổi cách kiểm: "cột menu giữ đúng class" (chuỗi class Tailwind) nay kiểm
bằng style tính toán (TC-DUCKERID-002); "nút cảm ứng không làm trang cuộn" dùng `pointerdown` giả — nút gọi
`setPointerCapture` nên sự kiện giả không bao giờ vào nhánh "đang giữ", nay giữ bằng ngón thật qua CDP (TC-TOUCH-004).
Các case chờ thời gian thật (hết lượt ~22 giây, chờ điểm 30 giây) nay chạy trên `page.clock`.

Unit + component test (vitest, `client/src/**/*.test.ts(x)`) ở lại `client/`: chúng thuộc về code.

## Còn trỏ về nơi cũ

- `docs/specs/*/plan.md`, `docs/specs/*/design.md`, `docs/decisions/00*.md` — tài liệu lịch sử (đã ship), giữ nguyên văn.
- `docs/04-state/backlog.md` — mục nợ kỹ thuật "`e2e/game.spec.ts` — helper `startGame`" và số liệu "122 test e2e"
  là ảnh chụp trạng thái lúc ghi; helper đó đã thay bằng `GamePage.waitHydrated()` + `start()` khi chuẩn hóa `play`.
- `docs/ux-reviews/` — nhật ký phiên cũ.
- `.claude/CLAUDE.md` (sơ đồ tài liệu vẽ `.env.example` ở gốc; nay là `client/.env.example`) — file đang có thay đổi
  chưa commit ở checkout chính nên PR này không đụng tới; `CLAUDE.md` gốc ghi chú chỗ lệch.
