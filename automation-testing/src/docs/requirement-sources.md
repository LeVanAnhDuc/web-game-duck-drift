# Nguồn requirement của Duck Drift

**Requirement của module lấy ở đâu.** `/write-tests` đọc file này ở bước 1 và chỉ đọc các nơi liệt kê dưới đây, cộng với
những gì user nói trong chat. Không dùng Jira/Confluence.

Đường dẫn tính từ thư mục gốc repo test. Danh sách này được user xác nhận lúc scaffold; khi user chỉ thêm nơi khác, hoặc
một nơi bị bỏ/đóng băng, sửa bảng này trong cùng lượt.

## Tài liệu

- `../docs/README.md` — bản đồ tài liệu + quy ước ID (US / FR / NFR / ADR); đọc trước để biết file nào là nguồn đúng
- `../docs/01-product/overview.md` — định vị, Non-Goals (không server, không tài khoản game, không bảng xếp hạng online)
- `../docs/01-product/journeys.md` — luồng người dùng US-01…US-09, kèm "Điều gì có thể sai" (nguồn chính cho case negative)
- `../docs/01-product/glossary.md` — tên khái niệm ↔ tên trong code ↔ tên trên UI
- `../docs/02-requirements/scope.md` — danh mục chức năng FR-01…FR-23 và trạng thái
- `../docs/02-requirements/nfr.md` — ngưỡng NFR-PERF / ROB / SEC / A11Y / I18N áp cho mọi feature
- `../docs/03-design/invariants.md` — điều kiện sai âm thầm (lõi thuần, fixed timestep, storage, hạng chốt trước khi ghi)
- `../docs/03-design/architecture.md` — các màn (phase), ranh giới React ↔ lõi game, nơi lưu điểm
- `../docs/decisions/` — ADR-0001…0021: vì sao hành vi như vậy (vd ADR-0011 một khoá điểm mỗi mức, ADR-0015 phím theo pha, ADR-0019 hậu quả nói trước cú bấm)
- `../docs/specs/<feature>/design.md` — thiết kế đã duyệt của từng feature (asteroids-core, game-modes, visible-controls, keyboard-and-gameover-fixes, no-silent-score-loss, expectations-and-contrast, ducker-id-sign-in)
- `../docs/design-system/asteroids/MASTER.md` — ngưỡng hiển thị (vùng bấm 44px, tương phản, chuyển động)
- `../README.md` — mục Features + Controls: hợp đồng hành vi hướng tới người chơi

## Code

- `../client/src/i18n/vi.ts` — mọi chuỗi UI (tiếng Việt), nguồn của `src/data/copy.ts`
- `../client/src/views/Home/` — màn hình duy nhất: menu, Tuỳ chỉnh, Cách chơi, Bảng điểm, HUD, Tạm dừng, Hết lượt, nút cảm ứng, nút tài khoản
- `../client/src/hooks/` — cầu nối React ↔ lõi game (`useGame`: tự tạm dừng khi ẩn tab), đăng nhập, menu tài khoản
- `../client/src/storage/` — khoá localStorage của bảng điểm (một khoá mỗi mức) và cài đặt (mức, bốn núm), validate dữ liệu
- `../client/src/input/` — bàn phím (phím theo pha) và cảm ứng (`pointer: coarse`)
- `../client/src/game/core/constants.ts` — bốn núm của ba mức sẵn và biên của thanh trượt; số cân bằng (điểm, thời gian
  hồi, hiệu lực vật phẩm, kích thước wave) mà các module `scoring`, `hyperspace`, `power-ups`, `world` đo
- `../client/src/game/core/` (`step.ts`, `collision.ts`, `asteroids.ts`, `ship.ts`, `bullets.ts`, `powerups.ts`,
  `score.ts`, `spawn.ts`, `vector.ts`) — luật chơi mà bốn module đó kiểm qua bản build thật
- `../client/src/auth/` — đăng nhập Ducker ID (OIDC + PKCE) sau cờ tính năng
- `../client/scripts/build-e2e.mjs`, `../client/scripts/serve.mjs` — hai bản build (cờ tắt / bật với issuer giả) và server tĩnh mà suite này dùng

## Không đọc như nguồn đúng

- `../docs/specs/*/plan.md` — danh sách task lúc build, không phải hành vi
- `../docs/04-state/backlog.md` — việc đang làm / nợ kỹ thuật, không phải hành vi đã ship
- `../docs/code-conventions.md` — quy ước viết code dùng chung, không nói về hành vi
- `../docs/ux-reviews/` — nhật ký phiên persona (phát hiện UX lịch sử, đã xử lý ở các feature fix)
- `../client/src/**/*.test.ts(x)` — unit/component test của app: gợi ý hành vi, không phải requirement

## Thứ tự thẩm quyền

User (chat) > tài liệu trên > code. Code cho biết app *đang* làm gì, không cho biết *nên* làm gì.
