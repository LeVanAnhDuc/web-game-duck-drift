# web-game-duck-drift-automation-testing

Bộ test E2E Playwright cho **Duck Drift**: test UI trên trình duyệt thật và test API qua HTTP, chạy với môi trường
dev (bản xuất tĩnh build tại chỗ) và prd (GitHub Pages). Repo này chỉ phục vụ một web: toàn bộ code và tài liệu test nằm trong `src/`.
Mỗi thư mục trong `src/` có `README.md` nói rõ chứa gì, không chứa gì và được import gì. Đọc README đó trước khi thêm file.

## Duck Drift: điều riêng của web này

- **Game tĩnh, không backend.** Không API, không tài khoản game, không dữ liệu phía server: `src/api/` và `tests/api/`
  để trống, fixture `account` không dùng. `DEV_API_URL` = `DEV_URL` chỉ để giữ hình dạng config.
- **dev = bản xuất tĩnh, không phải `next dev`.** `playwright.config.ts` có `webServer` build `../client` (hai lần:
  `node scripts/build-e2e.mjs off` ra `out/`, `… auth` ra `out-auth/` với cờ đăng nhập Ducker ID bật và issuer giả
  `http://ducker.test`) rồi phục vụ `out/` ở `http://127.0.0.1:4311` và `out-auth/` ở `:4312`. `CLIENT_PREBUILT=1`
  bỏ bước build khi chạy lại.
- **prd = GitHub Pages dưới `/web-game-duck-drift/`.** `baseURL` giữ path và kết thúc bằng `/`, nên page object đi tới
  `./` — **không bao giờ** `/…` (dấu `/` đầu bỏ mất path).
- **Game thời gian thực trên canvas.** Luật chơi (va chạm, điểm, power-up, UFO) thuộc unit test của app (`step()` gọi
  thẳng). Ở đây chỉ kiểm phần chỉ có nghĩa trong trình duyệt: màn hình, HUD, phím, nút cảm ứng, lưu trữ, bố cục. Cần
  ván chạy tới một trạng thái (vd hết lượt) thì dùng `page.clock` (install → `runFor`): vòng lặp đọc `performance.now`
  và `requestAnimationFrame`, cả hai đều giả được, nên một ván đứng yên ở mức Khó hết lượt sau ~25 giây giả, không
  tốn 25 giây thật. Không `waitForTimeout`.
- **Dữ liệu dựng sẵn** ghi thẳng vào khoá localStorage của chính game (`asteroids.highscores.*`, `asteroids.difficulty.v1`,
  `asteroids.tuning.v1`) qua `GamePage.seedStorage` trước khi trang chạy — định dạng lưu của app, không phải API riêng cho test.
- **Project:** `app` (Desktop Chrome), `app-touch` (Pixel 5, chỉ `tests/e2e/touch/`), `app-auth` (bản bật cờ, chỉ
  `tests/e2e/ducker-id/sign-in.e2e.ts`, chỉ có trên dev).

## Cấu trúc

```
web-game-duck-drift-automation-testing/
├── scripts/coverage-check.ts      REQ ↔ TC ↔ spec ↔ bug, sinh traceability matrix
├── playwright.config.ts           project app (test), provision (tạo dữ liệu), unit
└── src/
    ├── docs/
    │   ├── requirements/<module>.md   REQ-<MODULE>-NN — điều phải chứng minh
    │   ├── decisions/<module>.md      nguồn, quyết định chốt qua hỏi đáp, tài khoản, ngoài phạm vi
    │   ├── requirement-sources.md     nơi đọc requirement (docs + code của app), user đã xác nhận
    │   ├── migrated-tests.md          test có sẵn đã gom về src/ lúc scaffold: từ đâu về đâu, module nào chưa chuẩn hóa
    │   └── traceability-matrix.md     sinh tự động, không sửa tay
    ├── test-cases/<module>.md         TC-<MODULE>-NNN — kiểm thế nào
    ├── defects/<module>.md            BUG-<MODULE>-NN — app đang sai ở đâu, đang mở / đã sửa
    ├── config/                        môi trường: env, env-guard, urls, accounts (đọc .env)
    ├── utils/                         tiện ích không biết UI / ENV (mail.tm, otp, totp, rate-gate…), kèm *.test.ts
    ├── data/                          copy.ts (text UI / message server nguyên văn), test-data.ts
    ├── api/                           client REST, một file một resource, gộp theo namespace ở api/index.ts
    │                                  (api.auth.login, api.as(session).users.exists)
    ├── components/                    UI lặp lại giữa nhiều trang
    ├── pages/                         Page Object, kế thừa pages/base.page.ts
    ├── fixtures/                      *.fixture.ts gộp bằng mergeTests ở index.ts
    └── tests/
        ├── seed.spec.ts               seed cho agent planner/generator
        ├── setup/*.setup.ts           tạo dữ liệu một lần (pnpm provision)
        ├── e2e/<module>/<topic>.e2e.ts
        └── api/<module>/<topic>.api.ts
```

