// Đạn của tàu và đạn của UFO (FR-03).

import { BULLET, SHIP, UFO_BULLET } from './constants'
import type { Body, GameState } from './types'
import { angleToVecX, angleToVecY, wrapX, wrapY } from './vector'

/**
 * Ba tia của bắn toả, tia giữa đứng đầu: khi trần đạn chỉ còn chỗ cho một viên thì
 * viên đó phải là viên đi thẳng, chứ không phải một viên lệch sang bên.
 * Hằng số ở tầm module để không cấp phát mảng mới mỗi lần bóp cò (`NFR-PERF-05`).
 */
const SPREAD_OFFSETS: readonly number[] = [0, -BULLET.spreadAngle, BULLET.spreadAngle]

/** Trần đạn nới rộng cho bắn nhanh và bắn toả; đạn xuyên giữ trần thường. */
function bulletCap(weapon: GameState['ship']['weapon']): number {
  return weapon === 'rapid' || weapon === 'spread' ? BULLET.maxOnScreenBoosted : BULLET.maxOnScreen
}

function countShipBullets(state: GameState): number {
  let n = 0
  for (let i = 0; i < state.bullets.length; i++) {
    if (!state.bullets[i]!.fromUfo) n++
  }
  return n
}

function spawnShipBullet(state: GameState, angle: number, pierce: boolean): void {
  const ship = state.ship
  const dx = angleToVecX(angle)
  const dy = angleToVecY(angle)
  state.bullets.push({
    // Ra ở mũi tàu chứ không ở tâm, nếu không thì viên đạn sinh ra đã nằm chồng
    // lên thiên thạch mà tàu đang húc và nổ ngay trước mặt.
    x: wrapX(ship.x + dx * SHIP.drawRadius),
    y: wrapY(ship.y + dy * SHIP.drawRadius),
    // Cộng vận tốc tàu: bay lùi mà bắn thì đạn chậm hơn, đúng với quán tính của
    // phần còn lại của game.
    vx: ship.vx + dx * BULLET.speed,
    vy: ship.vy + dy * BULLET.speed,
    r: BULLET.radius,
    lifeMs: BULLET.lifeMs,
    pierce,
    fromUfo: false,
  })
}

/** Bóp cò. Tự lo cooldown và trần số đạn, gọi mỗi bước cũng không sao. */
export function fireBullets(state: GameState): void {
  const ship = state.ship
  if (!ship.alive || ship.cooldownMs > 0) return

  const cap = bulletCap(ship.weapon)
  const room = cap - countShipBullets(state)
  if (room <= 0) return

  const pierce = ship.weapon === 'pierce'
  if (ship.weapon === 'spread') {
    const shots = Math.min(SPREAD_OFFSETS.length, room)
    for (let i = 0; i < shots; i++) {
      spawnShipBullet(state, ship.angle + SPREAD_OFFSETS[i]!, pierce)
    }
  } else {
    spawnShipBullet(state, ship.angle, pierce)
  }

  ship.cooldownMs = BULLET.cooldownMs * (ship.weapon === 'rapid' ? BULLET.rapidFactor : 1)
}

/** Đạn UFO. Không xuyên, và không bao giờ chạm thiên thạch — chỉ nhắm vào tàu. */
export function spawnUfoBullet(state: GameState, from: Body, angle: number): void {
  const dx = angleToVecX(angle)
  const dy = angleToVecY(angle)
  state.bullets.push({
    x: wrapX(from.x + dx * from.r),
    y: wrapY(from.y + dy * from.r),
    vx: dx * UFO_BULLET.speed,
    vy: dy * UFO_BULLET.speed,
    r: UFO_BULLET.radius,
    lifeMs: UFO_BULLET.lifeMs,
    pierce: false,
    fromUfo: true,
  })
}
