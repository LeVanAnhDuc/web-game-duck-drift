# Kế hoạch triển khai · `keyboard-and-gameover-fixes`

> **Cho người thực thi:** mọi bước ở dạng checkbox — tick khi xong, vì đó là thứ duy nhất nói được "đang ở task 5 trên 9" sau khi context bị nén.

**Mục tiêu:** Sửa ba lỗi làm màn Hết lượt báo sai và làm bàn phím chiếm phím của cả trang. Đóng F-01 (Critical) · F-06 · F-09 của `docs/ux-reviews/2026-09-11-lop-vo-7-red-route.md`, cộng một vi phạm NFR-A11Y-02 và một vi phạm NFR-A11Y-06 mà báo cáo không có.

**Cách làm:** Ba sửa chữa độc lập, làm từ trong ra ngoài — lõi trước (announce cuối step), rồi tầng input (guard theo pha), rồi tầng React (ref → state). Không thêm UI, nên không có mockup.

**Tech stack:** TypeScript 5 · React 19 · Next.js 15 (static export) · Vitest + happy-dom + Testing Library · Playwright · Yarn classic.

**Spec:** [`design.md`](design.md) — đọc cùng file này. §0 của nó sửa lại hai chỗ báo cáo UX nói sai; đừng lập luận từ báo cáo mà bỏ qua §0.

## Ràng buộc toàn cục

- **Bất biến #1:** `src/game/core/**` không gọi `Math.random`, `Date.now`, `performance.now`, `window`, `document`. ESLint chặn — đừng tắt rule. Guard theo pha đặt ở `src/input/`, **không** ở `core/`.
- **Bất biến #3:** hằng số thời gian theo đơn vị/giây rồi nhân `dt`.
- **Bất biến #7:** chỉ `step()` và các hàm chuyển pha có tên trong `core/state.ts` được sửa `GameState`.
- **Bất biến #8 · NFR-PERF-03:** React không giữ `GameState`; chỉ nhận snapshot HUD, chỉ re-render khi giá trị đổi. Một render thêm **mỗi lần hết lượt** là được; mỗi frame thì không.
- **NFR-ROB-04:** cùng seed + cùng chuỗi input ⇒ cùng trạng thái sau N bước. Task 2 đụng thứ tự trong `step()` nên phải chạy lại test tái lập.
- **NFR-A11Y-02:** mọi hành động ngoài canvas thao tác được bằng bàn phím — đây là ngưỡng mà task 3 tồn tại để khôi phục.
- **NFR-A11Y-06:** đổi mạng, đổi wave, hết lượt công bố qua `aria-live`.
- **NFR-I18N-01:** không hardcode chuỗi hiển thị; mọi chuỗi ở `src/i18n/vi.ts`. Task 2 **không** đổi chuỗi nào, chỉ đổi thời điểm phát.
- Conventional Commits, subject tiếng Anh. **Không commit vào `main`** — branch từ `origin/main` mới nhất.
- Lệnh: `pnpm test` · `pnpm typecheck` · `pnpm lint` · `pnpm build` · `pnpm test:e2e` · `pnpm format` · `pnpm check:bundle`.

---

## File sẽ đụng

| File                                                   | Đổi gì                                                                          |
| ------------------------------------------------------ | ------------------------------------------------------------------------------- |
| `docs/decisions/0015-*.md` · `0016-*.md` · `0017-*.md` | ba ADR mới (0012, 0013 không có trong index — không tái dùng, lấy tiếp từ 0015) |
| `src/game/core/ship.ts`                                | `killShip` thôi phát câu hết lượt, chỉ đặt pha                                  |
| `src/game/core/step.ts`                                | phát câu hết lượt ở cuối step khi pha vừa chuyển sang `gameover`                |
| `src/input/keyboard.ts`                                | nhận `getPhase`, sở hữu phím theo pha; hàm dọn `input`                          |
| `src/hooks/useGame.ts`                                 | truyền `getPhase`; dọn `input` khi rời pha `playing`                            |
| `src/views/Home/index.tsx`                             | `rankRef` → `useState`                                                          |
| `src/views/Home/ghosts/FreezeRankAtGameOver/index.tsx` | `useEffect` → `useLayoutEffect`, cập nhật doc comment                           |
| `docs/04-state/backlog.md`                             | §Đang làm lúc bắt đầu, §Nợ kỹ thuật nếu có shortcut                             |
| `e2e/`                                                 | ba đường e2e ở §Cách biết là đã sửa của `design.md`                             |

