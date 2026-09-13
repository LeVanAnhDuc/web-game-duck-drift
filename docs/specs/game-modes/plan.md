# Kế hoạch triển khai · `game-modes`

> **Cho người thực thi:** dùng `superpowers:subagent-driven-development` hoặc `superpowers:executing-plans`. Mọi bước ở dạng checkbox — tick khi xong, vì đó là thứ duy nhất nói được "đang ở task 6 trên 9" sau khi context bị nén.

**Mục tiêu:** Thêm ba mức độ khó sẵn (Dễ · Thường · Khó) và một chế độ Tuỳ chỉnh bốn thanh trượt, với bảng điểm tách riêng theo mức.

**Cách làm:** Bốn số cân bằng đi vào `GameState.tuning`, đặt một lần lúc bắt đầu ván (ADR-0010). Bốn chỗ trong lõi đọc `state.tuning.*` thay cho hằng số import. Bảng điểm thành ba khoá `localStorage` độc lập (ADR-0011). Tầng React thêm một pha `'custom'`.

**Tech stack:** TypeScript 5 · React 19 · Next.js 15 (static export) · Vitest + happy-dom + Testing Library · Playwright · Yarn classic.

**Spec:** [`design.md`](design.md) — đọc cùng file này, kế hoạch lập luận từ nó.

## Ràng buộc toàn cục

- **Bất biến #1:** `src/game/core/**` không gọi `Math.random`, `Date.now`, `performance.now`, `window`, `document`. Có ESLint chặn — đừng tắt rule.
- **Bất biến #2:** ngẫu nhiên chỉ lấy từ `state.rng`.
- **Bất biến #3:** mọi hằng số thời gian theo đơn vị/giây rồi nhân `dt`; không có gì tính "mỗi frame".
- **Bất biến #7:** chỉ `step()` và các hàm có tên trong `core/state.ts` được sửa `GameState`.
- **Bất biến #9 · NFR-ROB-01:** mọi thứ đọc từ `localStorage` phải validate trước khi dùng.
- **NFR-ROB-02:** `localStorage` bị chặn thì game vẫn chơi được, chỉ mất tính năng lưu.
- **NFR-A11Y-03:** vùng bấm ≥ 44×44px.
- **NFR-I18N-01:** không hardcode chuỗi hiển thị trong component; mọi chuỗi ở `src/i18n/vi.ts`.
- **Không đổi khoá `asteroids.highscores.v1`** — đổi là xoá bảng điểm của người đang chơi.
- Conventional Commits, subject tiếng Anh. Không commit vào `main`.
- Lệnh: `pnpm test` · `pnpm typecheck` · `pnpm lint` · `pnpm build` · `pnpm test:e2e` · `pnpm format`.

---

## Cấu trúc file

| File                                                | Trách nhiệm                                                                                                     | Task |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ---- |
| `src/game/core/types.ts`                            | thêm `DifficultyId`, `Tuning`, hai trường của `GameState`, một trường của `HudSnapshot`, `'custom'` vào `Phase` | 1    |
| `src/game/core/constants.ts`                        | thêm `UFO_NEVER`, `DIFFICULTY`, `TUNING_LIMITS`                                                                 | 1    |
| `src/game/core/state.ts`                            | `createGameState` mặc định mức Thường · `resetForNewGame(state, options)` · `hudOf`/`hudEquals`                 | 1    |
| `src/game/core/asteroids.ts`                        | `waveSpeedFactor(wave, speedMul)`                                                                               | 2    |
| `src/game/core/spawn.ts` · `powerups.ts` · `ufo.ts` | ba chỗ đọc `state.tuning` còn lại                                                                               | 2    |
| `src/game/core/testkit.ts`                          | `newGame(seed, tuning?)`                                                                                        | 2    |
| `src/storage/localScoreStore.ts`                    | `SCORE_KEYS` + tham số khoá                                                                                     | 3    |
| `src/storage/settingsStore.ts`                      | **mới** — đọc/ghi mức đang chọn và bốn số Tuỳ chỉnh, có clamp                                                   | 4    |
| `src/i18n/vi.ts`                                    | chuỗi của ba màn mới                                                                                            | 5    |
| `src/components/ui.tsx`                             | **mới trong file cũ** — `Segmented`, `TuningSlider`                                                             | 5    |
| `src/components/MenuScreen.tsx`                     | dãy ba mức + nút Tuỳ chỉnh                                                                                      | 6    |
| `src/components/CustomScreen.tsx`                   | **mới** — màn bốn thanh trượt                                                                                   | 6    |
| `src/components/HighScoresScreen.tsx`               | ba tab, xoá theo tab, trạng thái trống theo mức                                                                 | 7    |
| `src/components/Overlays.tsx`                       | màn Hết lượt không hỏi tên ở ván tuỳ chỉnh                                                                      | 8    |
| `src/hooks/useGame.ts`                              | `start(options)`                                                                                                | 8    |
| `src/components/GameShell.tsx`                      | nối dây: ba store điểm, settings store, pha `'custom'`                                                          | 8    |
| `e2e/game.spec.ts` · `e2e/modes.spec.ts`            | E2E                                                                                                             | 9    |

---

### Task 1: Kiểu, hằng số và state của độ khó

**Files:**

- Modify: `src/game/core/types.ts`
- Modify: `src/game/core/constants.ts`
- Modify: `src/game/core/state.ts`
- Test: `src/game/core/difficulty.test.ts` (mới)

**Interfaces:**

- Produces: `DifficultyId`, `Tuning`, `UFO_NEVER`, `DIFFICULTY`, `TUNING_LIMITS`, `NewGameOptions`, `resetForNewGame(state, options?)`.
- Consumes: không có.

- [ ] **Bước 1: Viết test thất bại**

`src/game/core/difficulty.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { DIFFICULTY, POWERUP, SCORING, TUNING_LIMITS, UFO, UFO_NEVER } from './constants'
import { createGameState, hudEquals, hudOf, resetForNewGame } from './state'

describe('bộ núm của ba mức sẵn — FR-20', () => {
  // Test này là thứ chặn việc âm thầm đổi cân bằng của những ván đã ghi điểm
  // vào `asteroids.highscores.v1`. Mức Thường PHẢI bằng đúng game trước đây.
  it('mức Thường bằng đúng bộ hằng số hiện có', () => {
    expect(DIFFICULTY.normal).toEqual({
      startLives: SCORING.startLives,
      asteroidSpeed: 1,
      dropChance: POWERUP.dropChance,
      ufoFirstWave: UFO.firstWave,
    })
  })

  it('Dễ dễ hơn Thường và Khó khó hơn Thường, ở cả bốn núm', () => {
    expect(DIFFICULTY.easy.startLives).toBeGreaterThan(DIFFICULTY.normal.startLives)
    expect(DIFFICULTY.easy.asteroidSpeed).toBeLessThan(DIFFICULTY.normal.asteroidSpeed)
    expect(DIFFICULTY.easy.dropChance).toBeGreaterThan(DIFFICULTY.normal.dropChance)
    expect(DIFFICULTY.easy.ufoFirstWave).toBeGreaterThan(DIFFICULTY.normal.ufoFirstWave)

    expect(DIFFICULTY.hard.startLives).toBeLessThan(DIFFICULTY.normal.startLives)
    expect(DIFFICULTY.hard.asteroidSpeed).toBeGreaterThan(DIFFICULTY.normal.asteroidSpeed)
    expect(DIFFICULTY.hard.dropChance).toBeLessThan(DIFFICULTY.normal.dropChance)
    expect(DIFFICULTY.hard.ufoFirstWave).toBeLessThan(DIFFICULTY.normal.ufoFirstWave)
  })

  it('mọi mức sẵn nằm trong biên của thanh trượt Tuỳ chỉnh', () => {
    for (const tuning of Object.values(DIFFICULTY)) {
      for (const [key, limit] of Object.entries(TUNING_LIMITS)) {
        const value = tuning[key as keyof typeof tuning]
        expect(value).toBeGreaterThanOrEqual(limit.min)
        expect(value).toBeLessThanOrEqual(limit.max)
      }
    }
  })

  it('không mức sẵn nào tắt UFO — nhánh đó chỉ tới được qua Tuỳ chỉnh', () => {
    for (const tuning of Object.values(DIFFICULTY)) {
      expect(tuning.ufoFirstWave).toBeLessThan(UFO_NEVER)
    }
  })
})

describe('tuning trong GameState — ADR-0010', () => {
  it('ván mới mặc định là mức Thường', () => {
    const state = createGameState(1)
    expect(state.difficulty).toBe('normal')
    expect(state.tuning).toEqual(DIFFICULTY.normal)
  })

  it('resetForNewGame nhận mức và bộ núm, và dùng số mạng của bộ núm đó', () => {
    const state = createGameState(1)
    resetForNewGame(state, { difficulty: 'easy', tuning: DIFFICULTY.easy })
    expect(state.difficulty).toBe('easy')
    expect(state.lives).toBe(DIFFICULTY.easy.startLives)
  })

  it('resetForNewGame không có tham số thì GIỮ mức của ván trước', () => {
    const state = createGameState(1)
    resetForNewGame(state, { difficulty: 'hard', tuning: DIFFICULTY.hard })
    resetForNewGame(state)
    expect(state.difficulty).toBe('hard')
    expect(state.lives).toBe(DIFFICULTY.hard.startLives)
  })

  it('hudOf mang theo mức, và hudEquals nhận ra khi mức đổi', () => {
    const state = createGameState(1)
    const before = hudOf(state)
    expect(before.difficulty).toBe('normal')

    resetForNewGame(state, { difficulty: 'hard', tuning: DIFFICULTY.hard })
    expect(hudEquals(before, hudOf(state))).toBe(false)
  })
})
```

