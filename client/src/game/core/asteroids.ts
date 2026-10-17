// Thiên thạch: sinh ra, trôi, xoay, và vỡ thành hai mảnh nhỏ hơn (FR-04, FR-06).

import { ASTEROID, ASTEROID_CHILD, ASTEROID_RADIUS, ASTEROID_SCORE, COLOR, EFFECTS, WAVE } from './constants'
import { spawnBreakParticles } from './particles'
import { rollDrop } from './powerups'
import { addScore } from './score'
import type { Asteroid, AsteroidSize, GameState, Rng } from './types'
import { angleToVecX, angleToVecY, wrapBody } from './vector'

const TAU = Math.PI * 2

/**
 * Hệ số bán kính cho từng đỉnh đa giác, sinh MỘT LẦN lúc tạo.
 *
 * Nếu méo được tính lại mỗi frame thì hình thù nhấp nháy, và số ngẫu nhiên tiêu
 * thụ sẽ phụ thuộc vào số frame đã vẽ — tức là cùng seed cho ra ván khác nhau
 * (`NFR-ROB-04`).
 */
export function makeShape(rng: Rng): number[] {
  const count = rng.int(ASTEROID.minVertices, ASTEROID.maxVertices)
  const shape = new Array<number>(count)
  for (let i = 0; i < count; i++) {
    shape[i] = rng.range(1 - ASTEROID.jitter, 1 + ASTEROID.jitter)
  }
  return shape
}

/**
 * Wave càng cao thiên thạch càng nhanh, tới trần `WAVE.maxSpeedFactor`; hệ số độ
 * khó nhân lên TRÊN trần đó — design.md §4.
 *
 * Thứ tự này là chủ ý. Chặn trần sau khi nhân thì mức Khó và mức Thường hội tụ
 * về cùng một tốc độ ở wave cao, tức là mức Khó tự biến mất đúng lúc nó cần có ý
 * nghĩa nhất.
 */
export function waveSpeedFactor(wave: number, speedMul: number): number {
  const ramp = 1 + WAVE.speedStep * (wave - 1)
  return (ramp > WAVE.maxSpeedFactor ? WAVE.maxSpeedFactor : ramp) * speedMul
}

export function createAsteroid(
  state: GameState,
  x: number,
  y: number,
  size: AsteroidSize,
  speedFactor: number,
): Asteroid {
  const rng = state.rng
  const heading = rng.range(0, TAU)
  const speed = rng.range(ASTEROID.minSpeed, ASTEROID.maxSpeed) * speedFactor
  return {
    x,
    y,
    vx: angleToVecX(heading) * speed,
    vy: angleToVecY(heading) * speed,
    r: ASTEROID_RADIUS[size],
    size,
    angle: rng.range(0, TAU),
    spin: rng.range(-ASTEROID.maxSpin, ASTEROID.maxSpin),
    shape: makeShape(rng),
  }
}

/**
 * Xử lý một thiên thạch bị bắn vỡ: cộng điểm, bắn mảnh vụn, đẻ con, quay xúc xắc
 * power-up. KHÔNG tự xoá khỏi mảng — người gọi xoá, vì chỉ người gọi mới biết chỉ
 * số hiện tại và mới giữ được thứ tự duyệt của vòng lặp va chạm.
 *
 * Mảnh con được `push` vào cuối mảng nên nằm ngoài biên duyệt của lượt va chạm
 * đang chạy: một viên đạn xuyên không được ăn cả cha lẫn con trong cùng một bước.
 */
export function breakAsteroid(state: GameState, a: Asteroid, dropPowerUp: boolean): void {
  addScore(state, ASTEROID_SCORE[a.size])
  spawnBreakParticles(state, a.x, a.y, EFFECTS.particlesPerBreak, COLOR.asteroid)

  const childSize = ASTEROID_CHILD[a.size]
  if (childSize !== null) {
    const factor = waveSpeedFactor(state.wave, state.tuning.asteroidSpeed)
    for (let i = 0; i < ASTEROID.childCount; i++) {
      state.asteroids.push(createAsteroid(state, a.x, a.y, childSize, factor))
    }
  }

  if (dropPowerUp) rollDrop(state, a.x, a.y)
}

/** Bước 2 của `step()` cho riêng thiên thạch: dịch chuyển, wrap, và xoay tại chỗ. */
export function integrateAsteroids(list: Asteroid[], dt: number): void {
  for (let i = 0; i < list.length; i++) {
    const a = list[i]!
    a.x += a.vx * dt
    a.y += a.vy * dt
    // Gói góc lại thay vì cộng dồn mãi: sau vài phút chơi, số hạng lớn làm phép
    // cộng mất dần chữ số có nghĩa và hai lần chạy cùng seed bắt đầu lệch nhau.
    a.angle = (a.angle + a.spin * dt) % TAU
    wrapBody(a)
  }
}