---

## Task

### 1. Mở việc

- [x] Ghi `docs/04-state/backlog.md` §Đang làm: đang ở pass 1/4 của feedback UX, branch nào, task nào.
- [x] `superpowers:using-git-worktrees` — worktree mới từ `origin/main` mới nhất, branch `fix/keyboard-and-gameover`.

### 2. Lỗi C · câu thông báo hết lượt phát ở cuối step

- [x] Test đỏ trước: một step vừa giết tàu (mạng cuối) vừa cộng điểm ⇒ `state.announce` chứa **điểm cuối step**, không phải điểm giữa step. Dựng bằng seed cố định + trạng thái đặt tay, không dựa vào ngẫu nhiên.
- [x] Test đỏ: mất một mạng (chưa hết) vẫn phát `ANNOUNCE.lifeLost` với số mạng đúng — chống hồi quy, vì task này đụng chỗ phát.
- [x] `core/ship.ts`: `killShip` bỏ dòng `state.announce = ANNOUNCE.gameOver(...)`, chỉ đặt `state.phase = 'gameover'`.
- [x] `core/step.ts`: cuối step, nếu pha vừa chuyển sang `gameover` trong step này thì phát `ANNOUNCE.gameOver(state.score)`. Không ghi đè câu `lifeLost`/`wave` đã có nếu pha không chuyển.
- [x] Chạy lại **NFR-ROB-04** (test tái lập 1000 bước) và test benchmark `step()` (**NFR-PERF-02**, < 4ms).
- [x] `pnpm test` xanh.

### 3. Lỗi B · bàn phím sở hữu phím theo pha

- [x] Test đỏ trước, cho `attachKeyboard`: với `getPhase` trả `'menu'` · `'custom'` · `'help'` · `'highscores'` · `'gameover'`, một `keydown` mũi tên và `Space` ⇒ `defaultPrevented === false` và `input` không đổi.
- [x] Test đỏ: `getPhase` trả `'playing'` ⇒ mũi tên và `Space` vẫn `defaultPrevented === true` và vẫn đổi `input` (chống hồi quy gameplay).
- [x] Test đỏ: `getPhase` trả `'paused'` ⇒ `Esc`/`P` vẫn gọi `onPause`, còn mũi tên và `Space` ⇒ `defaultPrevented === false`.
- [x] Test đỏ: đang giữ phím đẩy rồi pha rời `'playing'` ⇒ `input` được dọn (không dính trạng thái đang đẩy sang ván sau).
- [x] `input/keyboard.ts`: thêm `getPhase: () => Phase | null` vào `KeyboardOptions`; áp đúng bảng ở ADR-0015. Export hàm dọn hoặc gọi `resetInput` khi rời pha.
- [x] `hooks/useGame.ts`: truyền `getPhase: () => stateRef.current?.phase ?? null`. Thêm effect dọn `input` khi pha rời `'playing'`. Giữ dependency ổn định — đừng làm effect gắn lại mỗi render.
- [x] `pnpm test` xanh.

### 4. Lỗi A · hạng lúc hết lượt nằm trong state