- [ ] **Bước 2: Chạy test để chắc chắn nó đỏ**

Chạy: `pnpm test src/game/core/difficulty.test.ts`
Mong đợi: FAIL — `DIFFICULTY`, `UFO_NEVER`, `TUNING_LIMITS` chưa tồn tại.

- [ ] **Bước 3: Thêm kiểu vào `types.ts`**

Thêm `'custom'` vào `Phase`, và hai kiểu mới ngay dưới `PowerUpKind`:

```ts
export type Phase = 'menu' | 'playing' | 'paused' | 'gameover' | 'highscores' | 'help' | 'custom'

/** Ba mức dựng sẵn cộng một mức người chơi tự đặt — glossary.md. */
export type DifficultyId = 'easy' | 'normal' | 'hard' | 'custom'

/**
 * Bốn số quyết định độ khó. Đặt một lần lúc bắt đầu ván rồi không đổi nữa —
 * ADR-0010. Thêm núm thứ năm thì phải sửa ADR đó trước.
 */
export interface Tuning {
  /** Mạng lúc bắt đầu ván. */
  startLives: number
  /** Nhân vào hệ số tốc độ thiên thạch của wave. 1 = như mức Thường. */
  asteroidSpeed: number
  /** Xác suất rơi power-up mỗi lần thiên thạch vỡ, 0..1. */
  dropChance: number
  /** Wave đầu tiên UFO xuất hiện. `UFO_NEVER` nghĩa là không bao giờ. */
  ufoFirstWave: number
}
```

Trong `interface GameState`, thêm ngay dưới `rng`:

```ts
/** Mức của ván này. Màn Hết lượt đọc nó để biết có hỏi tên hay không. */
difficulty: DifficultyId
/** Bốn số cân bằng của ván này — ADR-0010. */
tuning: Tuning
```

Trong `interface HudSnapshot`, thêm dưới `phase`:

```ts
difficulty: DifficultyId
```

- [ ] **Bước 4: Thêm hằng số vào `constants.ts`**

Đổi dòng import đầu file thành `import type { AsteroidSize, DifficultyId, PowerUpKind, Tuning } from './types'`, rồi thêm vào cuối file, trước `POWERUP_COLOR`:

```ts
/**
 * Giá trị cuối của núm `ufoFirstWave`: ván không có UFO nào. Đặt tên chứ không
 * rải số 10 trong `ufo.ts` — số 10 ở đó đọc như "từ wave 10", nghĩa ngược lại.
 */
export const UFO_NEVER = 10

/**
 * Ba mức sẵn. `normal` PHẢI bằng đúng bộ hằng số ở trên: đó là điều kiện để
 * bảng điểm cũ còn so sánh được với điểm mới (ADR-0011). Số của `easy` và `hard`
 * là ước lượng trên giấy — backlog.md §Nợ kỹ thuật.
 */
export const DIFFICULTY: Record<Exclude<DifficultyId, 'custom'>, Tuning> = {
  easy: { startLives: 5, asteroidSpeed: 0.75, dropChance: 0.16, ufoFirstWave: 6 },
  normal: {
    startLives: SCORING.startLives,
    asteroidSpeed: 1,
    dropChance: POWERUP.dropChance,
    ufoFirstWave: UFO.firstWave,
  },
  hard: { startLives: 2, asteroidSpeed: 1.3, dropChance: 0.05, ufoFirstWave: 1 },
}

/** Biên của bốn thanh trượt ở chế độ Tuỳ chỉnh — design.md §3. */
export const TUNING_LIMITS: Record<keyof Tuning, { min: number; max: number; step: number }> = {
  startLives: { min: 1, max: 6, step: 1 },
  asteroidSpeed: { min: 0.6, max: 1.6, step: 0.1 },
  dropChance: { min: 0, max: 0.3, step: 0.01 },
  ufoFirstWave: { min: 1, max: UFO_NEVER, step: 1 },
}
```

`DIFFICULTY` phải nằm **sau** `SCORING`, `POWERUP` và `UFO` trong file, vì nó đọc giá trị của chúng.

- [ ] **Bước 5: Sửa `state.ts`**

```ts
import { DIFFICULTY, SHIP, WORLD_H, WORLD_W } from './constants'
import { createRng } from './rng'
import type { DifficultyId, GameState, HudSnapshot, Ship, Tuning } from './types'

/** Tuỳ chọn của một ván mới. Bỏ trống trường nào thì giữ nguyên trường đó. */
export interface NewGameOptions {
  seed?: number
  difficulty?: DifficultyId
  tuning?: Tuning
}
```

Trong `createGameState`, thay `lives: SCORING.startLives` và thêm hai trường:

```ts
    difficulty: 'normal',
    tuning: DIFFICULTY.normal,
    // …
    lives: DIFFICULTY.normal.startLives,
    nextExtraLifeAt: SCORING.extraLifeEvery,
```

(`SCORING` vẫn cần cho `extraLifeEvery`, giữ nó trong import.)

`resetForNewGame` đổi chữ ký:

```ts
export function resetForNewGame(state: GameState, options: NewGameOptions = {}): void {
  if (options.seed !== undefined) state.rng = createRng(options.seed)
  if (options.difficulty !== undefined) state.difficulty = options.difficulty
  if (options.tuning !== undefined) state.tuning = options.tuning
  state.phase = 'playing'
  // …phần còn lại như cũ, nhưng:
  state.lives = state.tuning.startLives
```

`hudOf` thêm `difficulty: state.difficulty`, và `hudEquals` thêm `a.difficulty === b.difficulty &&` vào đầu chuỗi so sánh.

- [ ] **Bước 6: Chạy toàn bộ test**

Chạy: `pnpm test && pnpm typecheck`
Mong đợi: PASS. 151 test cũ vẫn xanh — không call site nào truyền seed vào `resetForNewGame`, nên chữ ký mới tương thích ngược.

- [ ] **Bước 7: Commit**

```bash
git add src/game/core/types.ts src/game/core/constants.ts src/game/core/state.ts src/game/core/difficulty.test.ts
git commit -m "feat(difficulty): add Tuning and three presets to GameState

Four balance knobs move into state so a game replays from seed plus
tuning alone (NFR-ROB-04). DIFFICULTY.normal is pinned to the existing
constants by test — that is what keeps scores in the old high-score key
comparable. See ADR-0010."
```

---

### Task 2: Bốn chỗ lõi đọc tuning

**Files:**

- Modify: `src/game/core/asteroids.ts:29-32` (`waveSpeedFactor`), `:71`
- Modify: `src/game/core/spawn.ts:24`
- Modify: `src/game/core/powerups.ts:32`
- Modify: `src/game/core/ufo.ts:51`
- Modify: `src/game/core/testkit.ts:18-21`
- Modify: `src/game/core/asteroids.test.ts:127-130`
- Test: `src/game/core/difficulty.test.ts` (thêm vào file của Task 1), `src/game/core/step.test.ts`

**Interfaces:**

- Consumes: `Tuning`, `DIFFICULTY`, `UFO_NEVER`, `NewGameOptions` từ Task 1.
- Produces: `waveSpeedFactor(wave: number, speedMul: number): number` · `newGame(seed: number, tuning?: Tuning): GameState`.

- [ ] **Bước 1: Viết test thất bại**

Thêm vào `src/game/core/difficulty.test.ts`:

