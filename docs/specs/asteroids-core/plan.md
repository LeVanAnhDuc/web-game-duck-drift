# Kế hoạch thực hiện · `asteroids-core`

Thiết kế: [`design.md`](design.md). Branch: `feat/asteroids-core`.

Đánh dấu `[x]` **ngay khi task xong**, không để cuối phiên — đây là thứ duy nhất cho biết đang ở đâu sau khi context bị nén.

## Giai đoạn 1 — Nền móng (làm tuần tự, mọi thứ khác phụ thuộc vào đây)

- [x] **T1 · Scaffold dự án**
      `package.json` · `tsconfig.json` · `next.config.ts` (`output: 'export'`) · `tailwind.config.ts` · `postcss.config.mjs` · `vitest.config.mts` · `.eslintrc.json` · `src/app/layout.tsx` · `src/app/globals.css`
      Token của `MASTER.md` §0 vào `globals.css` dạng biến CSS và vào `tailwind.config.ts`. Font qua `next/font/google` (tải kèm build, `NFR-SEC-03`).
      ESLint `no-restricted-globals` + `no-restricted-imports` cho `src/game/core/**` (bất biến #1).
      _Xong khi:_ `pnpm typecheck` và `pnpm test` chạy được (kể cả khi chưa có test nào).

- [x] **T2 · Kiểu dữ liệu, hằng số, RNG, toán vector**
      `src/game/core/types.ts` · `constants.ts` · `rng.ts` · `vector.ts`
      `rng.ts`: mulberry32, có state, tạo từ seed. `vector.ts`: `wrap`, `shortestDelta` (khoảng cách có wrap — bất biến #5), `angleToVec` với quy ước 0 = lên.
      _Test:_ RNG cùng seed cho cùng dãy · `wrap` ở cả bốn mép · `shortestDelta` đúng khi hai điểm ở hai mép đối diện · `angleToVec(0)` trả về `(0, -1)`.

## Giai đoạn 2 — Ba nhánh song song (chỉ phụ thuộc T2)

- [x] **T3 · Lõi luật chơi**
      `src/game/core/step.ts` · `ship.ts` · `bullets.ts` · `asteroids.ts` · `ufo.ts` · `powerups.ts` · `collision.ts` · `spawn.ts` · `score.ts` · `particles.ts`
      Thứ tự trong `step()` theo `design.md` §2, số theo §3.
      _Test:_ vỡ thiên thạch ba cấp · trần 4 viên đạn · đạn hết tuổi thọ · va chạm có wrap · mất mạng + bất tử · khiên hấp thụ đúng một va chạm · thay khe vũ khí · cộng dồn thời gian có trần 20s · chết thì mất power-up · hyperspace cooldown · +1 mạng ở mốc 10.000 · sinh wave · UFO từ wave 3 · **tái lập 1000 bước cùng seed** (`NFR-ROB-04`) · **benchmark `step()` < 4ms** với 60 vật thể (`NFR-PERF-02`).

- [x] **T4 · Vẽ và vòng lặp**
      `src/game/render/draw.ts` · `src/game/loop.ts`
      `draw` chỉ đọc state, vẽ theo lớp ở `design.md` §4, nét scale theo kích thước canvas. `loop` giữ accumulator, clamp 0.25s, dựng `HudSnapshot` và chỉ phát khi giá trị đổi.
      _Test:_ `dt` 10 giây chỉ chạy tối đa 15 bước (`NFR-ROB-03`) · snapshot không đổi thì không gọi callback (`NFR-PERF-03`) · `draw` không sửa state (so sánh sâu trước/sau).

- [x] **T5 · Lưu điểm và chuỗi hiển thị**
      `src/storage/scoreStore.ts` · `localScoreStore.ts` · `src/i18n/vi.ts`
      Interface theo ADR-0006. Validate từng trường khi đọc, `try/catch` quanh mọi lời gọi `localStorage`.
      _Test:_ JSON hỏng → bảng trống · thiếu trường → bỏ dòng đó · `localStorage` ném lỗi → không crash, `submit` im lặng bỏ qua · `rankOf` trả `null` khi không lọt top 10 · giữ đúng 10 dòng, sắp xếp giảm dần.

## Giai đoạn 3 — Giao diện (cần T2, T4, T5)

- [x] **T6 · Vỏ React và các màn hình**
      `src/hooks/useGame.ts` · `src/components/GameShell.tsx` · `GameCanvas.tsx` · `Hud.tsx` · `MenuScreen.tsx` · `HelpScreen.tsx` · `HighScoresScreen.tsx` · `PauseOverlay.tsx` · `GameOverOverlay.tsx` · `InitialsInput.tsx` · `LiveRegion.tsx` · `src/app/page.tsx`
      React không giữ `GameState` (bất biến #8). Signature element khung vạch góc dùng cho mọi panel.
      _Test:_ bấm Chơi thì chuyển pha · Esc tạm dừng · điểm lọt top 10 mới hiện ô nhập tên · bảng điểm trống có thông báo riêng.

- [x] **T7 · Cảm ứng, bố cục co giãn, a11y**
      `src/components/TouchControls.tsx` · `src/input/keyboard.ts` · `touch.ts` · cập nhật `globals.css`
      Nút giữ được, ≥ 44px, `touch-action: none`, nhả khi con trỏ rời vùng hoặc khi mất `pointercapture`. Bố cục 375 / 768 / 1440 theo wireframe đã duyệt. `prefers-reduced-motion` tắt particle, rung màn, vệt đẩy, transition.
      _Test:_ `pointerdown` rồi `pointerleave` thì nhả nút · hai nút bấm cùng lúc đều nhận · bàn phím và cảm ứng cho ra cùng `InputState`.

## Giai đoạn 4 — Chốt

- [x] **T8 · Kiểm chứng**
      `pnpm typecheck` · `pnpm lint` · `pnpm test` · `pnpm build` · kiểm kích thước bundle so với `NFR-PERF-04`.

- [x] **T9 · Nhìn app chạy thật**
      **Đã kiểm trên app đang chạy:** menu · bắt đầu ván · bắn trúng và cộng 20 điểm · thiên thạch to tách thành mảnh vừa · mất một mạng và HUD còn 2 mạng · tạm dừng bằng Esc · thông báo `aria-live` phát đúng câu "Mất một mạng. Còn 2 mạng." · letterbox đúng khung thế giới (đo pixel: nội dung nằm trong 400–1508 trên khung 397–1523).
      **Tìm ra một bug ở đây:** banner "WAVE n" không bao giờ tắt — đã sửa (tách `waveBannerMs` khỏi `waveClearMs`) và khoá lại bằng `waveBanner.test.ts`.
      **KHÔNG kiểm được trong môi trường này:** chụp ở 375 / 768 / 1024 vì lệnh đổi kích thước cửa sổ không đổi được viewport (giữ nguyên 1745px), và không drive được gameplay thời gian thực vì `requestAnimationFrame` bị throttle nặng trong tab automation. Bù lại bằng test: co giãn canvas và bề rộng nét ở khổ 375 nằm trong `draw.test.ts`, còn logic hiện/ẩn nút cảm ứng và ngữ nghĩa giữ-nút nằm trong `TouchControls.test.tsx`. Việc xem tận mắt ba khổ kia đã ghi vào `backlog.md`.

- [x] **T10 · Tài liệu và commit**
      `README.md` với `## Features` · đổi trạng thái FR trong `scope.md` sang `xong` · cập nhật `backlog.md` §Đang làm · commit theo Conventional Commits · đẩy branch · mở PR.
