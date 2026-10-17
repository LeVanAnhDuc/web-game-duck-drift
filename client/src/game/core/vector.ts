import { WORLD_H, WORLD_W } from './constants'
import type { Body } from './types'

/** Đưa toạ độ về trong thế giới. Thế giới là hình xuyến: ra mép trái vào mép phải. */
export function wrapX(x: number): number {
  if (x < 0) return x + WORLD_W * Math.ceil(-x / WORLD_W)
  if (x >= WORLD_W) return x % WORLD_W
  return x
}

export function wrapY(y: number): number {
  if (y < 0) return y + WORLD_H * Math.ceil(-y / WORLD_H)
  if (y >= WORLD_H) return y % WORLD_H
  return y
}

export function wrapBody(b: Body): void {
  b.x = wrapX(b.x)
  b.y = wrapY(b.y)
}

/**
 * Hiệu toạ độ NGẮN NHẤT trên hình xuyến, không phải hiệu thẳng — bất biến #5.
 *
 * Hai vật ở hai mép đối diện chỉ cách nhau vài đơn vị qua đường wrap; nếu tính
 * hiệu thẳng thì ra gần cả chiều rộng thế giới, và va chạm ở rìa không nhận.
 */
export function shortestDeltaX(ax: number, bx: number): number {
  let d = bx - ax
  if (d > WORLD_W / 2) d -= WORLD_W
  else if (d < -WORLD_W / 2) d += WORLD_W
  return d
}

export function shortestDeltaY(ay: number, by: number): number {
  let d = by - ay
  if (d > WORLD_H / 2) d -= WORLD_H
  else if (d < -WORLD_H / 2) d += WORLD_H
  return d
}

/** Bình phương khoảng cách ngắn nhất. Không lấy căn — so sánh với bình phương bán kính. */
export function distSq(a: Body, b: Body): number {
  const dx = shortestDeltaX(a.x, b.x)
  const dy = shortestDeltaY(a.y, b.y)
  return dx * dx + dy * dy
}

/** Hai vật thể có chạm nhau không, tính theo khoảng cách có wrap. */
export function overlaps(a: Body, b: Body): boolean {
  const rr = a.r + b.r
  return distSq(a, b) <= rr * rr
}

/**
 * Vector đơn vị theo góc. Quy ước: 0 = hướng LÊN (−Y), tăng theo chiều kim đồng hồ
 * — bất biến #6. Sai quy ước này thì tàu bay ngang khi bấm đẩy.
 */
export function angleToVecX(angle: number): number {
  return Math.sin(angle)
}

export function angleToVecY(angle: number): number {
  return -Math.cos(angle)
}

/** Góc từ a tới b, theo cùng quy ước, có tính wrap. */
export function angleBetween(a: Body, b: Body): number {
  const dx = shortestDeltaX(a.x, b.x)
  const dy = shortestDeltaY(a.y, b.y)
  return Math.atan2(dx, -dy)
}

export function clamp(v: number, min: number, max: number): number {
  return v < min ? min : v > max ? max : v
}

/** Giới hạn độ dài vector vận tốc của một vật thể tại chỗ. */
export function limitSpeed(b: Body, max: number): void {
  const sq = b.vx * b.vx + b.vy * b.vy
  if (sq <= max * max) return
  const s = max / Math.sqrt(sq)
  b.vx *= s
  b.vy *= s
}
