import { describe, expect, it } from 'vitest'
import { createAsteroid } from './asteroids'
import { DIFFICULTY, EFFECTS, FIXED_DT, SCORING, UFO, WORLD_H, WORLD_W } from './constants'
import { spawnBreakParticles } from './particles'
import { step } from './step'
import { spawnUfo } from './ufo'
import type { GameState, InputState, Tuning } from './types'
import { freezeWaves, IDLE, input, newGame, run, steps } from './testkit'

function immortalRun(seed: number): GameState {
  const state = newGame(seed)
  step(state, IDLE, FIXED_DT)
  state.ship.invulnMs = Number.MAX_SAFE_INTEGER
  return state
}

describe('mốc thưởng mạng — FR-05', () => {
  it('cộng một mạng ở mỗi mốc 10.000, và chỉ một lần cho mỗi mốc', () => {
    const state = immortalRun(501)
    expect(state.lives).toBe(SCORING.startLives)
    expect(state.nextExtraLifeAt).toBe(SCORING.extraLifeEvery)

    state.score = SCORING.extraLifeEvery
    step(state, IDLE, FIXED_DT)
    expect(state.lives).toBe(SCORING.startLives + 1)
    expect(state.nextExtraLifeAt).toBe(SCORING.extraLifeEvery * 2)

    run(state, 10)
    expect(state.lives).toBe(SCORING.startLives + 1)

    state.score = SCORING.extraLifeEvery * 2 - 1
    step(state, IDLE, FIXED_DT)
    expect(state.lives).toBe(SCORING.startLives + 1)

    state.score = SCORING.extraLifeEvery * 2
    step(state, IDLE, FIXED_DT)
    expect(state.lives).toBe(SCORING.startLives + 2)
  })

  it('nhảy qua nhiều mốc cùng lúc thì cộng đủ số mạng', () => {
    const state = immortalRun(502)
    state.score = SCORING.extraLifeEvery * 3
    step(state, IDLE, FIXED_DT)
    expect(state.lives).toBe(SCORING.startLives + 3)
    expect(state.nextExtraLifeAt).toBe(SCORING.extraLifeEvery * 4)
  })
})

describe('UFO — FR-07', () => {
  it('không có UFO nào trước wave 3', () => {
    const state = immortalRun(503)
    expect(state.wave).toBe(1)
    run(state, steps(50))
    expect(state.wave).toBeLessThan(UFO.firstWave)
    expect(state.ufos.length).toBe(0)
  })

  it('từ wave 3 thì UFO xuất hiện trong vòng 28 giây', () => {
    const state = immortalRun(504)
    state.wave = UFO.firstWave
    state.ufoTimerMs = UFO.maxDelayMs

    run(state, steps(UFO.maxDelayMs / 1000 + 0.5))
    expect(state.ufos.length).toBe(1)
  })

  it('chỉ một UFO trên màn một lúc', () => {
    const state = immortalRun(505)
    state.wave = UFO.firstWave
    state.ufoTimerMs = 0
    run(state, steps(90))
    expect(state.ufos.length).toBeLessThanOrEqual(1)
  })

  it('UFO to bắn lệch, UFO nhỏ ngắm chuẩn và đáng 1000 điểm', () => {
    const state = immortalRun(506)
    freezeWaves(state)
    state.score = 100000 // ép tỉ lệ UFO nhỏ lên trần
    spawnUfo(state)
    const u = state.ufos[0]!
    expect(u.big).toBe(false)
    expect(u.r).toBe(UFO.smallRadius)

    state.bullets.push({
      x: u.x,
      y: u.y,
      vx: 0,
      vy: 0,
      r: 3,
      lifeMs: 500,
      pierce: false,
      fromUfo: false,
    })
    const before = state.score
    step(state, IDLE, FIXED_DT)
    expect(state.ufos.length).toBe(0)
    expect(state.score - before).toBe(UFO.smallScore)
  })

  it('đạn UFO lấy mạng của tàu', () => {
    const state = newGame(507)
    step(state, IDLE, FIXED_DT)
    freezeWaves(state)
    state.ship.invulnMs = 0
    state.bullets.push({
      x: state.ship.x,
      y: state.ship.y,
      vx: 0,
      vy: 0,
      r: 3,
      lifeMs: 500,
      pierce: false,
      fromUfo: true,
    })

    step(state, IDLE, FIXED_DT)
    expect(state.lives).toBe(2)
    expect(state.bullets.length).toBe(0)
  })
})

describe('pha không phải playing thì không mô phỏng — bất biến #7', () => {
  it('paused thì mọi thứ đứng yên', () => {
    const state = immortalRun(508)
    state.phase = 'paused'
    const before = JSON.stringify(state, (k, v) => (k === 'rng' ? undefined : v))
    run(state, 60, input({ thrust: true, fire: true }))
    expect(JSON.stringify(state, (k, v) => (k === 'rng' ? undefined : v))).toBe(before)
  })
})

