// Tàu: xoay, đẩy có quán tính, bắn, hyperspace, mất mạng và hồi sinh
// (FR-02, FR-05, FR-08).

import { ANNOUNCE, COLOR, EFFECTS, SHIP, WORLD_H, WORLD_W } from './constants'
import { fireBullets } from './bullets'
import { addShake, spawnBreakParticles } from './particles'
import type { GameState, InputState, Ship } from './types'
import { angleToVecX, angleToVecY, limitSpeed, wrapBody } from './vector'

const TAU = Math.PI * 2

/** Kết quả một cú va vào tàu — người gọi cần biết để quyết định có phá vật thể kia không. */
export type ShipHit = 'none' | 'shield' | 'death'

/** Bước 1 của `step()`: toàn bộ ảnh hưởng của `input` lên tàu. */
export function applyShipInput(state: GameState, input: InputState, dt: number): void {
  const ship = state.ship
  if (!ship.alive) {
    ship.thrusting = false
    return
  }

  if (input.rotate !== 0) {
    // Gói về [0, 2π) ngay: góc cộng dồn không giới hạn sẽ mất dần chữ số có nghĩa
    // và làm hai lần chạy cùng seed lệch nhau sau vài phút (`NFR-ROB-04`).
    let angle = (ship.angle + input.rotate * SHIP.rotateSpeed * dt) % TAU
    if (angle < 0) angle += TAU
    ship.angle = angle
  }

  ship.thrusting = input.thrust
  if (input.thrust) {
    ship.vx += angleToVecX(ship.angle) * SHIP.thrust * dt
    ship.vy += angleToVecY(ship.angle) * SHIP.thrust * dt
  }

  if (input.fire) fireBullets(state)
  if (input.hyperspace) hyperspace(state)
}

/**
 * Dịch chuyển tới một điểm ngẫu nhiên, vận tốc về 0, vào cooldown 5 giây.
 * Không có xác suất nổ — rủi ro là hạ cánh cạnh thiên thạch, không phải xúc xắc
 * chết (ADR-0005).
 */
export function hyperspace(state: GameState): void {
  const ship = state.ship
  if (!ship.alive || ship.hyperMs > 0) return

  ship.x = state.rng.range(0, WORLD_W)
  ship.y = state.rng.range(0, WORLD_H)
  ship.vx = 0
  ship.vy = 0
  ship.hyperMs = SHIP.hyperCooldownMs
}

/** Bước 2 của `step()` cho tàu: ma sát, trần tốc độ, rồi mới dịch chuyển. */
export function integrateShip(ship: Ship, dt: number): void {
  // Ma sát dạng mũ: v(t) = v₀·e^(−k·t). Dạng `v -= v*k*dt` cho kết quả khác nhau
  // theo số bước, tức là vi phạm bất biến #3 một cách rất khó thấy.
  const decay = Math.exp(-SHIP.friction * dt)
  ship.vx *= decay
  ship.vy *= decay
  limitSpeed(ship, SHIP.maxSpeed)

  ship.x += ship.vx * dt
  ship.y += ship.vy * dt
  wrapBody(ship)
}

/** Bước 3 của `step()` cho tàu: mọi đồng hồ, kể cả đếm ngược hồi sinh. */
export function tickShip(state: GameState, dtMs: number): void {
  const ship = state.ship

  if (ship.invulnMs > 0) ship.invulnMs = Math.max(0, ship.invulnMs - dtMs)
  if (ship.cooldownMs > 0) ship.cooldownMs = Math.max(0, ship.cooldownMs - dtMs)
  if (ship.hyperMs > 0) ship.hyperMs = Math.max(0, ship.hyperMs - dtMs)

  if (ship.weapon !== null) {
    ship.weaponMs -= dtMs
    if (ship.weaponMs <= 0) {
      ship.weapon = null
      ship.weaponMs = 0
    }
  }

  if (!ship.alive) {
    ship.respawnMs -= dtMs
    if (ship.respawnMs <= 0 && state.lives > 0) respawnShip(state)
  }
}

/** Về giữa thế giới, đứng yên, hướng lên, bất tử 2 giây. */
export function respawnShip(state: GameState): void {
  const ship = state.ship
  ship.x = WORLD_W / 2
  ship.y = WORLD_H / 2
  ship.vx = 0
  ship.vy = 0
  ship.angle = 0
  ship.thrusting = false
  ship.alive = true
  ship.respawnMs = 0
  ship.invulnMs = SHIP.invulnMs
  ship.cooldownMs = 0
  // Mạng mới thì hyperspace sẵn sàng ngay: bắt người chơi chờ hết cooldown của
  // mạng đã chết là phạt hai lần cho một lỗi.
  ship.hyperMs = 0
}

/** Chết thì mất cả khe vũ khí lẫn khe khiên; điểm và mạng giữ nguyên (ADR-0004). */
function dropPowerUps(ship: Ship): void {
  ship.shield = false
  ship.weapon = null
  ship.weaponMs = 0
}

/**
 * Một cú va vào tàu. Trả về chuyện gì đã xảy ra, vì bên gọi dùng nó để quyết định
 * có phá vật thể vừa đâm hay không: tàu đang bất tử thì bay xuyên qua, không phá gì.
 */
export function damageShip(state: GameState): ShipHit {
  const ship = state.ship
  if (!ship.alive || ship.invulnMs > 0) return 'none'

  if (ship.shield) {
    ship.shield = false
    // Bất tử ngay sau khi khiên vỡ: không có nó thì vật thể vừa đâm vẫn đè lên tàu
    // ở bước sau và ăn nốt mạng, tức là khiên hấp thụ được 0 va chạm chứ không phải 1.
    ship.invulnMs = SHIP.invulnMs
    spawnBreakParticles(state, ship.x, ship.y, EFFECTS.particlesPerBreak, COLOR.primary)
    return 'shield'
  }

  ship.alive = false
  ship.thrusting = false
  ship.respawnMs = SHIP.respawnMs
  dropPowerUps(ship)
  state.lives -= 1

  addShake(state, EFFECTS.shakeOnDeathMs)
  spawnBreakParticles(state, ship.x, ship.y, EFFECTS.particlesPerBreak * 2, COLOR.accent)

  if (state.lives <= 0) {
    // Chỉ đặt pha. Câu thông báo hết lượt do `step()` phát ở CUỐI step — ADR-0017.
    // Phát ở đây là chốt `state.score` giữa step: chỗ gọi tới đây là
    // `shipVsAsteroids`, và nó còn `breakAsteroid` chính viên đá vừa giết tàu, tức
    // còn cộng điểm. Câu nói ra sẽ thiếu đúng số điểm đó so với HUD — NFR-A11Y-06.
    state.phase = 'gameover'
  } else {
    // Mất một mạng thì số mạng không đổi thêm trong cùng step, nên phát ở đây đúng.
    state.announce = ANNOUNCE.lifeLost(state.lives)
  }
  return 'death'
}
