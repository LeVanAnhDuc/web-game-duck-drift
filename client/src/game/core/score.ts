// Điểm và mốc thưởng mạng (FR-05).

import { ANNOUNCE, SCORING } from './constants'
import type { GameState } from './types'

export function addScore(state: GameState, points: number): void {
  state.score += points
}

/**
 * Cộng mạng ở mỗi mốc 10.000 điểm, đúng một lần cho mỗi mốc.
 *
 * Vòng `while` chứ không phải `if`: bắn UFO nhỏ được 1000đ nên một cú ăn điểm
 * không vượt nổi hai mốc, nhưng mốc là dữ liệu chỉnh được (`constants.ts`) và
 * `if` sẽ âm thầm nuốt mất mạng thứ hai nếu ai đó hạ mốc xuống.
 */
export function grantExtraLives(state: GameState): void {
  while (state.score >= state.nextExtraLifeAt) {
    state.lives += 1
    state.nextExtraLifeAt += SCORING.extraLifeEvery
    state.announce = ANNOUNCE.extraLife
  }
}
