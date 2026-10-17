import { describe, expect, it } from 'vitest'
import { createAsteroid } from './asteroids'
import { FIXED_DT, SHIP, WORLD_H, WORLD_W } from './constants'
import { step } from './step'
import type { AsteroidSize, GameState } from './types'
import { freezeWaves, IDLE, input, newGame, run, steps } from './testkit'

const HYPER = input({ hyperspace: true })

/** Đặt một thiên thạch đứng yên đúng chỗ đã cho. */
function placeAsteroid(state: GameState, x: number, y: number, size: AsteroidSize = 'small'): void {
  const a = createAsteroid(state, x, y, size, 1)
  a.vx = 0
  a.vy = 0
  state.asteroids.push(a)
}

/** Ván đang chạy, màn hình sạch, tàu đứng yên và đã hết bất tử. */
function cleanRun(seed: number): GameState {
  const state = newGame(seed)
  step(state, IDLE, FIXED_DT)
  freezeWaves(state)
  state.ship.vx = 0
  state.ship.vy = 0
  state.ship.invulnMs = 0
  return state
}

describe('va chạm có wrap — bất biến #5', () => {
  it('tàu ở x = 5 và thiên thạch ở x = WORLD_W − 5 là có chạm', () => {
    const state = cleanRun(301)
    state.ship.x = 5
    state.ship.y = 600
    placeAsteroid(state, WORLD_W - 5, 600)

    step(state, IDLE, FIXED_DT)
    expect(state.lives).toBe(2)
    expect(state.ship.alive).toBe(false)
  })

  it('cách 40 đơn vị — hơn tổng hai bán kính — thì không chạm, dù cũng vắt qua mép', () => {
    const state = cleanRun(302)
    state.ship.x = 5
    state.ship.y = 600
    placeAsteroid(state, WORLD_W - 35, 600)

    step(state, IDLE, FIXED_DT)
    expect(state.lives).toBe(3)
    expect(state.ship.alive).toBe(true)
  })

  it('đạn bắn trúng thiên thạch nằm bên kia mép dọc', () => {
    const state = cleanRun(303)
    state.bullets.length = 0
    placeAsteroid(state, 400, WORLD_H - 5, 'small')
    state.bullets.push({
      x: 400,
      y: 5,
      vx: 0,
      vy: 0,
      r: 3,
      lifeMs: 500,
      pierce: false,
      fromUfo: false,
    })

    step(state, IDLE, FIXED_DT)
    expect(state.asteroids.length).toBe(0)
    expect(state.score).toBe(100)
  })
})

describe('mất mạng và hồi sinh — FR-05', () => {
  it('giảm mạng, mất power-up, giữ điểm, rồi hồi sinh trong trạng thái bất tử', () => {
    const state = cleanRun(304)
    state.score = 1234
    state.ship.weapon = 'rapid'
    state.ship.weaponMs = 8000
    state.ship.x = 400
    state.ship.y = 400
    placeAsteroid(state, 400, 400)

    step(state, IDLE, FIXED_DT)
    expect(state.lives).toBe(2)
    expect(state.ship.alive).toBe(false)
    expect(state.ship.weapon).toBeNull()
    expect(state.ship.shield).toBe(false)
    // Điểm không bị xoá khi chết; thiên thạch húc vào tàu cũng vỡ nên vẫn được
    // tính 100 điểm như bắn trúng.
    expect(state.score).toBe(1234 + 100)
    expect(state.shakeMs).toBeGreaterThan(0)

    run(state, steps(SHIP.respawnMs / 1000))
    expect(state.ship.alive).toBe(true)
    expect(state.ship.invulnMs).toBeGreaterThan(0)
    expect(state.ship.x).toBeCloseTo(WORLD_W / 2)
    expect(state.ship.y).toBeCloseTo(WORLD_H / 2)
    expect(state.ship.vx).toBe(0)
    expect(state.ship.vy).toBe(0)
  })

  it('hết mạng cuối thì chuyển sang pha gameover', () => {
    const state = cleanRun(305)
    state.lives = 1
    placeAsteroid(state, state.ship.x, state.ship.y)

    step(state, IDLE, FIXED_DT)
    expect(state.lives).toBe(0)
    expect(state.phase).toBe('gameover')
  })

  it('tàu đang bất tử bay xuyên thiên thạch, và không phá nó', () => {
    const state = cleanRun(306)
    state.ship.invulnMs = 1000
    placeAsteroid(state, state.ship.x, state.ship.y)

    step(state, IDLE, FIXED_DT)
    expect(state.lives).toBe(3)
    expect(state.asteroids.length).toBe(1)
    expect(state.score).toBe(0)
  })
})

