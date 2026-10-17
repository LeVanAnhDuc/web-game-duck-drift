import { describe, expect, it } from 'vitest'
import { BULLET, FIXED_DT } from './constants'
import { step } from './step'
import { freezeWaves, IDLE, input, newGame, run, steps } from './testkit'

const FIRE = input({ fire: true })

describe('trần số đạn — FR-03', () => {
  it('giữ nút bắn thì tối đa 4 viên trên màn', () => {
    const state = newGame(201)
    step(state, IDLE, FIXED_DT)
    freezeWaves(state)

    let peak = 0
    for (let i = 0; i < steps(1); i++) {
      step(state, FIRE, FIXED_DT)
      peak = Math.max(peak, state.bullets.length)
      expect(state.bullets.length).toBeLessThanOrEqual(BULLET.maxOnScreen)
    }
    expect(peak).toBe(BULLET.maxOnScreen)
  })

  it('bắn toả nới trần lên 9 và không vượt qua', () => {
    const state = newGame(202)
    step(state, IDLE, FIXED_DT)
    freezeWaves(state)
    state.ship.weapon = 'spread'
    state.ship.weaponMs = 60000

    let peak = 0
    for (let i = 0; i < steps(1); i++) {
      step(state, FIRE, FIXED_DT)
      peak = Math.max(peak, state.bullets.length)
      expect(state.bullets.length).toBeLessThanOrEqual(BULLET.maxOnScreenBoosted)
    }
    expect(peak).toBe(BULLET.maxOnScreenBoosted)
  })

  it('bắn nhanh rút nhịp bắn xuống một nửa', () => {
    const state = newGame(203)
    step(state, IDLE, FIXED_DT)
    freezeWaves(state)
    state.ship.weapon = 'rapid'
    state.ship.weaponMs = 60000

    step(state, FIRE, FIXED_DT)
    expect(state.ship.cooldownMs).toBeCloseTo(BULLET.cooldownMs * BULLET.rapidFactor - FIXED_DT * 1000, 6)
  })

  it('đạn xuyên KHÔNG nới trần — chỉ bắn nhanh và bắn toả mới nới', () => {
    const state = newGame(204)
    step(state, IDLE, FIXED_DT)
    freezeWaves(state)
    state.ship.weapon = 'pierce'
    state.ship.weaponMs = 60000

    for (let i = 0; i < steps(1); i++) {
      step(state, FIRE, FIXED_DT)
      expect(state.bullets.length).toBeLessThanOrEqual(BULLET.maxOnScreen)
    }
  })
})

describe('tuổi thọ đạn — FR-03', () => {
  it('viên đạn biến mất sau đúng 1.2 giây', () => {
    const state = newGame(205)
    step(state, IDLE, FIXED_DT)
    freezeWaves(state)

    step(state, FIRE, FIXED_DT)
    expect(state.bullets.length).toBe(1)

    run(state, Math.floor(BULLET.lifeMs / 1000 / FIXED_DT - 2))
    expect(state.bullets.length).toBe(1)

    run(state, 3)
    expect(state.bullets.length).toBe(0)
  })

  it('đạn ra ở mũi tàu, theo đúng hướng tàu đang chỉ — bất biến #6', () => {
    const state = newGame(206)
    step(state, IDLE, FIXED_DT)
    freezeWaves(state)
    state.ship.angle = 0 // hướng lên

    step(state, FIRE, FIXED_DT)
    const b = state.bullets[0]!
    expect(b.vy).toBeLessThan(0)
    expect(Math.abs(b.vx)).toBeLessThan(1)
    expect(b.y).toBeLessThan(state.ship.y)
  })
})
