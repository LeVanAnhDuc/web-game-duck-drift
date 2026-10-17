// Sinh wave (FR-06).

import { ANNOUNCE, UFO, WAVE, WORLD_H, WORLD_W } from './constants'
import { createAsteroid, waveSpeedFactor } from './asteroids'
import type { GameState } from './types'
import { shortestDeltaX, shortestDeltaY } from './vector'

/** Số lần bốc lại chỗ đặt trước khi chịu thua và dùng chỗ vừa bốc. */
const PLACEMENT_TRIES = 40

export function waveAsteroidCount(wave: number): number {
  const count = WAVE.baseCount + wave
  return count > WAVE.maxCount ? WAVE.maxCount : count
}

/**
 * Sinh wave kế tiếp và lên đạn sẵn đồng hồ nghỉ cho lần dọn sạch sau — nhờ vậy
 * `step()` chỉ cần một điều kiện duy nhất: hết thiên thạch thì đếm ngược.
 */
export function spawnWave(state: GameState): void {
  state.wave += 1

  const count = waveAsteroidCount(state.wave)
  const factor = waveSpeedFactor(state.wave, state.tuning.asteroidSpeed)
  const rng = state.rng
  // Chỉ wave đầu mới chừa chỗ quanh tàu: từ wave 2 người chơi đã ở giữa ván và
  // biết mình đang ở đâu, còn wave 1 thì thiên thạch hiện ra trước khi kịp nhìn.
  const keepClear = state.wave === 1

  for (let i = 0; i < count; i++) {
    let x = 0
    let y = 0
    for (let t = 0; t < PLACEMENT_TRIES; t++) {
      x = rng.range(0, WORLD_W)
      y = rng.range(0, WORLD_H)
      if (!keepClear) break
      const dx = shortestDeltaX(state.ship.x, x)
      const dy = shortestDeltaY(state.ship.y, y)
      if (dx * dx + dy * dy >= WAVE.safeRadius * WAVE.safeRadius) break
    }
    state.asteroids.push(createAsteroid(state, x, y, 'large', factor))
  }

  state.waveClearMs = WAVE.clearDelayMs
  state.waveBannerMs = WAVE.bannerMs
  state.ufoTimerMs = rng.range(UFO.minDelayMs, UFO.maxDelayMs)
  state.announce = ANNOUNCE.wave(state.wave)
}
