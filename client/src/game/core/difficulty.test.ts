import { describe, expect, it } from 'vitest'
import { breakAsteroid, waveSpeedFactor } from './asteroids'
import { DIFFICULTY, FIXED_DT, POWERUP, SCORING, TUNING_LIMITS, UFO, UFO_NEVER, WAVE } from './constants'
import { createGameState, hudEquals, hudOf, resetForNewGame } from './state'
import { step } from './step'
import { freezeWaves, IDLE, newGame, run, steps } from './testkit'
import type { GameState, Tuning } from './types'

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
      for (const key of Object.keys(TUNING_LIMITS) as (keyof Tuning)[]) {
        expect(tuning[key]).toBeGreaterThanOrEqual(TUNING_LIMITS[key].min)
        expect(tuning[key]).toBeLessThanOrEqual(TUNING_LIMITS[key].max)
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
    const speedOf = (state: GameState) =>
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
