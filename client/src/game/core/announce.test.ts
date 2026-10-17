// Câu thông báo cho trình đọc màn hình phải nói đúng con số mà màn hình đang hiện
// (NFR-A11Y-06). Đo được ở bước kiểm chứng của UX review 2026-09-11: vùng aria-live
// đọc "Tổng điểm 20" trong khi HUD và panel Hết lượt hiện 40.

import { describe, expect, it } from 'vitest'
import { FIXED_DT } from './constants'
import { step } from './step'
import type { GameState } from './types'
import { IDLE, newGame } from './testkit'

/** Ngồi yên cho tới khi hết mạng — đúng cách persona tới được màn Hết lượt. */
function sitStillUntilGameOver(state: GameState, maxSteps = 60_000): string[] {
  const announces: string[] = []
  for (let i = 0; i < maxSteps; i++) {
    step(state, IDLE, FIXED_DT)
    if (state.announce !== null) announces.push(state.announce)
    if (state.phase === 'gameover') break
  }
  return announces
}

describe('câu thông báo hết lượt', () => {
  it('nói đúng số điểm cuối ván, khớp với số HUD hiện', () => {
    // Seed của app thật (`useGame(20260904)`), mức Khó là 2 mạng nên tới màn Hết
    // lượt nhanh nhất — đúng đường mà RR-07 đi.
    const state = newGame(20260904, {
      startLives: 2,
      asteroidSpeed: 1.3,
      dropChance: 0.05,
      ufoFirstWave: 1,
    })

    const announces = sitStillUntilGameOver(state)

    expect(state.phase).toBe('gameover')
    const last = announces.at(-1)
    expect(last).toBe(`gameOver:${state.score}`)
  })

  it('mất một mạng giữa ván vẫn công bố đúng số mạng còn lại', () => {
    // Chống hồi quy: ADR-0017 chỉ dời câu HẾT LƯỢT, không được dời câu mất mạng.
    const state = newGame(20260904, {
      startLives: 3,
      asteroidSpeed: 1.3,
      dropChance: 0.05,
      ufoFirstWave: 1,
    })

    const announces = sitStillUntilGameOver(state)

    expect(announces).toContain('lifeLost:2')
    expect(announces).toContain('lifeLost:1')
    // Và câu cuối vẫn là hết lượt, không phải câu mất mạng.
    expect(announces.at(-1)).toBe(`gameOver:${state.score}`)
  })
})