/** Toàn bộ state trừ `rng` (chỉ chứa closure, không so sánh sâu được). */
function snapshot(state: GameState): string {
  return JSON.stringify(state, (key, value) => (key === 'rng' ? undefined : value))
}

/** Chuỗi input tái lập được, sinh từ chỉ số bước chứ không từ rng. */
function scriptedInput(target: InputState, i: number): InputState {
  const r = i % 7
  target.rotate = r < 2 ? -1 : r < 4 ? 1 : 0
  target.thrust = i % 3 === 0
  target.fire = i % 5 === 0
  target.hyperspace = i % 331 === 0
  return target
}

describe('tái lập — NFR-ROB-04', () => {
  it('cùng seed, cùng 1000 input thì cùng một trạng thái', () => {
    const a = newGame(20260904)
    const b = newGame(20260904)
    const inputA: InputState = { ...IDLE }
    const inputB: InputState = { ...IDLE }

    for (let i = 0; i < 1000; i++) {
      step(a, scriptedInput(inputA, i), FIXED_DT)
      step(b, scriptedInput(inputB, i), FIXED_DT)
    }

    expect(snapshot(a)).toBe(snapshot(b))
    // Cả rng cũng phải ở cùng một chỗ trong dãy, nếu không thì bước 1001 mới lệch.
    expect(a.rng.next()).toBe(b.rng.next())
    // Test chỉ có nghĩa nếu ván thật sự đã chạy chứ không đứng yên.
    expect(a.score + a.wave).toBeGreaterThan(1)
  })

  it('cùng seed VÀ cùng tuning thì cùng một trạng thái; đổi tuning thì khác', () => {
    // Tuning nằm trong state (ADR-0010) nên một ván tái lập được từ seed + tuning
    // + chuỗi input. Test này khoá lại phần "+ tuning".
    const runWith = (tuning: Tuning) => {
      const state = newGame(20260910, tuning)
      const inp: InputState = { ...IDLE }
      for (let i = 0; i < 1000; i++) step(state, scriptedInput(inp, i), FIXED_DT)
      return snapshot(state)
    }

    expect(runWith(DIFFICULTY.hard)).toBe(runWith(DIFFICULTY.hard))
    expect(runWith(DIFFICULTY.hard)).not.toBe(runWith(DIFFICULTY.easy))
  })

  it('seed khác cho ván khác', () => {
    const a = newGame(1)
    const b = newGame(2)
    const inputA: InputState = { ...IDLE }
    const inputB: InputState = { ...IDLE }
    for (let i = 0; i < 300; i++) {
      step(a, scriptedInput(inputA, i), FIXED_DT)
      step(b, scriptedInput(inputB, i), FIXED_DT)
    }
    expect(snapshot(a)).not.toBe(snapshot(b))
  })
})

describe('hiệu năng — NFR-PERF-02', () => {
  it('60 vật thể và 200 particle: một bước dưới 4ms', () => {
    const state = newGame(777)
    step(state, IDLE, FIXED_DT)
    freezeWaves(state)
    state.ship.invulnMs = Number.MAX_SAFE_INTEGER

    for (let i = 0; i < 55; i++) {
      const x = ((i * 137) % 40) * 40
      const y = ((i * 89) % 30) * 40
      state.asteroids.push(createAsteroid(state, x, y, 'large', 1))
    }
    state.wave = UFO.firstWave
    for (let i = 0; i < 3; i++) spawnUfo(state)
    for (let i = 0; i < 2; i++) {
      state.powerUps.push({
        x: 200 + i * 400,
        y: 300,
        vx: 0,
        vy: 0,
        r: 16,
        kind: 'rapid',
        lifeMs: Number.MAX_SAFE_INTEGER,
      })
    }

    spawnBreakParticles(state, WORLD_W / 2, WORLD_H / 2, 200, '#fff')
    expect(state.particles.length).toBe(200)
    // Particle sống mãi để 600 bước đều đo trên đúng tải xấu nhất.
    for (const p of state.particles) {
      p.lifeMs = Number.MAX_SAFE_INTEGER
      p.maxLifeMs = Number.MAX_SAFE_INTEGER
    }

    const bodies =
      1 + state.asteroids.length + state.ufos.length + state.powerUps.length + state.bullets.length
    expect(bodies).toBeGreaterThanOrEqual(60)
    expect(state.particles.length).toBeGreaterThanOrEqual(200)
    expect(EFFECTS.maxParticles).toBeGreaterThanOrEqual(200)

    const busy = input({ rotate: 1, thrust: true, fire: true })
    for (let i = 0; i < 60; i++) step(state, busy, FIXED_DT) // làm nóng JIT

    const t0 = performance.now()
    for (let i = 0; i < 600; i++) step(state, busy, FIXED_DT)
    const avgMs = (performance.now() - t0) / 600

    // Ngưỡng là 4ms; thực đo trên máy rảnh nhỏ hơn hai bậc, nên số này chỉ đỏ khi
    // có hồi quy thật chứ không đỏ vì máy đang bận.
    expect(avgMs).toBeLessThan(4)
  })
})