`<module>` là mã module viết thường (`sign-in`, `billing`…); mã trong ID là bản viết HOA bỏ gạch (`SIGNIN`).
Tên file spec là **chủ đề** (`password-step`, `rate-limit`), không phải tên ticket hay branch.

### Vì sao chia như vậy

Mỗi thư mục trả lời đúng một câu hỏi, nên khi có file mới chỉ cần hỏi "file này trả lời câu nào":

| Câu hỏi | Thư mục |
|---|---|
| Phải chứng minh điều gì? Vì sao? | `docs/requirements/`, `docs/decisions/` |
| Kiểm thế nào? | `test-cases/` |
| App đang sai ở đâu? | `defects/` |
| Chạy ở môi trường nào, URL nào, tài khoản nào? | `config/` |
| Tiện ích kỹ thuật dùng lại, không biết UI? | `utils/` |
| Dùng giá trị gì (text, dữ liệu)? | `data/` |
| Gọi backend thế nào? | `api/` |
| Phần tử nằm đâu, người dùng làm được gì? | `pages/`, `components/` |
| Test nhận sẵn những gì? | `fixtures/` |
| Kịch bản và kỳ vọng? | `tests/` |

Tài liệu (requirement → test case → bug) nằm cạnh code để một PR thêm test sửa cả hai cùng lúc, và `coverage:check`
nối chúng lại: requirement nào chưa có test, test nào không thuộc requirement nào, bug nào đã sửa mà test vẫn `test.fail()`.

## Quy tắc phân lớp

Phụ thuộc chỉ đi xuống: `tests → fixtures → pages / components / api → config / utils / data`.

- `tests/`: kịch bản + `expect`. Không viết locator thô cho phần đã có page object/component.
- `pages/`, `components/`: locator (method trả `Locator`, lazy) + hành động người dùng. **Không assertion nghiệp vụ.**
  Được chờ trạng thái sẵn sàng của chính nó (heading hiện trong `goto()`, `waitForURL` sau submit).
- `api/`: chỉ HTTP. Không import `pages/`, `components/`.
- `config/`, `utils/`, `data/`: không import `pages/`, `components/`, `api/`, `fixtures/`.
- Spec chỉ import `test`, `expect` từ `@/fixtures`. Type và `Page` lấy từ `@playwright/test`.
- Alias `@/*` = `src/*`. Trong cùng thư mục dùng đường dẫn tương đối (`./env`).

**Page object:** một class mỗi trang, `<Name>Page` trong `kebab-case.page.ts`, constructor nhận `Page`, có `goto()` nếu
trang có URL riêng (đường dẫn tương đối — project đặt `baseURL`). Dialog/modal riêng của trang là class con trong
cùng file. Page object mới thì thêm vào `fixtures/pages.fixture.ts`; tab thứ hai thì `new XxxPage(otherPage)`.

**Text:** assert text lấy từ `data/copy.ts` (UI) hoặc `serverMessage` (message BE theo error code), không viết chuỗi
trực tiếp trong spec. Chuỗi mới phải chép nguyên văn từ file locale FE / `messages.properties` BE và ghi nguồn.

## Tag

Gắn qua `{ tag: [...] }`, không viết trong tên test.

| Tag | Khi nào gắn |
|---|---|
| `@TC-<MODULE>-NNN` | mọi test chứng minh một test case (bắt buộc, `coverage:check` kiểm) |
| `@smoke` | mọi case P0 |
| `@email` | test dùng fixture `inbox` (đọc email qua mail.tm, chậm và phụ thuộc bên ngoài) |
| `@creates-data` | test tạo dữ liệu thật (user, workspace…). Bị chặn trên prd |
| `@e2e-full` | luồng xuyên module (vd sign-up → sign-in), chỉ chạy với `pnpm test:full` |

```ts
test("email chưa đăng ký hiện thông báo", { tag: ["@TC-SIGNIN-007", "@smoke"] }, async ({ signInPage }) => {
  // …
});
```

## Tư duy tester: 6 lăng kính (theo thứ tự)

1. **Truy vết requirement**: mỗi REQ trong `docs/requirements/<module>.md` có ít nhất 1 test case.
2. **Phân vùng tương đương**: chia input thành nhóm hành xử giống nhau, mỗi nhóm lấy 1 đại diện.
3. **Giá trị biên**: test đúng biên, ngay dưới và ngay trên biên.
4. **Chuyển trạng thái**: liệt kê trạng thái; thử nhảy cóc (vào thẳng URL bước sau) và quay lui.
5. **Đoán lỗi / negative**: khoảng trắng, viết HOA, double-click submit, back giữa chừng, resend liên tục, 2 tab.
6. **Bảo mật & ngoài lề**: message không lộ việc tài khoản tồn tại hay không, brute-force, token sau logout, không có lỗi console / 5xx.