```ts
import { FIXED_DT, WAVE } from './constants'
import { waveSpeedFactor } from './asteroids'
import { step } from './step'
import { freezeWaves, IDLE, newGame, run, steps } from './testkit'
import { breakAsteroid } from './asteroids'

describe('bốn núm thật sự đổi hành vi — FR-20', () => {
  it('startLives: ván bắt đầu với đúng số mạng của mức', () => {
    expect(newGame(11, DIFFICULTY.easy).lives).toBe(5)
    expect(newGame(11, DIFFICULTY.hard).lives).toBe(2)
  })

  it('asteroidSpeed: chặn trần theo wave TRƯỚC, nhân hệ số SAU', () => {
    // Trần maxSpeedFactor giới hạn phần tăng theo wave; hệ số độ khó nhân lên
    // trên đó. Làm ngược lại thì Khó và Thường hội tụ cùng tốc độ ở wave cao —
    // mức Khó tự biến mất đúng lúc nó cần có ý nghĩa nhất.
    expect(waveSpeedFactor(1, 1)).toBe(1)
    expect(waveSpeedFactor(1, 1.3)).toBeCloseTo(1.3)
    expect(waveSpeedFactor(50, 1)).toBe(WAVE.maxSpeedFactor)
    expect(waveSpeedFactor(50, 1.3)).toBeCloseTo(WAVE.maxSpeedFactor * 1.3)
  })

  it('asteroidSpeed: thiên thạch wave 1 của mức Khó nhanh hơn mức Dễ', () => {
    const speedOf = (state: ReturnType<typeof newGame>) =>
      state.asteroids.reduce((sum, a) => sum + Math.hypot(a.vx, a.vy), 0) / state.asteroids.length

    const easy = newGame(12, DIFFICULTY.easy)
    const hard = newGame(12, DIFFICULTY.hard)
    step(easy, IDLE, FIXED_DT)
    step(hard, IDLE, FIXED_DT)

    // Cùng seed nên cùng hướng và cùng tốc độ gốc; chỉ hệ số khác nhau.
    expect(speedOf(hard) / speedOf(easy)).toBeCloseTo(1.3 / 0.75, 5)
  })

  it('dropChance 0 thì không bao giờ rơi, 1 thì luôn rơi', () => {
    const never = newGame(13, { ...DIFFICULTY.normal, dropChance: 0 })
    step(never, IDLE, FIXED_DT)
    for (let i = 0; i < 40; i++) breakAsteroid(never, never.asteroids[0]!, true)
    expect(never.powerUps).toHaveLength(0)

    const always = newGame(13, { ...DIFFICULTY.normal, dropChance: 1 })
    step(always, IDLE, FIXED_DT)
    breakAsteroid(always, always.asteroids[0]!, true)
    expect(always.powerUps).toHaveLength(1)
  })

  it('ufoFirstWave: UFO_NEVER thì không sinh UFO dù đã qua wave 10', () => {
    const state = newGame(14, { ...DIFFICULTY.normal, ufoFirstWave: UFO_NEVER })
    step(state, IDLE, FIXED_DT)
    freezeWaves(state)
    state.wave = UFO_NEVER + 5
    state.ufoTimerMs = 0
    run(state, steps(60))
    expect(state.ufos).toHaveLength(0)
  })

  it('ufoFirstWave: mức Khó có UFO ngay wave 1, mức Dễ thì chưa', () => {
    const hard = newGame(15, DIFFICULTY.hard)
    step(hard, IDLE, FIXED_DT)
    freezeWaves(hard)
    hard.ufoTimerMs = 0
    run(hard, 2)
    expect(hard.wave).toBe(1)
    expect(hard.ufos).toHaveLength(1)

    const easy = newGame(15, DIFFICULTY.easy)
    step(easy, IDLE, FIXED_DT)
    freezeWaves(easy)
    easy.ufoTimerMs = 0
    run(easy, steps(60))
    expect(easy.ufos).toHaveLength(0)
  })
})
```

Thêm vào `describe('tái lập — NFR-ROB-04')` trong `src/game/core/step.test.ts`:

```ts
it('cùng seed VÀ cùng tuning thì cùng một trạng thái; đổi tuning thì khác', () => {
  const runWith = (tuning: Tuning) => {
    const state = newGame(20260910, tuning)
    const inp: InputState = { ...IDLE }
    for (let i = 0; i < 1000; i++) step(state, scriptedInput(inp, i), FIXED_DT)
    return snapshot(state)
  }

  expect(runWith(DIFFICULTY.hard)).toBe(runWith(DIFFICULTY.hard))
  expect(runWith(DIFFICULTY.hard)).not.toBe(runWith(DIFFICULTY.easy))
})
```

(thêm `DIFFICULTY` và `Tuning` vào import của file đó)

- [ ] **Bước 2: Chạy test để chắc chắn nó đỏ**

Chạy: `pnpm test src/game/core/difficulty.test.ts`
Mong đợi: FAIL — `newGame` chưa nhận tham số thứ hai, `waveSpeedFactor` chưa nhận tham số thứ hai.

- [ ] **Bước 3: Sửa `asteroids.ts`**

```ts
/**
 * Wave càng cao thiên thạch càng nhanh, tới trần `WAVE.maxSpeedFactor`; hệ số độ
 * khó nhân lên TRÊN trần đó — design.md §4.
 */
export function waveSpeedFactor(wave: number, speedMul: number): number {
  const ramp = 1 + WAVE.speedStep * (wave - 1)
  return (ramp > WAVE.maxSpeedFactor ? WAVE.maxSpeedFactor : ramp) * speedMul
}
```

Trong `breakAsteroid`, dòng 71:

```ts
const factor = waveSpeedFactor(state.wave, state.tuning.asteroidSpeed)
```

- [ ] **Bước 4: Sửa ba file lõi còn lại**

`spawn.ts:24`:

```ts
const factor = waveSpeedFactor(state.wave, state.tuning.asteroidSpeed)
```

`powerups.ts:32`:

```ts
if (state.rng.next() >= state.tuning.dropChance) return
```

(bỏ `dropChance` khỏi chỗ dùng nhưng **giữ** import `POWERUP` — còn dùng cho `maxOnScreen`, `lifeMs`, `radius`, `driftSpeed`.)

`ufo.ts:51` — thêm `UFO_NEVER` vào import từ `./constants`:

```ts
  // `UFO_NEVER` nghĩa là ván này không có UFO. So sánh trước cả điều kiện wave:
  // đọc `wave >= 10` một mình sẽ hiểu ngược thành "từ wave 10 thì có".
  const first = state.tuning.ufoFirstWave
  if (first < UFO_NEVER && state.wave >= first && state.ufos.length === 0) {
```

- [ ] **Bước 5: Sửa `testkit.ts`**

```ts
import type { Bullet, GameState, InputState, Tuning } from './types'

/** Một ván đang chạy, chưa có wave nào — bước đầu tiên sẽ sinh wave 1. */
export function newGame(seed: number, tuning?: Tuning): GameState {
  const state = createGameState(seed)
  resetForNewGame(state, tuning === undefined ? {} : { tuning })
  return state
}
```

- [ ] **Bước 6: Sửa 4 assert cũ của `waveSpeedFactor`**

`src/game/core/asteroids.test.ts:127-130` — thêm hệ số 1 cho mọi lời gọi:

```ts
expect(waveSpeedFactor(1, 1)).toBe(1)
expect(waveSpeedFactor(2, 1)).toBeCloseTo(1.06)
expect(waveSpeedFactor(11, 1)).toBeCloseTo(1.6)
expect(waveSpeedFactor(50, 1)).toBe(WAVE.maxSpeedFactor)
```

- [ ] **Bước 7: Chạy toàn bộ test**

Chạy: `pnpm test && pnpm typecheck && pnpm lint`
Mong đợi: PASS. Nếu ESLint báo lõi đọc thứ bị cấm thì **không** tắt rule — sai chỗ khác.

- [ ] **Bước 8: Commit**

```bash
git add src/game/core
git commit -m "feat(difficulty): read the four knobs from state.tuning in core

Four call sites, one line each: start lives in state.ts, wave speed in
asteroids.ts, drop chance in powerups.ts, first UFO wave in ufo.ts.
waveSpeedFactor caps the wave ramp before applying the difficulty
multiplier, so hard stays harder than normal at high waves instead of
converging on the same cap."
```

---

### Task 3: Ba khoá bảng điểm

**Files:**

- Modify: `src/storage/localScoreStore.ts`
- Test: `src/storage/scoreStore.test.ts`

**Interfaces:**

- Consumes: `DifficultyId` từ Task 1.
- Produces: `SCORE_KEYS: Record<Exclude<DifficultyId, 'custom'>, string>` · `createLocalScoreStore(storage?: Storage, key?: string): ScoreStore`.

- [ ] **Bước 1: Viết test thất bại**

Thêm vào cuối `src/storage/scoreStore.test.ts`:

```ts
import { SCORE_KEYS } from './localScoreStore'

describe('ba bảng độc lập — ADR-0011', () => {
  it('khoá mức Thường vẫn là khoá cũ, không đổi', () => {
    // Đổi khoá này là xoá bảng điểm của người đang chơi.
    expect(SCORE_KEYS.normal).toBe('asteroids.highscores.v1')
    expect(SCORE_KEYS.normal).toBe(STORAGE_KEY)
  })

  it('ba mức ba khoá khác nhau', () => {
    const keys = [SCORE_KEYS.easy, SCORE_KEYS.normal, SCORE_KEYS.hard]
    expect(new Set(keys).size).toBe(3)
  })

  it('ghi điểm ở một mức không đụng bảng của mức khác', () => {
    const storage = mapStorage()
    const easy = createLocalScoreStore(storage, SCORE_KEYS.easy)
    const normal = createLocalScoreStore(storage, SCORE_KEYS.normal)

    normal.submit(entry(9000))
    easy.submit(entry(100))

    expect(normal.top()).toHaveLength(1)
    expect(normal.top()[0]!.score).toBe(9000)
    expect(easy.top()).toHaveLength(1)
    expect(easy.top()[0]!.score).toBe(100)
  })

  it('điểm thấp ở mức Khó vẫn là hạng 1 của bảng Khó', () => {
    const storage = mapStorage()
    createLocalScoreStore(storage, SCORE_KEYS.normal).submit(entry(50_000))
    const hard = createLocalScoreStore(storage, SCORE_KEYS.hard)
    expect(hard.rankOf(10)).toBe(1)
  })

  it('xoá một bảng không đụng hai bảng kia', () => {
    const storage = mapStorage()
    const easy = createLocalScoreStore(storage, SCORE_KEYS.easy)
    const hard = createLocalScoreStore(storage, SCORE_KEYS.hard)
    easy.submit(entry(100))
    hard.submit(entry(200))

    hard.clear()
    expect(hard.top()).toHaveLength(0)
    expect(easy.top()).toHaveLength(1)
  })
})
```

`fakeStorage` hiện có chỉ giữ **một** giá trị nên không dùng được cho nhiều khoá. Thêm ngay dưới nó:

```ts
/** Storage giả nhiều khoá — cần cho ba bảng độc lập. */
function mapStorage(): Storage {
  const map = new Map<string, string>()
  return {
    get length() {
      return map.size
    },
    clear: () => map.clear(),
    key: (i: number) => Array.from(map.keys())[i] ?? null,
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
  } as Storage
}
```

