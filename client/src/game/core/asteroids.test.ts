import { describe, expect, it } from 'vitest'
import { createAsteroid, waveSpeedFactor } from './asteroids'
import { ASTEROID, ASTEROID_SCORE, FIXED_DT, WAVE } from './constants'
import { step } from './step'
import { waveAsteroidCount } from './spawn'
import type { AsteroidSize, GameState } from './types'
import { shortestDeltaX, shortestDeltaY } from './vector'
import { bulletAt, freezeWaves, IDLE, newGame, run } from './testkit'

/** Bắn vỡ đúng một thiên thạch cấp `size` tại (400, 400); trả về số điểm ăn được. */
function shootOne(state: GameState, size: AsteroidSize): number {
  state.asteroids.length = 0
  state.bullets.length = 0
  const a = createAsteroid(state, 400, 400, size, 1)
  a.vx = 0
  a.vy = 0
  state.asteroids.push(a)
  state.bullets.push(bulletAt(400, 400))

  const before = state.score
  step(state, IDLE, FIXED_DT)
  return state.score - before
}

describe('vỡ thiên thạch — FR-04', () => {
  it('to → 2 vừa → 2 nhỏ → hết, mỗi cấp một mức điểm', () => {
    const state = newGame(101)
    step(state, IDLE, FIXED_DT)
    state.waveClearMs = Number.MAX_SAFE_INTEGER

    expect(shootOne(state, 'large')).toBe(ASTEROID_SCORE.large)
    expect(state.asteroids.length).toBe(ASTEROID.childCount)
    expect(state.asteroids.every((a) => a.size === 'medium')).toBe(true)

    expect(shootOne(state, 'medium')).toBe(ASTEROID_SCORE.medium)
    expect(state.asteroids.length).toBe(ASTEROID.childCount)
    expect(state.asteroids.every((a) => a.size === 'small')).toBe(true)

    expect(shootOne(state, 'small')).toBe(ASTEROID_SCORE.small)
    expect(state.asteroids.length).toBe(0)
  })

  it('viên đạn thường tắt sau khi trúng, không ăn tiếp mảnh con trong cùng bước', () => {
    const state = newGame(102)
    step(state, IDLE, FIXED_DT)
    state.waveClearMs = Number.MAX_SAFE_INTEGER
    shootOne(state, 'large')
    expect(state.bullets.length).toBe(0)
  })

  it('đạn xuyên đi tiếp nhưng vẫn không ăn mảnh con của chính nó', () => {
    const state = newGame(103)
    step(state, IDLE, FIXED_DT)
    freezeWaves(state)
    state.bullets.length = 0

    const a = createAsteroid(state, 400, 400, 'large', 1)
    a.vx = 0
    a.vy = 0
    state.asteroids.push(a)
    const b = bulletAt(400, 400)
    b.pierce = true
    state.bullets.push(b)

    step(state, IDLE, FIXED_DT)
    expect(state.bullets.length).toBe(1)
    expect(state.score).toBe(ASTEROID_SCORE.large)
    expect(state.asteroids.length).toBe(ASTEROID.childCount)
  })

  it('hình đa giác sinh một lần và không đổi khi thiên thạch trôi', () => {
    const state = newGame(104)
    step(state, IDLE, FIXED_DT)
    const shape = state.asteroids[0]!.shape
    const copy = [...shape]
    run(state, 120)
    expect(state.asteroids[0]!.shape).toEqual(copy)
    expect(copy.length).toBeGreaterThanOrEqual(ASTEROID.minVertices)
    expect(copy.length).toBeLessThanOrEqual(ASTEROID.maxVertices)
  })
})

describe('sinh wave — FR-06', () => {
  it('wave n có min(2 + n, 11) thiên thạch to', () => {
    expect(waveAsteroidCount(1)).toBe(3)
    expect(waveAsteroidCount(2)).toBe(4)
    expect(waveAsteroidCount(9)).toBe(11)
    expect(waveAsteroidCount(50)).toBe(WAVE.maxCount)
  })

  it('ván mới sinh wave 1 ngay ở bước đầu tiên', () => {
    const state = newGame(105)
    expect(state.wave).toBe(0)
    step(state, IDLE, FIXED_DT)
    expect(state.wave).toBe(1)
    expect(state.asteroids.length).toBe(3)
    expect(state.asteroids.every((a) => a.size === 'large')).toBe(true)
  })

  it('wave sau chỉ tới khi hết khoảng nghỉ 1.5 giây', () => {
    const state = newGame(106)
    step(state, IDLE, FIXED_DT)
    state.asteroids.length = 0

    run(state, Math.floor(WAVE.clearDelayMs / 1000 / FIXED_DT) - 1)
    expect(state.wave).toBe(1)

    run(state, 2)
    expect(state.wave).toBe(2)
    expect(state.asteroids.length).toBe(4)
  })

  it('wave 1 không đặt thiên thạch nào đè lên tàu', () => {
    for (let seed = 1; seed <= 30; seed++) {
      const state = newGame(seed)
      step(state, IDLE, FIXED_DT)
      for (const a of state.asteroids) {
        // Khoảng cách CÓ WRAP, không phải hiệu toạ độ — bất biến #5.
        const dx = shortestDeltaX(state.ship.x, a.x)
        const dy = shortestDeltaY(state.ship.y, a.y)
        expect(Math.hypot(dx, dy)).toBeGreaterThanOrEqual(WAVE.safeRadius)
      }
    }
  })

  it('hệ số tốc độ tăng 6% mỗi wave và dừng ở trần 1.8', () => {
    expect(waveSpeedFactor(1, 1)).toBe(1)
    expect(waveSpeedFactor(2, 1)).toBeCloseTo(1.06)
    expect(waveSpeedFactor(11, 1)).toBeCloseTo(1.6)
    expect(waveSpeedFactor(50, 1)).toBe(WAVE.maxSpeedFactor)
  })
})
