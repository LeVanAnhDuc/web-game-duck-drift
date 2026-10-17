// Power-up: rơi ra, trôi, hết hạn, và hiệu lực khi nhặt (FR-09, ADR-0004).

import { POWERUP } from './constants'
import type { GameState, PowerUpKind, Rng } from './types'
import { angleToVecX, angleToVecY } from './vector'

const TAU = Math.PI * 2

/**
 * Thứ tự cố định, không lấy từ `Object.keys(POWERUP.weights)`: thứ tự khoá của
 * object quyết định loại nào ứng với khoảng nào của số ngẫu nhiên, nên đổi thứ tự
 * là đổi kết quả của cùng một seed (`NFR-ROB-04`).
 */
const KINDS: readonly PowerUpKind[] = ['shield', 'rapid', 'spread', 'pierce', 'life']

const TOTAL_WEIGHT = KINDS.reduce((sum, kind) => sum + POWERUP.weights[kind], 0)

export function pickKind(rng: Rng): PowerUpKind {
  let roll = rng.next() * TOTAL_WEIGHT
  for (let i = 0; i < KINDS.length; i++) {
    const kind = KINDS[i]!
    roll -= POWERUP.weights[kind]
    if (roll < 0) return kind
  }
  // Chỉ tới đây khi số thực làm tròn sát mép; trả loại cuối thay vì ném lỗi.
  return KINDS[KINDS.length - 1]!
}

/** Quay xúc xắc rơi power-up tại chỗ thiên thạch vừa vỡ. */
export function rollDrop(state: GameState, x: number, y: number): void {
  if (state.powerUps.length >= POWERUP.maxOnScreen) return
  if (state.rng.next() >= state.tuning.dropChance) return

  const angle = state.rng.range(0, TAU)
  state.powerUps.push({
    x,
    y,
    vx: angleToVecX(angle) * POWERUP.driftSpeed,
    vy: angleToVecY(angle) * POWERUP.driftSpeed,
    r: POWERUP.radius,
    kind: pickKind(state.rng),
    lifeMs: POWERUP.lifeMs,
  })
}

/**
 * Hiệu lực khi nhặt.
 *
 * `life` ăn ngay, `shield` là khe riêng không hết hạn theo thời gian, ba loại vũ
 * khí dùng chung một khe: trùng loại thì cộng dồn có trần, khác loại thì thay hẳn
 * và đặt lại đồng hồ — ADR-0004.
 */
export function applyPowerUp(state: GameState, kind: PowerUpKind): void {
  const ship = state.ship
  if (kind === 'life') {
    state.lives += 1
    return
  }
  if (kind === 'shield') {
    ship.shield = true
    return
  }
  if (ship.weapon === kind) {
    ship.weaponMs = Math.min(ship.weaponMs + POWERUP.effectMs, POWERUP.maxEffectMs)
  } else {
    ship.weapon = kind
    ship.weaponMs = POWERUP.effectMs
  }
}