- [ ] **Bước 2: Chạy test để chắc chắn nó đỏ**

Chạy: `pnpm test src/storage/scoreStore.test.ts`
Mong đợi: FAIL — `SCORE_KEYS` chưa tồn tại.

- [ ] **Bước 3: Sửa `localScoreStore.ts`**

```ts
import type { DifficultyId, ScoreEntry } from '@/game/core/types'
import { isValidEntry, rankIn, sortEntries, TOP_N, type ScoreStore } from './scoreStore'

export const STORAGE_KEY = 'asteroids.highscores.v1'

/**
 * Một khoá cho mỗi mức, top 10 độc lập — ADR-0011.
 *
 * Mức Thường DÙNG LẠI khoá cũ và tên khoá vì vậy không đối xứng: nó không có
 * chữ `normal`. Đó là cái giá của việc không xoá điểm của ai cả.
 */
export const SCORE_KEYS: Record<Exclude<DifficultyId, 'custom'>, string> = {
  easy: 'asteroids.highscores.easy.v1',
  normal: STORAGE_KEY,
  hard: 'asteroids.highscores.hard.v1',
}

export function createLocalScoreStore(storage?: Storage, key: string = STORAGE_KEY): ScoreStore {
```

Rồi thay `STORAGE_KEY` bằng `key` ở ba chỗ trong thân hàm (`getItem`, `setItem`, `removeItem`). Chuỗi probe trong `safeStorage` giữ nguyên.

- [ ] **Bước 4: Chạy test**

Chạy: `pnpm test src/storage && pnpm typecheck`
Mong đợi: PASS, kể cả 12 test cũ của `scoreStore.test.ts` — chúng gọi `createLocalScoreStore(fakeStorage(...))` không truyền khoá, nên mặc định vẫn là khoá cũ.

- [ ] **Bước 5: Commit**

```bash
git add src/storage/localScoreStore.ts src/storage/scoreStore.test.ts
git commit -m "feat(scores): one storage key per difficulty

Normal keeps asteroids.highscores.v1 so nobody's scores are deleted; easy
and hard get their own keys with their own top 10. ScoreStore, isValidEntry,
rankIn and sortEntries are untouched. See ADR-0011."
```

---

### Task 4: Lưu mức đang chọn và bốn số Tuỳ chỉnh

**Files:**

- Create: `src/storage/settingsStore.ts`
- Test: `src/storage/settingsStore.test.ts`

**Interfaces:**

- Consumes: `DifficultyId`, `Tuning`, `DIFFICULTY`, `TUNING_LIMITS` từ Task 1.
- Produces: `DIFFICULTY_KEY`, `TUNING_KEY`, `clampTuning(raw: unknown): Tuning`, `createSettingsStore(storage?: Storage): SettingsStore` với `{ difficulty(), setDifficulty(id), tuning(), setTuning(t) }`.

- [ ] **Bước 1: Viết test thất bại**

`src/storage/settingsStore.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { DIFFICULTY, TUNING_LIMITS } from '@/game/core/constants'
import { clampTuning, createSettingsStore, DIFFICULTY_KEY, TUNING_KEY } from './settingsStore'

function mapStorage(seed: Record<string, string> = {}): Storage {
  const map = new Map(Object.entries(seed))
  return {
    get length() {
      return map.size
    },
    clear: () => map.clear(),
    key: (i: number) => Array.from(map.keys())[i] ?? null,
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
  } as Storage
}

const blocked = (): Storage =>
  ({
    length: 0,
    clear: () => {},
    key: () => null,
    getItem: () => {
      throw new DOMException('bị chặn')
    },
    setItem: () => {
      throw new DOMException('bị chặn')
    },
    removeItem: () => {},
  }) as Storage

describe('mức đang chọn — FR-20', () => {
  it('chưa chọn gì thì là mức Thường', () => {
    expect(createSettingsStore(mapStorage()).difficulty()).toBe('normal')
  })

  it('nhớ lựa chọn qua một lần đọc lại', () => {
    const storage = mapStorage()
    createSettingsStore(storage).setDifficulty('hard')
    expect(createSettingsStore(storage).difficulty()).toBe('hard')
  })

  it('giá trị lạ trong storage bị bỏ qua, không crash — NFR-ROB-01', () => {
    for (const raw of ['"nightmare"', 'null', '42', '{}', 'không phải json']) {
      const storage = mapStorage({ [DIFFICULTY_KEY]: raw })
      expect(createSettingsStore(storage).difficulty()).toBe('normal')
    }
  })

  it('storage ném lỗi thì vẫn trả mặc định và ghi không crash — NFR-ROB-02', () => {
    const store = createSettingsStore(blocked())
    expect(store.difficulty()).toBe('normal')
    expect(() => store.setDifficulty('easy')).not.toThrow()
  })
})

describe('bốn số Tuỳ chỉnh — FR-21', () => {
  it('chưa đặt gì thì bằng mức Thường', () => {
    expect(createSettingsStore(mapStorage()).tuning()).toEqual(DIFFICULTY.normal)
  })

  it('clamp về biên chứ không bỏ cả object', () => {
    const t = clampTuning({ startLives: 99, asteroidSpeed: -5, dropChance: 7, ufoFirstWave: 0 })
    expect(t.startLives).toBe(TUNING_LIMITS.startLives.max)
    expect(t.asteroidSpeed).toBe(TUNING_LIMITS.asteroidSpeed.min)
    expect(t.dropChance).toBe(TUNING_LIMITS.dropChance.max)
    expect(t.ufoFirstWave).toBe(TUNING_LIMITS.ufoFirstWave.min)
  })

  it('trường sai kiểu chỉ mất trường đó, ba trường kia giữ nguyên', () => {
    const t = clampTuning({ startLives: 6, asteroidSpeed: 'nhanh', dropChance: null, ufoFirstWave: 4 })
    expect(t.startLives).toBe(6)
    expect(t.ufoFirstWave).toBe(4)
    expect(t.asteroidSpeed).toBe(DIFFICULTY.normal.asteroidSpeed)
    expect(t.dropChance).toBe(DIFFICULTY.normal.dropChance)
  })

  it('NaN và Infinity không lọt qua', () => {
    const t = clampTuning({
      startLives: NaN,
      asteroidSpeed: Infinity,
      dropChance: -Infinity,
      ufoFirstWave: NaN,
    })
    expect(t).toEqual(DIFFICULTY.normal)
  })

  it('rác hoàn toàn thì ra mức Thường', () => {
    for (const raw of [null, 'chuỗi', 42, []]) {
      expect(clampTuning(raw)).toEqual(DIFFICULTY.normal)
    }
  })

  it('nhớ bốn số qua một lần đọc lại', () => {
    const storage = mapStorage()
    const mine = { startLives: 6, asteroidSpeed: 0.6, dropChance: 0.3, ufoFirstWave: 10 }
    createSettingsStore(storage).setTuning(mine)
    expect(createSettingsStore(storage).tuning()).toEqual(mine)
  })
})
```

- [ ] **Bước 2: Chạy test để chắc chắn nó đỏ**

Chạy: `pnpm test src/storage/settingsStore.test.ts`
Mong đợi: FAIL — file chưa tồn tại.

- [ ] **Bước 3: Viết `src/storage/settingsStore.ts`**

```ts
import { DIFFICULTY, TUNING_LIMITS } from '@/game/core/constants'
import type { DifficultyId, Tuning } from '@/game/core/types'

export const DIFFICULTY_KEY = 'asteroids.difficulty.v1'
export const TUNING_KEY = 'asteroids.tuning.v1'

const IDS: readonly DifficultyId[] = ['easy', 'normal', 'hard', 'custom']

/**
 * Người dùng sửa được hai khoá này bằng devtools — NFR-ROB-01, bất biến #9.
 *
 * Trường sai chỉ mất trường đó chứ không bỏ cả object: `speed: 99` phải ra 1.6,
 * không phải ra một ván không chơi được, và cũng không được reset ba núm kia.
 */
export function clampTuning(raw: unknown): Tuning {
  const source =
    typeof raw === 'object' && raw !== null && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {}
  const out = { ...DIFFICULTY.normal }
  for (const key of Object.keys(out) as (keyof Tuning)[]) {
    const value = source[key]
    if (typeof value !== 'number' || !Number.isFinite(value)) continue
    const { min, max } = TUNING_LIMITS[key]
    out[key] = value < min ? min : value > max ? max : value
  }
  return out
}

function isDifficultyId(value: unknown): value is DifficultyId {
  return typeof value === 'string' && (IDS as readonly string[]).includes(value)
}

export interface SettingsStore {
  difficulty(): DifficultyId
  setDifficulty(id: DifficultyId): void
  tuning(): Tuning
  setTuning(tuning: Tuning): void
}

/**
 * Mọi lời gọi bọc try/catch: storage có thể bị chặn hoàn toàn — NFR-ROB-02.
 * Mất việc nhớ lựa chọn là chấp nhận được, crash thì không.
 */
export function createSettingsStore(storage?: Storage): SettingsStore {
  const backing = storage ?? safeStorage()

  const read = (key: string): unknown => {
    if (!backing) return undefined
    try {
      const raw = backing.getItem(key)
      return raw === null ? undefined : JSON.parse(raw)
    } catch {
      return undefined
    }
  }

  const write = (key: string, value: unknown): void => {
    if (!backing) return
    try {
      backing.setItem(key, JSON.stringify(value))
    } catch {
      // Hết dung lượng hoặc bị chặn. Ván này không nhớ được, game vẫn chạy.
    }
  }

  return {
    difficulty: () => {
      const value = read(DIFFICULTY_KEY)
      return isDifficultyId(value) ? value : 'normal'
    },
    setDifficulty: (id) => write(DIFFICULTY_KEY, id),
    tuning: () => clampTuning(read(TUNING_KEY)),
    setTuning: (tuning) => write(TUNING_KEY, clampTuning(tuning)),
  }
}

/** Chạm vào `localStorage` cũng có thể ném lỗi, nên phép thử này cũng phải bọc. */
function safeStorage(): Storage | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null
    const probe = '__asteroids_probe__'
    window.localStorage.setItem(probe, '1')
    window.localStorage.removeItem(probe)
    return window.localStorage
  } catch {
    return null
  }
}
```

