// Bước 5 của `step()`: sáu lượt va chạm, theo đúng thứ tự của design.md §2.
// Đổi thứ tự là đổi luật chơi mà không test nào đỏ, nên thứ tự ở đây là hợp đồng.
//
// Mọi phép so khoảng cách đi qua `overlaps` của `vector.ts`, tức là khoảng cách
// ngắn nhất CÓ WRAP — bất biến #5.

import { breakAsteroid } from './asteroids'
import { applyPowerUp } from './powerups'
import { damageShip } from './ship'
import { killUfo } from './ufo'
import type { GameState } from './types'
import { overlaps } from './vector'

/**
 * Xoá giữ nguyên thứ tự, không cấp phát (`splice` trả về một mảng mới mỗi lần gọi).
 *
 * Thứ tự phải giữ: các lượt va chạm chốt biên duyệt trước khi chạy, và mảnh con
 * sinh ra được `push` vào cuối. Nếu xoá bằng cách kéo phần tử cuối vào chỗ trống
 * thì một mảnh con vừa sinh sẽ nhảy vào giữa vùng đang duyệt và bị đạn xuyên ăn
 * ngay trong cùng một bước.
 */
export function removeAt<T>(list: T[], index: number): void {
  for (let i = index; i < list.length - 1; i++) list[i] = list[i + 1]!
  list.length -= 1
}

/** Lượt 1 — đạn tàu ↔ thiên thạch. Đạn xuyên đi tiếp, đạn thường tắt tại chỗ. */
function bulletsVsAsteroids(state: GameState): void {
  const bullets = state.bullets
  const asteroids = state.asteroids

  for (let i = 0; i < bullets.length; i++) {
    const b = bullets[i]!
    if (b.fromUfo) continue

    // Chốt biên trước vòng trong: mảnh con nằm ngoài biên này.
    let n = asteroids.length
    for (let j = 0; j < n; j++) {
      const a = asteroids[j]!
      if (!overlaps(b, a)) continue

      breakAsteroid(state, a, true)
      removeAt(asteroids, j)
      n -= 1
      j -= 1

      if (!b.pierce) {
        removeAt(bullets, i)
        i -= 1
        break
      }
    }
  }
}

/** Lượt 2 — đạn tàu ↔ UFO. */
function bulletsVsUfos(state: GameState): void {
  const bullets = state.bullets
  const ufos = state.ufos

  for (let i = 0; i < bullets.length; i++) {
    const b = bullets[i]!
    if (b.fromUfo) continue

    for (let j = 0; j < ufos.length; j++) {
      const u = ufos[j]!
      if (!overlaps(b, u)) continue

      killUfo(state, u)
      removeAt(ufos, j)
      j -= 1

      if (!b.pierce) {
        removeAt(bullets, i)
        i -= 1
        break
      }
    }
  }
}

/** Lượt 3 — đạn UFO ↔ tàu. Đạn tắt kể cả khi tàu đang bất tử, để không đọng lại. */
function ufoBulletsVsShip(state: GameState): void {
  const ship = state.ship
  if (!ship.alive) return

  const bullets = state.bullets
  for (let i = 0; i < bullets.length; i++) {
    const b = bullets[i]!
    if (!b.fromUfo || !overlaps(b, ship)) continue

    removeAt(bullets, i)
    i -= 1
    damageShip(state)
    if (!ship.alive) return
  }
}

/**
 * Lượt 4 — tàu ↔ thiên thạch.
 *
 * Tàu bất tử bay xuyên qua mà không phá gì: nếu vẫn phá thì hai giây bất tử sau
 * hồi sinh biến thành hai giây dọn sạch màn hình.
 */
function shipVsAsteroids(state: GameState): void {
  const ship = state.ship
  if (!ship.alive || ship.invulnMs > 0) return

  const asteroids = state.asteroids
  for (let j = 0; j < asteroids.length; j++) {
    const a = asteroids[j]!
    if (!overlaps(ship, a)) continue

    const hit = damageShip(state)
    if (hit === 'none') return
    breakAsteroid(state, a, false)
    removeAt(asteroids, j)
    return
  }
}

/** Lượt 5 — tàu ↔ UFO. Đâm trực diện vẫn được tính điểm như bắn trúng. */
function shipVsUfos(state: GameState): void {
  const ship = state.ship
  if (!ship.alive || ship.invulnMs > 0) return

  const ufos = state.ufos
  for (let j = 0; j < ufos.length; j++) {
    const u = ufos[j]!
    if (!overlaps(ship, u)) continue

    const hit = damageShip(state)
    if (hit === 'none') return
    killUfo(state, u)
    removeAt(ufos, j)
    return
  }
}

/** Lượt 6 — tàu ↔ power-up. Nhặt được cả khi đang bất tử. */
function shipVsPowerUps(state: GameState): void {
  const ship = state.ship
  if (!ship.alive) return

  const powerUps = state.powerUps
  for (let i = 0; i < powerUps.length; i++) {
    const p = powerUps[i]!
    if (!overlaps(ship, p)) continue

    applyPowerUp(state, p.kind)
    removeAt(powerUps, i)
    i -= 1
  }
}

export function collide(state: GameState): void {
  bulletsVsAsteroids(state)
  bulletsVsUfos(state)
  ufoBulletsVsShip(state)
  shipVsAsteroids(state)
  shipVsUfos(state)
  shipVsPowerUps(state)
}