describe('khiên — ADR-0004', () => {
  it('hấp thụ đúng một va chạm rồi biến mất', () => {
    const state = cleanRun(307)
    state.ship.shield = true
    placeAsteroid(state, state.ship.x, state.ship.y)

    step(state, IDLE, FIXED_DT)
    expect(state.ship.shield).toBe(false)
    expect(state.lives).toBe(3)
    expect(state.ship.alive).toBe(true)
    expect(state.asteroids.length).toBe(0)

    // Va chạm thứ hai, sau khi hết bất tử tạm, lấy mạng như bình thường.
    run(state, steps(SHIP.invulnMs / 1000))
    state.asteroids.length = 0
    placeAsteroid(state, state.ship.x, state.ship.y)
    step(state, IDLE, FIXED_DT)
    expect(state.lives).toBe(2)
  })
})

describe('hyperspace — ADR-0005', () => {
  it('dịch chuyển, xoá vận tốc, và khoá lại 5 giây', () => {
    const state = cleanRun(308)
    state.ship.invulnMs = Number.MAX_SAFE_INTEGER
    state.ship.vx = 300
    state.ship.vy = -200
    const x0 = state.ship.x
    const y0 = state.ship.y

    step(state, HYPER, FIXED_DT)
    expect(state.ship.x !== x0 || state.ship.y !== y0).toBe(true)
    expect(state.ship.vx).toBe(0)
    expect(state.ship.vy).toBe(0)
    expect(state.ship.hyperMs).toBeCloseTo(SHIP.hyperCooldownMs - FIXED_DT * 1000, 6)

    // Trong lúc cooldown thì bấm mấy cũng không đi đâu.
    const x1 = state.ship.x
    const y1 = state.ship.y
    run(state, 30, HYPER)
    expect(state.ship.x).toBe(x1)
    expect(state.ship.y).toBe(y1)

    // Hết cooldown thì lại dùng được.
    run(state, steps(SHIP.hyperCooldownMs / 1000))
    expect(state.ship.hyperMs).toBe(0)
    step(state, HYPER, FIXED_DT)
    expect(state.ship.x !== x1 || state.ship.y !== y1).toBe(true)
  })
})

describe('quán tính và trần tốc độ — FR-02', () => {
  it('đẩy đủ lâu thì tốc độ dừng ở trần, không vượt', () => {
    const state = cleanRun(309)
    state.ship.invulnMs = Number.MAX_SAFE_INTEGER
    run(state, steps(10), input({ thrust: true }))
    expect(Math.hypot(state.ship.vx, state.ship.vy)).toBeLessThanOrEqual(SHIP.maxSpeed + 1e-6)
  })

  it('nhả nút đẩy thì ma sát kéo tốc độ về gần 0', () => {
    const state = cleanRun(310)
    state.ship.invulnMs = Number.MAX_SAFE_INTEGER
    run(state, steps(2), input({ thrust: true }))
    const fast = Math.hypot(state.ship.vx, state.ship.vy)
    expect(fast).toBeGreaterThan(100)

    run(state, steps(20))
    expect(Math.hypot(state.ship.vx, state.ship.vy)).toBeLessThan(1)
  })

  it('kết quả không phụ thuộc số bước: 1 bước 0.1s ≈ 6 bước 1/60s', () => {
    const a = cleanRun(311)
    const b = cleanRun(311)
    a.ship.invulnMs = Number.MAX_SAFE_INTEGER
    b.ship.invulnMs = Number.MAX_SAFE_INTEGER

    const thrust = input({ thrust: true })
    run(a, 60, thrust)
    for (let i = 0; i < 6; i++) step(b, thrust, 10 / 60)
    // Còn sai số tích phân Euler, nhưng cùng bậc — nếu hằng số tính theo frame thì
    // hai con số này lệch nhau cả chục lần chứ không phải vài phần trăm (bất biến #3).
    const fine = Math.hypot(a.ship.vx, a.ship.vy)
    const coarse = Math.hypot(b.ship.vx, b.ship.vy)
    expect(fine).toBeGreaterThan(coarse * 0.9)
    expect(fine).toBeLessThan(coarse * 1.15)
  })
})
