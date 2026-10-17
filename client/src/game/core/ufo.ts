// UFO: hẹn giờ xuất hiện, chọn to/nhỏ theo điểm, đi ngang, đổi hướng, bắn (FR-07).

import { COLOR, EFFECTS, UFO, UFO_NEVER, WORLD_H, WORLD_W } from './constants'
import { spawnUfoBullet } from './bullets'
import { spawnBreakParticles } from './particles'
import { addScore } from './score'
import type { GameState, Ufo } from './types'
import { angleBetween } from './vector'

/** Biên độ rẽ dọc so với tốc độ ngang. Đủ để né đạn, không đủ để đứng một chỗ. */
const TURN_VY_FACTOR = 0.6

export function ufoScore(u: Ufo): number {
  return u.big ? UFO.bigScore : UFO.smallScore
}

/**
 * UFO nhỏ hiếm lúc đầu và thường xuyên dần khi điểm lên, tới trần 60%.
 * Nó bắn chuẩn và đáng 1000đ, nên thả nó ra sớm là biến wave 3 thành bức tường.
 */
function smallChance(score: number): number {
  const p = score * UFO.smallChancePerPoint
  return p > UFO.smallChanceMax ? UFO.smallChanceMax : p
}

export function spawnUfo(state: GameState): void {
  const rng = state.rng
  const big = rng.next() >= smallChance(state.score)
  const fromLeft = rng.next() < 0.5

  state.ufos.push({
    x: fromLeft ? 0 : WORLD_W,
    y: rng.range(0, WORLD_H),
    vx: fromLeft ? UFO.speed : -UFO.speed,
    vy: 0,
    r: big ? UFO.bigRadius : UFO.smallRadius,
    big,
    fireMs: rng.range(UFO.fireMinMs, UFO.fireMaxMs),
    turnMs: rng.range(UFO.turnMinMs, UFO.turnMaxMs),
  })
}

/**
 * Bước 4 của `step()`.
 *
 * Đồng hồ xuất hiện chỉ chạy khi màn hình chưa có UFO nào: thế giới có wrap nên
 * UFO không bao giờ tự bay ra khỏi màn, và nếu cứ 18–28 giây lại thả thêm một con
 * thì tới wave 10 màn hình chỉ còn đĩa bay.
 */
export function updateUfos(state: GameState, dtMs: number): void {
  // `UFO_NEVER` nghĩa là ván này không có UFO. Phải so sánh nó TRƯỚC điều kiện
  // wave: đọc `wave >= 10` một mình sẽ hiểu ngược thành "từ wave 10 thì có".
  const firstWave = state.tuning.ufoFirstWave
  if (firstWave < UFO_NEVER && state.wave >= firstWave && state.ufos.length === 0) {
    state.ufoTimerMs -= dtMs
    if (state.ufoTimerMs <= 0) {
      spawnUfo(state)
      state.ufoTimerMs = state.rng.range(UFO.minDelayMs, UFO.maxDelayMs)
    }
  }

  const rng = state.rng
  const ship = state.ship
  for (let i = 0; i < state.ufos.length; i++) {
    const u = state.ufos[i]!

    u.turnMs -= dtMs
    if (u.turnMs <= 0) {
      // Chỉ đổi thành phần dọc, giữ nguyên chiều ngang: UFO vẫn phải băng qua màn
      // hình chứ không lượn quanh tàu.
      u.vy = rng.int(-1, 1) * UFO.speed * TURN_VY_FACTOR
      u.turnMs = rng.range(UFO.turnMinMs, UFO.turnMaxMs)
    }

    u.fireMs -= dtMs
    if (u.fireMs <= 0) {
      u.fireMs = rng.range(UFO.fireMinMs, UFO.fireMaxMs)
      if (ship.alive) {
        const aim = angleBetween(u, ship)
        const error = u.big ? rng.range(-UFO.bigAimError, UFO.bigAimError) : 0
        spawnUfoBullet(state, u, aim + error)
      }
    }
  }
}

/** Nổ một UFO: cộng điểm và bắn mảnh vụn. Người gọi tự xoá khỏi mảng. */
export function killUfo(state: GameState, u: Ufo): void {
  addScore(state, ufoScore(u))
  spawnBreakParticles(state, u.x, u.y, EFFECTS.particlesPerBreak, COLOR.ufo)
}