- [x] Test đỏ trước, ở `views/Home`: mount, bảng trống, chơi tới hết lượt với điểm dương ⇒ overlay hiện `#1` **và** form nhập tên, ngay ở ván **đầu tiên**.
- [x] Test đỏ: ván hai điểm thấp hơn ván một ⇒ hạng tính theo bảng **lúc đó**, không phải hạng ván trước.
- [x] Test đỏ: ván tuỳ chỉnh (`difficulty === 'custom'`) ⇒ vẫn không có hạng, không có form (giữ nguyên hành vi đúng hiện tại).
- [x] `views/Home/index.tsx`: `rankRef` → `useState<number | null>(null)`; `freezeRank` thành setter ổn định.
- [x] `ghosts/FreezeRankAtGameOver/index.tsx`: `useEffect` → `useLayoutEffect`; sửa doc comment cho khớp (comment hiện tại nói về `JSON.parse` mỗi render — vẫn đúng, giữ).
- [x] Kiểm không sinh render mỗi frame: chạy test đếm render của **NFR-PERF-03**.
- [x] `pnpm test` xanh.

### 5. E2E

- [x] Tab tới một nút rồi bấm `Space` ⇒ nút chạy (NFR-A11Y-02).
- [x] Tab tới thanh trượt rồi bấm mũi tên ⇒ giá trị đổi.
- [x] Ở màn Tuỳ chỉnh, đẩy `UFO từ wave` tới max **bằng bàn phím** ⇒ nhãn hiện `tắt` (đóng phần thật của F-06).
- [x] Ván đầu tiên sau khi tải trang, chọn Khó, ngồi yên tới hết lượt ⇒ panel hiện hạng `#1` và có form nhập tên; chuỗi trong vùng `aria-live` và số trên panel **khớp nhau** (đóng F-01 + lỗi C).
- [x] Trong lúc chơi, mũi tên và `Space` vẫn điều khiển tàu và **không** cuộn trang.
- [x] `pnpm test:e2e` xanh.

### 6. Ba ADR

- [x] `0015-game-keys-are-owned-per-phase.md` — theo ADR-0015 ở `design.md` §2. Mục 3 phải ghi phương án "guard theo tiêu điểm" và vì sao loại.
- [x] `0016-gameover-rank-lives-in-react-state.md` — mục 4 ghi cái mất: thêm một render mỗi lần hết lượt.
- [x] `0017-gameover-announcement-emitted-at-end-of-step.md` — mục 1 ghi rõ hiện tượng đo được (aria-live 20 vs panel 40).
- [x] `docs/decisions/README.md` — index sinh lại bởi `docs-regen.sh`, đừng sửa tay trong vùng `BEGIN:auto`.

### 7. Xem trên app thật — bước 5 của `feature-flow`

- [x] `pnpm build && node scripts/serve.mjs 4173 out`, đối chiếu dấu hiệu nhận biết app.
- [x] Ảnh ở **375 · 768 · 1024 · 1440**: menu · Tuỳ chỉnh · Hết lượt có form.
- [x] Thao tác thật: Tab qua hết menu, `Space` trên nút, mũi tên trên cả 4 thanh trượt, `UFO từ wave` tới "tắt" bằng bàn phím.
- [x] **Xoá `localStorage` trước khi kiểm** — đây đúng cái lỗi vận hành đã làm hỏng lần chạy persona; đừng lặp lại.

### 8. Cổng chất lượng

- [x] `pnpm typecheck` · `pnpm lint` · `pnpm test` · `pnpm test:e2e` · `pnpm build` · `pnpm check:bundle` (trần 200 kB gzip) · `pnpm format`.
- [x] `requesting-code-review` → `verification-before-completion`.

### 9. Đóng việc

- [ ] `docs/04-state/backlog.md`: §Đang làm về trạng thái nghỉ; ghi rõ pass 2/3/4 còn lại và phát hiện nào thuộc pass nào.
- [ ] Cập nhật `docs/ux-reviews/2026-09-11-lop-vo-7-red-route.md`? **Không.** Báo cáo là kết quả đo tại thời điểm đó, không phải tài liệu sống. Việc sửa lại F-06/F-09 nằm ở `design.md` §0.
- [ ] `finishing-a-development-branch` — PR, không commit thẳng vào `main`.

---

## Không làm trong pass này

F-02 · F-03 (pass 2) · F-04 · F-05 (pass 3) · F-07 · F-08 · F-10 và việc đo tương phản (pass 4). Lý do chia ở `design.md` §3.