**Chọn tầng:** API (`tests/api`) cho mọi tổ hợp input, biên, bảo mật, rate limit. UI (`tests/e2e`) cho luồng người dùng thật,
message, điều hướng, trạng thái nút. Mỗi luồng UI 1 case, không lặp tổ hợp đã phủ ở API.

**Ưu tiên:** P0 = hỏng là chặn người dùng hoặc rò dữ liệu (gắn `@smoke`). P1 = luồng phụ quan trọng. P2 = biên hiếm.

## Format

Mẫu đầy đủ trong README của từng thư mục: `src/docs/requirements/`, `src/docs/decisions/`, `src/test-cases/`, `src/defects/`.
`Automated` trong test case là đường dẫn tính từ `src/` (vd `tests/e2e/sign-in/email-step.e2e.ts`) hoặc `manual — <lý do>`.

`pnpm coverage:check` báo lỗi khi: REQ không có TC; TC trỏ REQ không tồn tại; file `Automated` không tồn tại hoặc
không có test gắn tag của TC; spec gắn `@TC-…` mà không TC nào định nghĩa; comment `// BUG:` trỏ bug không tồn tại,
trỏ bug đã sửa, hoặc không có `test.fail()` ngay dưới; bug đang mở mà không spec nào đánh dấu; bug trỏ TC không tồn tại.
Thêm/sửa TC xong chạy `pnpm coverage:check --write` để sinh lại matrix.

## Luật cứng

- Kỳ vọng bám `docs/requirements/<module>.md` + `docs/decisions/<module>.md`. App sai so với đó là **bug**: `test.fail()`
  kèm comment `// BUG: defects/<module>.md#bug-<module>-nn`, ghi bug vào `defects/<module>.md`. Không sửa kỳ vọng cho khớp bug.
- Selector ưu tiên `getByRole` / `getByLabel` / `getByText`, không dùng CSS class của thư viện UI. Selector nằm trong page object/component.
- Không `waitForTimeout`. Chờ bằng `expect(...).toBeVisible()` hoặc `waitForResponse`.
- Mỗi test độc lập: không phụ thuộc thứ tự, không dùng chung dữ liệu tạo ở test khác (trừ `@e2e-full`).
  Chạy riêng được: `pnpm exec playwright test -g "@TC-SIGNIN-007"`.
- Không ghi secret vào file nào ngoài `.env`.
- Mọi request API đi qua client trong `api/` (fixture `api`), không gọi `request` trần. Resource mới = file
  `<resource>.client.ts` + một namespace trong `api/index.ts` (cần đăng nhập thì nằm trong `as(session)`), xem `src/api/README.md`.

## Dùng trong flow phát triển feature

Repo app bật bộ test này bằng dòng `Regression tests: <đường dẫn tới thư mục này>/ (/write-tests)` trong `CLAUDE.md` của nó.
Flow làm feature có hook (vd `feature-flow` của skill `scaffold-webapp-project`) đọc dòng đó và chạy `/write-tests` hai lần:

1. **Pha A — ngay sau khi thiết kế được duyệt, trước khi code:** requirement, decision, test case. **Chỉ tài liệu** — chưa
   page object, locator hay spec vì chưa có giao diện, endpoint, response thật. User duyệt test case trước khi lên plan.
2. **Pha B — sau khi build và đã nhìn app chạy thật qua MCP:** planner quan sát qua Playwright MCP → page object + spec →
   **chạy test** → healer sửa script (không sửa kỳ vọng). Quan sát không thay được việc chạy test.
3. Bug của feature đang làm thì sửa code; `test.fail()` chỉ dành cho bug của tính năng đã ship.
4. Test e2e/API của app chỉ nằm ở đây; `pnpm test` xanh trước khi hoàn tất feature.

## Chạy

| Lệnh | Chạy gì |
|---|---|
| `pnpm test` | toàn bộ test trên ENV trong `.env` (mặc định dev), trừ `@e2e-full` |
| `pnpm test:smoke` | chỉ `@smoke` |
| `pnpm test:full` | tất cả, kể cả `@e2e-full` |
| `pnpm test src/tests/e2e/sign-in` | một module, một tầng |
| `pnpm test -g "@TC-SIGNIN-007"` | một test case |
| `pnpm test:unit` | unit test `config/`, `utils/` |
| `pnpm provision` | chạy `src/tests/setup/*.setup.ts` (tạo dữ liệu còn thiếu) |
| `pnpm coverage:check [--write]` | REQ ↔ TC ↔ spec ↔ bug; `--write` sinh lại `src/docs/traceability-matrix.md` |
| `pnpm typecheck` | TypeScript |
| `pnpm report` | mở HTML report |