- [ ] **Bước 4: Chạy test**

Chạy: `pnpm test src/storage && pnpm typecheck && pnpm lint`
Mong đợi: PASS.

- [ ] **Bước 5: Commit**

```bash
git add src/storage/settingsStore.ts src/storage/settingsStore.test.ts
git commit -m "feat(settings): remember the chosen difficulty and custom knobs

Both keys are validated on read (NFR-ROB-01): an unknown difficulty falls
back to normal, and a bad tuning field is clamped to its own limit instead
of discarding the other three."
```

---

### Task 5: Chuỗi và hai component nền

**Files:**

- Modify: `src/i18n/vi.ts`
- Modify: `src/components/ui.tsx`
- Test: `src/components/components.test.tsx`

**Interfaces:**

- Consumes: `TUNING_LIMITS` từ Task 1.
- Produces: `vi.difficulty`, `vi.custom`, `vi.menu.custom`, `vi.menu.bestOf(name)`, `vi.highScores.clearOf(name)`, `vi.highScores.emptyOf(name)`, `vi.highScores.tabsLabel`, `vi.gameOver.customNoSave` · `Segmented<T>`, `TuningSlider`.

- [ ] **Bước 1: Viết test thất bại**

Thêm vào `src/components/components.test.tsx`:

```ts
import { Segmented, TuningSlider } from './ui'
```

```tsx
describe('Segmented — FR-20', () => {
  const options = [
    { id: 'easy' as const, label: 'Dễ' },
    { id: 'normal' as const, label: 'Thường' },
  ]

  it('ở menu là nhóm nút bật/tắt: aria-pressed đúng một cái là true', () => {
    render(<Segmented options={options} value="normal" onChange={() => {}} label="Độ khó" />)
    expect(screen.getByRole('button', { name: 'Thường' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Dễ' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('ở bảng điểm là tab thật, không phải nút bật/tắt', () => {
    render(
      <Segmented
        options={options}
        value="easy"
        onChange={() => {}}
        label="Bảng điểm"
        variant="tablist"
        controls="p"
      />,
    )
    expect(screen.getByRole('tablist')).toBeTruthy()
    expect(screen.getByRole('tab', { selected: true })).toHaveTextContent('Dễ')
    expect(screen.getByRole('tab', { name: 'Dễ' })).toHaveAttribute('aria-controls', 'p')
  })

  it('bấm một lựa chọn gọi onChange với id của nó', () => {
    const onChange = vitestVi.fn()
    render(<Segmented options={options} value="normal" onChange={onChange} label="Độ khó" />)
    fireEvent.click(screen.getByRole('button', { name: 'Dễ' }))
    expect(onChange).toHaveBeenCalledWith('easy')
  })
})

describe('TuningSlider — FR-21 · NFR-A11Y-03', () => {
  it('giá trị hiện ra cũng đọc được cho trình đọc màn hình', () => {
    // `valueText` nằm ở <span> bên cạnh nên AT không thấy. Không có
    // aria-valuetext thì thanh UFO đọc là "10" — mà 10 nghĩa là TẮT.
    render(
      <TuningSlider
        id="ufo"
        label="UFO từ wave"
        value={10}
        valueText="tắt"
        min={1}
        max={10}
        step={1}
        onChange={() => {}}
      />,
    )
    const slider = screen.getByRole('slider', { name: 'UFO từ wave' })
    expect(slider).toHaveAttribute('aria-valuetext', 'tắt')
    expect(screen.getByText('tắt')).toBeTruthy()
  })

  it('nhãn trỏ đúng vào thanh trượt', () => {
    render(
      <TuningSlider
        id="lives"
        label="Số mạng"
        value={3}
        valueText="3"
        min={1}
        max={6}
        step={1}
        onChange={() => {}}
      />,
    )
    expect(screen.getByLabelText('Số mạng')).toHaveAttribute('id', 'lives')
  })

  it('kéo thanh trượt gọi onChange với số, không phải chuỗi', () => {
    const onChange = vitestVi.fn()
    render(
      <TuningSlider
        id="lives"
        label="Số mạng"
        value={3}
        valueText="3"
        min={1}
        max={6}
        step={1}
        onChange={onChange}
      />,
    )
    fireEvent.change(screen.getByRole('slider'), { target: { value: '5' } })
    expect(onChange).toHaveBeenCalledWith(5)
  })
})
```

- [ ] **Bước 2: Chạy test để chắc chắn nó đỏ**

Chạy: `pnpm test src/components`
Mong đợi: FAIL — `Segmented` và `TuningSlider` chưa tồn tại.

- [ ] **Bước 3: Thêm chuỗi vào `src/i18n/vi.ts`**

```ts
  difficulty: {
    label: 'Độ khó',
    easy: 'Dễ',
    normal: 'Thường',
    hard: 'Khó',
    custom: 'Tuỳ chỉnh',
  },

  custom: {
    title: 'TUỲ CHỈNH',
    startLives: 'Số mạng',
    asteroidSpeed: 'Tốc độ thiên thạch',
    dropChance: 'Tỉ lệ rơi vật phẩm',
    ufoFirstWave: 'UFO từ wave',
    ufoOff: 'tắt',
    notSaved: 'Ván tuỳ chỉnh không được ghi vào bảng điểm.',
    play: 'Chơi',
    back: 'Về menu',
  },
```

Trong `menu` thêm `custom: 'Tuỳ chỉnh'` và `bestOf: (name: string) => \`Điểm cao nhất — ${name}\``.
Trong `highScores` thêm:

```ts
    tabsLabel: 'Bảng điểm theo mức',
    clearOf: (name: string) => `Xoá bảng ${name}`,
    emptyOf: (name: string) => `Chưa có điểm nào ở mức ${name}. Chơi một ván đi.`,
```

Trong `gameOver` thêm `customNoSave: 'Ván tuỳ chỉnh không ghi vào bảng điểm.'`.

Giữ `menu.best`, `highScores.clear` và `highScores.empty` — chúng vẫn dùng cho trường hợp không có tên mức, và xoá chuỗi đang có là việc riêng.

- [ ] **Bước 4: Thêm hai component vào `src/components/ui.tsx`**

