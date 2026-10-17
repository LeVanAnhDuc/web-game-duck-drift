// Hiệu ứng vỡ và rung màn (FR-18). Không có luật chơi ở đây — particle không va
// chạm với gì cả, nên tầng vẽ có tắt hết theo `prefers-reduced-motion` (NFR-A11Y-05)
// thì gameplay vẫn y hệt.

import { EFFECTS } from './constants'
import type { GameState } from './types'
import { angleToVecX, angleToVecY } from './vector'

const TAU = Math.PI * 2

/**
 * Bắn ra `count` mảnh vụn tại (x, y).
 *
 * Chạm trần `EFFECTS.maxParticles` thì bỏ qua phần còn lại thay vì thay thế mảnh
 * cũ: một vụ nổ mới không được phép làm biến mất vụ nổ đang hiện, và trần là để
 * giữ `NFR-PERF-02` chứ không phải để giữ số lượng.
 */
export function spawnBreakParticles(
  state: GameState,
  x: number,
  y: number,
  count: number,
  color: string,
): void {
  const rng = state.rng
  for (let i = 0; i < count; i++) {
    if (state.particles.length >= EFFECTS.maxParticles) return
    const angle = rng.range(0, TAU)
    const speed = rng.range(EFFECTS.particleSpeedMin, EFFECTS.particleSpeedMax)
    const life = rng.range(EFFECTS.particleLifeMinMs, EFFECTS.particleLifeMaxMs)
    state.particles.push({
      x,
      y,
      vx: angleToVecX(angle) * speed,
      vy: angleToVecY(angle) * speed,
      r: 1,
      lifeMs: life,
      maxLifeMs: life,
      color,
    })
  }
}

/** Rung màn. Lấy giá trị lớn hơn để cú va sau không cắt ngắn cú va trước. */
export function addShake(state: GameState, ms: number): void {
  if (ms > state.shakeMs) state.shakeMs = ms
}
