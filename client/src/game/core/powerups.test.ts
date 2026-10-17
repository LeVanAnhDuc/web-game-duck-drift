import { describe, expect, it } from 'vitest'
import { FIXED_DT, POWERUP } from './constants'
import { applyPowerUp, pickKind } from './powerups'
import { createRng } from './rng'
import { step } from './step'
import type { GameState, PowerUpKind } from './types'
import { freezeWaves, IDLE, newGame, run, steps } from './testkit'

function cleanRun(seed: number): GameState {
  const state = newGame(seed)
  step(state, IDLE, FIXED_DT)
  freezeWaves(state)
  state.ship.invulnMs = Number.MAX_SAFE_INTEGER
  return state
}

function dropOn(state: GameState, kind: PowerUpKind): void {
  state.powerUps.push({
    x: state.ship.x,
    y: state.ship.y,
    vx: 0,
    vy: 0,
    r: POWERUP.radius,
    kind,
    lifeMs: POWERUP.lifeMs,
  })
}

describe('khe vũ khí — ADR-0004', () => {
  it('nhặt loại khác thì THAY loại đang có và đặt lại đồng hồ', () => {
    const state = cleanRun(401)
    applyPowerUp(state, 'rapid')
    run(state, steps(4))
    expect(state.ship.weapon).toBe('rapid')
    const worn = state.ship.weaponMs
    expect(worn).toBeLessThan(POWERUP.effectMs)

    applyPowerUp(state, 'spread')
    expect(state.ship.weapon).toBe('spread')
    expect(state.ship.weaponMs).toBe(POWERUP.effectMs)
    expect(state.ship.weaponMs).toBeGreaterThan(worn)
  })

  it('nhặt trùng loại thì cộng dồn thời gian, trần 20 giây', () => {
    const state = cleanRun(402)
    applyPowerUp(state, 'pierce')
    expect(state.ship.weaponMs).toBe(POWERUP.effectMs)

    applyPowerUp(state, 'pierce')
    expect(state.ship.weaponMs).toBe(POWERUP.maxEffectMs)

    applyPowerUp(state, 'pierce')
    expect(state.ship.weaponMs).toBe(POWERUP.maxEffectMs)
    expect(state.ship.weapon).toBe('pierce')
  })

  it('hết giờ thì khe vũ khí trống lại', () => {
    const state = cleanRun(403)
    applyPowerUp(state, 'rapid')
    run(state, steps(POWERUP.effectMs / 1000))
    expect(state.ship.weapon).toBeNull()
    expect(state.ship.weaponMs).toBe(0)
  })

  it('khiên và mạng không đụng vào khe vũ khí', () => {
    const state = cleanRun(404)
    applyPowerUp(state, 'spread')
    applyPowerUp(state, 'shield')
    applyPowerUp(state, 'life')

    expect(state.ship.weapon).toBe('spread')
    expect(state.ship.weaponMs).toBe(POWERUP.effectMs)
    expect(state.ship.shield).toBe(true)
    expect(state.lives).toBe(4)
  })
})

describe('nhặt và hết hạn', () => {
  it('bay vào là nhặt được, kể cả khi đang bất tử', () => {
    const state = cleanRun(405)
    dropOn(state, 'shield')
    step(state, IDLE, FIXED_DT)
    expect(state.powerUps.length).toBe(0)
    expect(state.ship.shield).toBe(true)
  })

  it('không nhặt thì biến mất sau 10 giây', () => {
    const state = cleanRun(406)
    state.powerUps.push({
      x: 100,
      y: 100,
      vx: 0,
      vy: 0,
      r: POWERUP.radius,
      kind: 'rapid',
      lifeMs: POWERUP.lifeMs,
    })
    run(state, steps(POWERUP.lifeMs / 1000 - 1))
    expect(state.powerUps.length).toBe(1)
    run(state, steps(1.1))
    expect(state.powerUps.length).toBe(0)
  })
})

describe('bốc loại power-up', () => {
  it('`life` chiếm đúng 1/12 số lần rơi', () => {
    const rng = createRng(4242)
    const counts: Record<string, number> = {}
    const draws = 120000
    for (let i = 0; i < draws; i++) {
      const kind = pickKind(rng)
      counts[kind] = (counts[kind] ?? 0) + 1
    }
    expect((counts.life ?? 0) / draws).toBeCloseTo(1 / 12, 2)
    expect((counts.shield ?? 0) / draws).toBeCloseTo(3 / 12, 2)
    expect((counts.pierce ?? 0) / draws).toBeCloseTo(2 / 12, 2)
  })
})