```tsx
/**
 * Dãy lựa chọn dùng chung cho hai chỗ có HAI ngữ nghĩa khác nhau:
 * - `group` (menu): nhóm nút bật/tắt — một lựa chọn để dùng SAU khi bấm Chơi.
 * - `tablist` (bảng điểm): tab thật — nó lọc ngay cái bảng bên dưới.
 * Cùng một hình, khác ngữ nghĩa, nên khác role. Đừng gộp lại thành một.
 */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  variant = 'group',
  controls,
}: {
  options: readonly { id: T; label: string }[]
  value: T
  onChange: (id: T) => void
  label: string
  variant?: 'group' | 'tablist'
  controls?: string
}) {
  const tabs = variant === 'tablist'
  return (
    <div
      role={tabs ? 'tablist' : 'group'}
      aria-label={label}
      className="grid grid-cols-3 gap-1 rounded-[10px] border border-hairline bg-surface p-1"
    >
      {options.map((option) => {
        const on = option.id === value
        return (
          <button
            key={option.id}
            type="button"
            role={tabs ? 'tab' : undefined}
            aria-selected={tabs ? on : undefined}
            aria-pressed={tabs ? undefined : on}
            aria-controls={tabs ? controls : undefined}
            onClick={() => onChange(option.id)}
            // min-h-11 = 44px — NFR-A11Y-03
            className={`min-h-11 cursor-pointer rounded-lg border text-sm font-medium tracking-wide transition-colors ${
              on
                ? 'border-primary/60 bg-primary/15 text-fg'
                : 'border-transparent bg-transparent text-muted hover:text-fg'
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

/**
 * Một núm cân bằng. `valueText` là giá trị đọc được cho người ("1.0×", "8%",
 * "tắt") và nó phải vào CẢ `aria-valuetext`: con số thô của thanh trượt nói sai
 * — 10 ở núm UFO nghĩa là TẮT, không phải wave 10.
 */
export function TuningSlider({
  id,
  label,
  value,
  valueText,
  min,
  max,
  step,
  onChange,
}: {
  id: string
  label: string
  value: number
  valueText: string
  min: number
  max: number
  step: number
  onChange: (value: number) => void
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between gap-6">
        <label htmlFor={id} className="text-xs uppercase tracking-widest text-muted">
          {label}
        </label>
        <span className="font-mono text-lg tabular-nums text-accent">{valueText}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={valueText}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-11 w-full cursor-pointer accent-primary"
      />
    </div>
  )
}
```

- [ ] **Bước 5: Chạy test**

Chạy: `pnpm test src/components && pnpm typecheck && pnpm lint`
Mong đợi: PASS.

- [ ] **Bước 6: Commit**

```bash
git add src/i18n/vi.ts src/components/ui.tsx src/components/components.test.tsx
git commit -m "feat(ui): add Segmented and TuningSlider

Segmented carries two roles on purpose: a toggle group on the menu (a
choice used later) and a real tablist on the high-score screen (it filters
the table right below). TuningSlider mirrors its readable value into
aria-valuetext, without which the UFO slider reads as 10 when 10 means off."
```

---

### Task 6: Menu và màn Tuỳ chỉnh

**Files:**

- Modify: `src/components/MenuScreen.tsx`
- Create: `src/components/CustomScreen.tsx`
- Test: `src/components/components.test.tsx`

**Interfaces:**

- Consumes: `Segmented`, `TuningSlider`, chuỗi từ Task 5; `TUNING_LIMITS`, `UFO_NEVER`, `Tuning`, `DifficultyId` từ Task 1.
- Produces: `MenuScreen` với props `{ best, difficulty, onDifficulty, onPlay, onHighScores, onHelp, onCustom }` · `CustomScreen` với props `{ tuning, onChange, onPlay, onBack }` · `tuningLabels(strings)`.

- [ ] **Bước 1: Viết test thất bại**

```tsx
import { CustomScreen } from './CustomScreen'
import { MenuScreen } from './MenuScreen'
import { DIFFICULTY, UFO_NEVER } from '@/game/core/constants'

const noop = () => {}

describe('MenuScreen — FR-20', () => {
  it('dãy ba mức nằm ở menu và mức đang chọn được đánh dấu', () => {
    render(
      <MenuScreen
        best={100}
        difficulty="hard"
        onDifficulty={noop}
        onPlay={noop}
        onHighScores={noop}
        onHelp={noop}
        onCustom={noop}
      />,
    )
    expect(screen.getByRole('button', { name: strings.difficulty.hard })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('có nút Tuỳ chỉnh, và nó KHÔNG nằm trong dãy ba mức', () => {
    render(
      <MenuScreen
        best={null}
        difficulty="normal"
        onDifficulty={noop}
        onPlay={noop}
        onHighScores={noop}
        onHelp={noop}
        onCustom={noop}
      />,
    )
    const custom = screen.getByRole('button', { name: strings.menu.custom })
    expect(custom).not.toHaveAttribute('aria-pressed')
    expect(screen.getByRole('group', { name: strings.difficulty.label })).not.toContainElement(custom)
  })

  it('dòng điểm cao nhất nói rõ nó là của mức nào', () => {
    render(
      <MenuScreen
        best={12400}
        difficulty="easy"
        onDifficulty={noop}
        onPlay={noop}
        onHighScores={noop}
        onHelp={noop}
        onCustom={noop}
      />,
    )
    expect(screen.getByText(new RegExp(strings.difficulty.easy))).toBeTruthy()
  })
})

describe('CustomScreen — FR-21', () => {
  it('bốn thanh trượt, không ba không năm', () => {
    render(<CustomScreen tuning={DIFFICULTY.normal} onChange={noop} onPlay={noop} onBack={noop} />)
    expect(screen.getAllByRole('slider')).toHaveLength(4)
  })

  it('nói trước khi chơi rằng ván này không ghi bảng điểm', () => {
    render(<CustomScreen tuning={DIFFICULTY.normal} onChange={noop} onPlay={noop} onBack={noop} />)
    expect(screen.getByText(strings.custom.notSaved)).toBeTruthy()
  })

  it('mốc cuối của núm UFO hiện là "tắt", không phải số 10', () => {
    render(
      <CustomScreen
        tuning={{ ...DIFFICULTY.normal, ufoFirstWave: UFO_NEVER }}
        onChange={noop}
        onPlay={noop}
        onBack={noop}
      />,
    )
    expect(screen.getByRole('slider', { name: strings.custom.ufoFirstWave })).toHaveAttribute(
      'aria-valuetext',
      strings.custom.ufoOff,
    )
  })

  it('tỉ lệ rơi hiện theo phần trăm, không phải 0.08', () => {
    render(<CustomScreen tuning={DIFFICULTY.normal} onChange={noop} onPlay={noop} onBack={noop} />)
    expect(screen.getByRole('slider', { name: strings.custom.dropChance })).toHaveAttribute(
      'aria-valuetext',
      '8%',
    )
  })

  it('kéo một núm gọi onChange với cả bốn số, núm kia không đổi', () => {
    const onChange = vitestVi.fn()
    render(<CustomScreen tuning={DIFFICULTY.normal} onChange={onChange} onPlay={noop} onBack={noop} />)
    fireEvent.change(screen.getByRole('slider', { name: strings.custom.startLives }), {
      target: { value: '6' },
    })
    expect(onChange).toHaveBeenCalledWith({ ...DIFFICULTY.normal, startLives: 6 })
  })
})
```

- [ ] **Bước 2: Chạy test để chắc chắn nó đỏ**

Chạy: `pnpm test src/components`
Mong đợi: FAIL — `CustomScreen` chưa tồn tại, `MenuScreen` chưa nhận props mới.

- [ ] **Bước 3: Viết `src/components/CustomScreen.tsx`**

```tsx
'use client'

import { TUNING_LIMITS, UFO_NEVER } from '@/game/core/constants'
import type { Tuning } from '@/game/core/types'
import { vi } from '@/i18n/vi'
import { Button, Panel, ScreenTitle, TuningSlider } from './ui'

/** Bốn núm, đúng thứ tự hiện ra. Cùng nguồn với `TUNING_LIMITS`. */
const KNOBS: readonly (keyof Tuning)[] = ['startLives', 'asteroidSpeed', 'dropChance', 'ufoFirstWave']

/** Số thô của thanh trượt → chuỗi người đọc được. */
function valueTextOf(knob: keyof Tuning, value: number): string {
  if (knob === 'asteroidSpeed') return `${value.toFixed(1)}×`
  if (knob === 'dropChance') return `${Math.round(value * 100)}%`
  if (knob === 'ufoFirstWave' && value >= UFO_NEVER) return vi.custom.ufoOff
  return String(value)
}

export function CustomScreen({
  tuning,
  onChange,
  onPlay,
  onBack,
}: {
  tuning: Tuning
  onChange: (tuning: Tuning) => void
  onPlay: () => void
  onBack: () => void
}) {
  return (
    <div className="h-full overflow-y-auto px-4 py-6">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-5">
        <ScreenTitle>{vi.custom.title}</ScreenTitle>

        <Panel className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-2 sm:gap-x-8">
          {KNOBS.map((knob) => (
            <TuningSlider
              key={knob}
              id={`tuning-${knob}`}
              label={vi.custom[knob]}
              value={tuning[knob]}
              valueText={valueTextOf(knob, tuning[knob])}
              min={TUNING_LIMITS[knob].min}
              max={TUNING_LIMITS[knob].max}
              step={TUNING_LIMITS[knob].step}
              onChange={(value) => onChange({ ...tuning, [knob]: value })}
            />
          ))}
        </Panel>

        {/* Nằm TRÊN nút Chơi, không ở đáy màn: người chơi phải đọc được nó
            trước khi bấm, không phải sau khi mất một ván. */}
        <p className="text-xs leading-relaxed text-muted">{vi.custom.notSaved}</p>

        <div className="flex justify-center gap-3">
          <Button onClick={onBack}>{vi.custom.back}</Button>
          <Button variant="primary" onClick={onPlay} autoFocus>
            {vi.custom.play}
          </Button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Bước 4: Sửa `src/components/MenuScreen.tsx`**

```tsx
'use client'

import type { DifficultyId } from '@/game/core/types'
import { vi } from '@/i18n/vi'
import { Button, formatScore, ScreenTitle, Segmented } from './ui'

/** Chỉ ba mức sẵn vào dãy. `custom` là NÚT, không phải lựa chọn trong dãy. */
const PRESETS = [
  { id: 'easy' as const, label: vi.difficulty.easy },
  { id: 'normal' as const, label: vi.difficulty.normal },
  { id: 'hard' as const, label: vi.difficulty.hard },
]

export function MenuScreen({
  best,
  difficulty,
  onDifficulty,
  onPlay,
  onHighScores,
  onHelp,
  onCustom,
}: {
  best: number | null
  difficulty: DifficultyId
  onDifficulty: (id: DifficultyId) => void
  onPlay: () => void
  onHighScores: () => void
  onHelp: () => void
  onCustom: () => void
}) {
  const name = vi.difficulty[difficulty === 'custom' ? 'normal' : difficulty]
  return (
    <div className="flex h-full flex-col items-center justify-center gap-8 px-6">
      <ScreenTitle>{vi.menu.title}</ScreenTitle>

      <div className="flex w-full max-w-xs flex-col gap-3">
        <Segmented
          options={PRESETS}
          value={difficulty === 'custom' ? 'normal' : difficulty}
          onChange={onDifficulty}
          label={vi.difficulty.label}
        />
        <Button variant="primary" onClick={onPlay} autoFocus>
          {vi.menu.play}
        </Button>
        <Button className="mt-2" onClick={onHighScores}>
          {vi.menu.highScores}
        </Button>
        <Button onClick={onHelp}>{vi.menu.help}</Button>
        <Button onClick={onCustom}>{vi.menu.custom}</Button>
      </div>

      <p className="font-mono text-xs uppercase tracking-widest text-muted">
        {best === null ? vi.menu.noBest : `${vi.menu.bestOf(name)}  ${formatScore(best)}`}
      </p>
    </div>
  )
}
```

- [ ] **Bước 5: Chạy test**

Chạy: `pnpm test src/components && pnpm typecheck && pnpm lint`
Mong đợi: PASS.

- [ ] **Bước 6: Commit**

```bash
git add src/components/MenuScreen.tsx src/components/CustomScreen.tsx src/components/components.test.tsx
git commit -m "feat(menu): pick a difficulty inline, tune a custom one on its own screen

The three presets sit above Play so a player who does not care still gets
into a game in one click (overview.md Non-Goal 1). Custom is the fourth
button, not a fourth preset, because it navigates rather than selects."
```

---

### Task 7: Bảng điểm ba tab

**Files:**

- Modify: `src/components/HighScoresScreen.tsx`
- Test: `src/components/components.test.tsx`

**Interfaces:**

- Consumes: `Segmented` từ Task 5.
- Produces: `HighScoresScreen` với props `{ entries, difficulty, onDifficulty, highlightAt, onBack, onClear }`.

- [ ] **Bước 1: Viết test thất bại**

```tsx
describe('bảng điểm ba tab — FR-22', () => {
  const rows: ScoreEntry[] = [{ initials: 'DUC', score: 12400, wave: 7, at: 1_757_000_000_000 }]
  const props = { highlightAt: null, onBack: noop, onClear: noop }

  it('ba tab, tab của mức đang xem được chọn', () => {
    render(<HighScoresScreen entries={rows} difficulty="hard" onDifficulty={noop} {...props} />)
    expect(screen.getAllByRole('tab')).toHaveLength(3)
    expect(screen.getByRole('tab', { selected: true })).toHaveTextContent(strings.difficulty.hard)
  })

  it('nút xoá ghi rõ nó xoá bảng nào — nó chỉ xoá tab đang mở', () => {
    render(<HighScoresScreen entries={rows} difficulty="easy" onDifficulty={noop} {...props} />)
    expect(
      screen.getByRole('button', { name: strings.highScores.clearOf(strings.difficulty.easy) }),
    ).toBeTruthy()
  })

  it('bảng trống thì nói rõ mức nào trống, và nút xoá biến mất hẳn', () => {
    render(<HighScoresScreen entries={[]} difficulty="hard" onDifficulty={noop} {...props} />)
    expect(screen.getByText(strings.highScores.emptyOf(strings.difficulty.hard))).toBeTruthy()
    expect(screen.queryByRole('button', { name: /Xoá bảng/ })).toBeNull()
  })

  it('bấm tab khác gọi onDifficulty', () => {
    const onDifficulty = vitestVi.fn()
    render(<HighScoresScreen entries={rows} difficulty="normal" onDifficulty={onDifficulty} {...props} />)
    fireEvent.click(screen.getByRole('tab', { name: strings.difficulty.hard }))
    expect(onDifficulty).toHaveBeenCalledWith('hard')
  })
})
```

- [ ] **Bước 2: Chạy test để chắc chắn nó đỏ**

Chạy: `pnpm test src/components`
Mong đợi: FAIL — `HighScoresScreen` chưa nhận `difficulty`.

- [ ] **Bước 3: Sửa `HighScoresScreen.tsx`**

Thêm vào import: `import type { DifficultyId, ScoreEntry } from '@/game/core/types'` và `Segmented` từ `./ui`. Thêm cùng danh sách `PRESETS` như `MenuScreen` (ba mức sẵn). Props thành:

```tsx
export function HighScoresScreen({
  entries,
  difficulty,
  onDifficulty,
  highlightAt,
  onBack,
  onClear,
}: {
  entries: ScoreEntry[]
  /** Mức đang xem. `custom` không có bảng nên nó không tới được màn này. */
  difficulty: Exclude<DifficultyId, 'custom'>
  onDifficulty: (id: Exclude<DifficultyId, 'custom'>) => void
  highlightAt?: number | null
  onBack: () => void
  onClear: () => void
}) {
  const name = vi.difficulty[difficulty]
```

Ngay dưới `<ScreenTitle>`, thêm dãy tab:

```tsx
<Segmented
  options={PRESETS}
  value={difficulty}
  onChange={onDifficulty}
  label={vi.highScores.tabsLabel}
  variant="tablist"
  controls="scores-panel"
/>
```

`Panel` bọc bảng và `Panel` của trạng thái trống đều thêm `id="scores-panel" role="tabpanel"`. Chuỗi trống đổi thành `vi.highScores.emptyOf(name)`, nhãn nút xoá đổi thành `vi.highScores.clearOf(name)`.

- [ ] **Bước 4: Chạy test**

Chạy: `pnpm test src/components && pnpm typecheck && pnpm lint`
Mong đợi: PASS, kể cả test cũ của `HighScoresScreen` (chúng phải được thêm prop `difficulty`/`onDifficulty` — sửa chúng, đừng đặt giá trị mặc định cho prop chỉ để test cũ khỏi phải sửa).

- [ ] **Bước 5: Commit**

```bash
git add src/components/HighScoresScreen.tsx src/components/components.test.tsx
git commit -m "feat(scores): three tabs, one per difficulty

The clear button names the table it clears because it only clears the open
tab, and an empty table says which difficulty is empty instead of showing
an unexplained blank panel."
```

---

### Task 8: Nối dây đầu-cuối

**Files:**

- Modify: `src/hooks/useGame.ts:103-107`
- Modify: `src/components/Overlays.tsx`
- Modify: `src/components/GameShell.tsx`
- Test: `src/components/components.test.tsx`

**Interfaces:**

- Consumes: mọi thứ từ Task 1-7.
- Produces: `GameActions.start(options?: NewGameOptions)` · `GameOverOverlay` thêm prop `canSave: boolean`.

- [ ] **Bước 1: Viết test thất bại**

```tsx
describe('màn Hết lượt ở ván tuỳ chỉnh — FR-21', () => {
  it('không hỏi tên và không hiện thứ hạng khi ván không ghi bảng', () => {
    render(
      <GameOverOverlay
        score={5000}
        wave={4}
        rank={1}
        canSave={false}
        onSubmit={noop}
        onPlayAgain={noop}
        onMenu={noop}
      />,
    )
    expect(screen.queryByRole('button', { name: strings.gameOver.save })).toBeNull()
    expect(screen.getByText(strings.gameOver.customNoSave)).toBeTruthy()
    expect(screen.queryByText(strings.gameOver.rank)).toBeNull()
  })

  it('ván mức sẵn thì vẫn hỏi tên như trước', () => {
    render(
      <GameOverOverlay
        score={5000}
        wave={4}
        rank={1}
        canSave
        onSubmit={noop}
        onPlayAgain={noop}
        onMenu={noop}
      />,
    )
    expect(screen.getByRole('button', { name: strings.gameOver.save })).toBeTruthy()
  })
})
```

- [ ] **Bước 2: Chạy test để chắc chắn nó đỏ**

Chạy: `pnpm test src/components`
Mong đợi: FAIL — `canSave` chưa là prop.

- [ ] **Bước 3: Sửa `Overlays.tsx`**

Thêm prop `canSave: boolean`. Điều kiện hỏi tên thành `canSave && rank !== null && !saved`. Dòng `Stat` thứ ba chỉ hiện khi `canSave`; khi `!canSave` thay bằng:

```tsx
{
  canSave ? (
    <Stat label={vi.gameOver.rank} value={rank === null ? vi.gameOver.noRank : `#${rank}`} />
  ) : (
    <p className="text-xs leading-relaxed text-muted">{vi.gameOver.customNoSave}</p>
  )
}
```

`autoFocus` của nút Chơi lại thành `autoFocus={!canSave || rank === null}`.

- [ ] **Bước 4: Sửa `useGame.ts`**

```ts
import { type NewGameOptions } from '@/game/core/state'

export interface GameActions {
  start(options?: NewGameOptions): void
  // …như cũ
}
```

```ts
const start = useCallback((options?: NewGameOptions) => {
  const state = stateRef.current
  if (!state) return
  resetForNewGame(state, options ?? {})
  setHud(hudOf(state))
}, [])
```

- [ ] **Bước 5: Sửa `GameShell.tsx`**

```tsx
import { DIFFICULTY } from '@/game/core/constants'
import type { DifficultyId, ScoreEntry, Tuning } from '@/game/core/types'
import { createLocalScoreStore, SCORE_KEYS } from '@/storage/localScoreStore'
import { createSettingsStore } from '@/storage/settingsStore'
import { CustomScreen } from './CustomScreen'
```

```tsx
const settings = useMemo(() => createSettingsStore(), [])
const [difficulty, setDifficulty] = useState<DifficultyId>('normal')
const [tuning, setTuning] = useState<Tuning>(DIFFICULTY.normal)
/** Mức của bảng đang xem. Tách khỏi `difficulty` vì xem bảng mức khác
      không có nghĩa là đổi mức sẽ chơi. */
const [table, setTable] = useState<Exclude<DifficultyId, 'custom'>>('normal')

const storeOf = useCallback(
  (id: Exclude<DifficultyId, 'custom'>) => createLocalScoreStore(undefined, SCORE_KEYS[id]),
  [],
)
```

Trong `useEffect` đọc client-only, đọc thêm settings và đặt `table` theo mức đã lưu:

```tsx
useEffect(() => {
  const saved = settings.difficulty()
  setDifficulty(saved)
  setTuning(settings.tuning())
  const t = saved === 'custom' ? 'normal' : saved
  setTable(t)
  setEntries(storeOf(t).top())
  setCoarse(isCoarsePointer())
}, [settings, storeOf])
```

`rankRef` chỉ chốt hạng khi ván ghi được bảng:

```tsx
const canSave = hud.difficulty !== 'custom'

useEffect(() => {
  if (hud.phase !== 'gameover') return
  rankRef.current = canSave
    ? storeOf(hud.difficulty as Exclude<DifficultyId, 'custom'>).rankOf(hud.score)
    : null
}, [hud.phase, hud.score, hud.difficulty, canSave, storeOf])
```

`submit` ghi vào bảng của mức **vừa chơi**, rồi mở đúng tab đó:

```tsx
const submit = (initials: string) => {
  const id = hud.difficulty as Exclude<DifficultyId, 'custom'>
  const entry: ScoreEntry = { initials, score: hud.score, wave: hud.wave, at: Date.now() }
  const store = storeOf(id)
  store.submit(entry)
  setTable(id)
  setEntries(store.top())
  setHighlightAt(entry.at)
  actions.show('highscores')
}
```

Đổi mức ở menu ghi luôn xuống storage và đổi cả bảng đang xem:

```tsx
const chooseDifficulty = (id: DifficultyId) => {
  setDifficulty(id)
  settings.setDifficulty(id)
  if (id !== 'custom') {
    setTable(id)
    setEntries(storeOf(id).top())
  }
}

const showTable = (id: Exclude<DifficultyId, 'custom'>) => {
  setTable(id)
  setEntries(storeOf(id).top())
  setHighlightAt(null)
}
```

`playing` giữ nguyên (pha `'custom'` **không** thuộc nó). Bốn chỗ render đổi theo:

```tsx
{
  hud.phase === 'menu' ? (
    <div className="relative z-10 h-full">
      <MenuScreen
        best={best}
        difficulty={difficulty}
        onDifficulty={chooseDifficulty}
        onPlay={() =>
          actions.start({ difficulty, tuning: difficulty === 'custom' ? tuning : DIFFICULTY[difficulty] })
        }
        onHighScores={() => {
          showTable(table)
          actions.show('highscores')
        }}
        onHelp={() => actions.show('help')}
        onCustom={() => actions.show('custom')}
      />
    </div>
  ) : null
}

{
  hud.phase === 'custom' ? (
    <div className="relative z-10 h-full">
      <CustomScreen
        tuning={tuning}
        onChange={(next) => {
          setTuning(next)
          settings.setTuning(next)
        }}
        onPlay={() => {
          chooseDifficulty('custom')
          actions.start({ difficulty: 'custom', tuning })
        }}
        onBack={actions.toMenu}
      />
    </div>
  ) : null
}
```

`HighScoresScreen` nhận `difficulty={table}` và `onDifficulty={showTable}`; `GameOverOverlay` nhận `canSave={canSave}`. `best` đổi thành `entries[0]?.score ?? null` như cũ (nó đã là bảng của `table`).

- [ ] **Bước 6: Chạy tất cả**

Chạy: `pnpm test && pnpm typecheck && pnpm lint && pnpm build && pnpm check:bundle`
Mong đợi: PASS, bundle vẫn ≤ 200KB gzip (`NFR-PERF-04`; mốc trước là 117 kB).

- [ ] **Bước 7: Commit**

```bash
git add src/hooks/useGame.ts src/components/GameShell.tsx src/components/Overlays.tsx src/components/components.test.tsx
git commit -m "feat(modes): wire difficulty through the shell end to end

The score table follows the difficulty of the game just played, not the one
selected in the menu, so saving from game over lands in the right table and
opens its tab. A custom game is never offered a name prompt."
```

---

### Task 9: E2E, README và đóng tài liệu

**Files:**

- Create: `e2e/modes.spec.ts`
- Modify: `e2e/game.spec.ts`
- Modify: `README.md`
- Modify: `docs/02-requirements/scope.md`, `docs/04-state/backlog.md`

**Interfaces:**

- Consumes: ứng dụng đã xong từ Task 1-8.
- Produces: không có.

- [ ] **Bước 1: Kiểm `startGame()` cũ còn đúng**

`e2e/game.spec.ts:19` bấm `getByRole('button', { name: 'Chơi', exact: true })`. Dãy mức mới **không** có nút nào tên 'Chơi', nên selector vẫn khớp đúng một phần tử. Chạy để chắc:

Chạy: `pnpm build && pnpm test:e2e`
Mong đợi: 5 cấu hình đều PASS. Nếu selector trở thành nhập nhằng, sửa `startGame()` thành `getByRole('button', { name: 'Chơi', exact: true }).first()` — **không** đổi nhãn nút.

- [ ] **Bước 2: Viết `e2e/modes.spec.ts`**

```ts
import { expect, test } from '@playwright/test'

test.describe('chọn độ khó — US-07', () => {
  test('ba mức ở menu, Thường được chọn sẵn', async ({ page }) => {
    await page.goto('/')
    const group = page.getByRole('group', { name: 'Độ khó' })
    await expect(group.getByRole('button')).toHaveCount(3)
    await expect(group.getByRole('button', { name: 'Thường' })).toHaveAttribute('aria-pressed', 'true')
  })

  test('lựa chọn mức sống qua một lần tải lại trang', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Khó', exact: true }).click()
    await page.reload()
    await expect(page.getByRole('button', { name: 'Khó', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  test('bảng điểm có ba tab', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Bảng điểm', exact: true }).click()
    await expect(page.getByRole('tab')).toHaveCount(3)
  })
})

test.describe('chế độ Tuỳ chỉnh — US-08', () => {
  test('bốn thanh trượt, và vùng bấm không nhỏ hơn 44px', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Tuỳ chỉnh', exact: true }).click()

    const sliders = page.getByRole('slider')
    await expect(sliders).toHaveCount(4)
    for (let i = 0; i < 4; i++) {
      const box = await sliders.nth(i).boundingBox()
      expect(box!.height, 'thanh trượt quá thấp — NFR-A11Y-03').toBeGreaterThanOrEqual(44)
    }
  })

  test('vào ván từ màn Tuỳ chỉnh được', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Tuỳ chỉnh', exact: true }).click()
    await expect(async () => {
      await page.getByRole('button', { name: 'Chơi', exact: true }).click({ timeout: 2000 })
      await expect(page.getByRole('button', { name: 'Tạm dừng', exact: true })).toBeVisible({ timeout: 2000 })
    }).toPass({ timeout: 15_000 })
  })
})
```

- [ ] **Bước 3: Chạy E2E**

Chạy: `pnpm build && pnpm test:e2e`
Mong đợi: PASS ở cả 5 cấu hình.

- [ ] **Bước 4: Cập nhật `README.md` §Features**

Thêm một dòng, đúng văn phong các dòng đang có:

```markdown
- Three difficulty presets plus a custom mode with four sliders, each preset keeping its own top-10 table
```

- [ ] **Bước 5: Đóng tài liệu**

- `docs/02-requirements/scope.md`: FR-20 · FR-21 · FR-22 đổi trạng thái `đang làm` → `xong`.
- `docs/04-state/backlog.md` §Đang làm: xoá khối của feature này, ghi lại đúng những gì đã xong.
- `docs/04-state/backlog.md` §Nợ kỹ thuật: thêm một dòng — số của mức Dễ và Khó là ước lượng trên giấy, chưa chơi thử; phải trả sau lần chơi thật đầu tiên, cùng lúc với dòng nợ đang có của `constants.ts`.
- Chạy `pnpm format` để Prettier canh lại các bảng markdown vừa sửa tay.

- [ ] **Bước 6: Chạy toàn bộ gate lần cuối**

Chạy: `pnpm test && pnpm typecheck && pnpm lint && pnpm build && pnpm check:bundle && pnpm test:e2e`
Mong đợi: tất cả PASS.

- [ ] **Bước 7: Commit**

```bash
git add e2e README.md docs
git commit -m "test(modes): cover difficulty selection and the custom screen end to end

Also closes FR-20 through FR-22 in scope.md and records the unplayed easy
and hard balance numbers as deliberate debt."
```

---

## Tự soát lại kế hoạch

**Phủ spec:** §1 mô hình dữ liệu → Task 1 · §2 ba mức sẵn → Task 1 · §3 Tuỳ chỉnh (biên, `UFO_NEVER`, không ghi bảng) → Task 1, 4, 6, 8 · §4 bốn chỗ đọc tuning → Task 2 · §5 lưu trữ → Task 3, 4 · §6 UI và a11y → Task 5, 6, 7 · §7 test → rải trong mọi task, E2E ở Task 9 · §8 không làm → không có task nào, đúng như vậy.

**Tên gọi khớp giữa các task:** `Tuning` · `DifficultyId` · `NewGameOptions` · `DIFFICULTY` · `TUNING_LIMITS` · `UFO_NEVER` · `SCORE_KEYS` · `createSettingsStore` · `clampTuning` · `Segmented` · `TuningSlider` · `waveSpeedFactor(wave, speedMul)` — dùng đúng một tên ở mọi chỗ.

**Chỗ dễ sai nhất, đã có test riêng chặn:** thứ tự trần/nhân trong `waveSpeedFactor` (Task 2, bước 1) · `DIFFICULTY.normal` phải bằng hằng số cũ (Task 1) · khoá mức Thường không đổi (Task 3) · `hudEquals` phải so `difficulty` (Task 1) · bảng điểm ghi theo mức **vừa chơi** chứ không phải mức đang chọn ở menu (Task 8).
