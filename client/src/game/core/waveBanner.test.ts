import { describe, expect, it } from 'vitest'
import { WAVE } from './constants'
import { createGameState, resetForNewGame } from './state'
import { step } from './step'
import { NEUTRAL_INPUT } from './state'
import { FIXED_DT } from './constants'

const run = (state: ReturnType<typeof createGameState>, steps: number) => {
  for (let i = 0; i < steps; i++) step(state, { ...NEUTRAL_INPUT }, FIXED_DT)
  return state
}

/**
 * Bug đã gặp trên app chạy thật: banner "WAVE 1" hiện mãi không tắt. Nguyên nhân
 * là `waveClearMs` gánh hai việc — nó chỉ đếm ngược khi màn đã sạch thiên thạch,
 * mà `spawnWave` lại nạp lại nó, nên trong suốt một wave nó đứng nguyên ở 1500.
 * Test này khoá việc hai đồng hồ phải tách nhau.
 */
describe('đồng hồ banner tách khỏi đồng hồ chuyển wave', () => {
  it('banner được nạp khi wave bắt đầu', () => {
    const state = createGameState(1)
    resetForNewGame(state)
    run(state, 1)

    expect(state.wave).toBe(1)
    expect(state.asteroids.length).toBeGreaterThan(0)
    expect(state.waveBannerMs).toBeGreaterThan(0)
  })

  it('banner hết hạn trong lúc wave vẫn đang chạy — màn còn đầy thiên thạch', () => {
    const state = createGameState(1)
    resetForNewGame(state)
    run(state, 1)

    // Chạy quá thời lượng banner một chút.
    run(state, Math.ceil(WAVE.bannerMs / (FIXED_DT * 1000)) + 5)

    expect(state.waveBannerMs).toBe(0)
    expect(state.asteroids.length).toBeGreaterThan(0)
    expect(state.wave).toBe(1)
  })

  it('đồng hồ chuyển wave vẫn nguyên giá trị trong lúc còn thiên thạch', () => {
    const state = createGameState(1)
    resetForNewGame(state)
    run(state, 120)

    expect(state.waveClearMs).toBe(WAVE.clearDelayMs)
  })

  it('bắn sạch thiên thạch thì đồng hồ chuyển wave mới chạy, và banner nạp lại ở wave sau', () => {
    const state = createGameState(1)
    resetForNewGame(state)
    run(state, 1)
    state.asteroids.length = 0

    const stepsForDelay = Math.ceil(WAVE.clearDelayMs / (FIXED_DT * 1000)) + 1
    run(state, stepsForDelay)

    expect(state.wave).toBe(2)
    expect(state.waveBannerMs).toBeGreaterThan(0)
  })
})
