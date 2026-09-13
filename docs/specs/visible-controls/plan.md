# Kế hoạch triển khai · `visible-controls`

**Mục tiêu:** Đóng phần thật của F-02 (Critical) và F-03 (High). Sau pass này, người vào ván biết mình bấm gì, và thấy được vật mình đang điều khiển.

**Cách làm:** Một component DOM suy điều kiện thuần từ `HudSnapshot`, cộng hai con số trong `draw.ts`. Không thêm state, không thêm trường vào `GameState`.

**Spec:** [`design.md`](design.md) — §0 sửa lại chỗ báo cáo nói quá về F-02; đọc nó trước.

## Ràng buộc toàn cục

- **Bất biến #7 · #8:** không thêm trường vào `GameState`, React chỉ nhận snapshot HUD.
- **Bất biến #10:** không đụng `SHIP.drawRadius` — hitbox nhỏ hơn hình vẽ 20% là chủ ý.
- **NFR-PERF-05:** không cấp phát mỗi frame ⇒ gợi ý là DOM, không vẽ vào canvas.
- **NFR-PERF-03:** không thêm re-render nào ngoài những lần HUD vốn đã đổi.
- **NFR-I18N-01:** dùng lại `vi.help.keyboard`, không viết chuỗi mới cho cùng nội dung.
- **NFR-A11Y-05:** `prefers-reduced-motion` ⇒ không animation; gợi ý chỉ hiện/ẩn.
- **ADR-0007:** token của `MASTER.md` thắng cảm nhận thẩm mỹ chung.
- Conventional Commits, subject tiếng Anh. Không commit vào `main`.

## Task

### 1. Mở việc

- [ ] `docs/04-state/backlog.md` §Đang làm: pass 2/4, branch `fix/visible-controls`.

### 2. F-03 — tàu đọc được đầu tiên

- [ ] Test đỏ ở `src/game/render/draw.test.ts`: nét tàu phải **nặng hơn** nét UFO.
- [ ] Test đỏ: khi `ship.invulnMs > 0` ở nhịp mờ, `globalAlpha` dùng để vẽ tàu **≥ 0.55**.
- [ ] `draw.ts`: nét tàu `lw(2.8)` → `lw(3.6)`; đáy `blinkAlpha` `0.4` → `0.55`.
- [ ] `docs/design-system/asteroids/MASTER.md`: dòng "Bất tử (nhấp nháy)" 40% → 55%; ghi thêm rằng nét tàu là nét nặng nhất trên canvas.
- [ ] `pnpm test` xanh.

### 3. F-02 — dòng gợi ý điều khiển

- [ ] `src/i18n/vi.ts`: thêm `hud.controlsHint` — nhãn dẫn ngắn, còn tên phím lấy lại từ `vi.help.keyboard`.
- [ ] Test đỏ cho `ControlsHint`: hiện khi `score=0 · wave=1`; ẩn khi `score>0`, ẩn khi `wave>1`.
- [ ] `src/views/Home/components/ControlsHint/index.tsx` — component thuần, nhận `hud` và `coarse`.
- [ ] `src/views/Home/index.tsx`: render khi `playing && !coarse`, đặt dưới HUD.
- [ ] `pnpm test` xanh.

### 4. E2E

- [ ] 1440: vào ván thì thấy dòng gợi ý.
- [ ] Sau khi có điểm thì dòng gợi ý không còn.
- [ ] Profile `touch-phone`: gợi ý **không** hiện, năm nút cảm ứng vẫn đủ (chống hồi quy §0).
- [ ] `pnpm test:e2e` xanh.

### 5. ADR

- [ ] `0018-ship-reads-first-and-controls-hint.md` — hai quyết định gần nhau về cùng một mục tiêu "người chơi biết mình đang điều khiển cái gì". Mục 3 phải ghi phương án "vẽ chữ vào canvas" và "đổi hình tàu" và vì sao loại.

### 6. Xem trên app thật

- [ ] Build, xoá `localStorage`, xem ở **375 · 768 · 1024 · 1440**: gợi ý có mặt lúc vào ván, biến mất sau khi ghi điểm.
- [ ] Nhìn tận mắt: tàu có phải thứ đọc được đầu tiên trên canvas, kể cả lúc đang bất tử.

### 7. Cổng chất lượng

- [ ] `pnpm typecheck` · `pnpm lint` · `pnpm test` · `pnpm test:e2e` · `pnpm build` · `pnpm check:bundle`.
- [ ] `pnpm format` **chỉ trên file của pass này** — lần trước nó định dạng lại cả repo và phải revert thủ công.

### 8. Đóng việc

- [ ] `backlog.md` §Đang làm → còn pass 3 và pass 4.
- [ ] Merge, xoá nhánh.
