// Đồ nghề dùng chung của các test lõi. KHÔNG được import từ code chạy thật —
// file này chỉ tồn tại để bốn file `*.test.ts` không phải chép lại cùng một
// đoạn dựng ván ba lần, và nó tuân thủ đúng những bất biến như phần lõi còn lại.

import { FIXED_DT } from './constants'
import { createGameState, resetForNewGame } from './state'
import { step } from './step'
import type { Bullet, GameState, InputState, Tuning } from './types'

export const IDLE: InputState = { rotate: 0, thrust: false, fire: false, hyperspace: false }

export function input(over: Partial<InputState>): InputState {
  return { ...IDLE, ...over }
}

/** Một ván đang chạy, chưa có wave nào — bước đầu tiên sẽ sinh wave 1. */
export function newGame(seed: number, tuning?: Tuning): GameState {
  const state = createGameState(seed)
  resetForNewGame(state, tuning === undefined ? {} : { tuning })
  return state
}

/** Số bước ứng với `s` giây, làm tròn lên để chắc chắn vượt qua mốc. */
export function steps(seconds: number): number {
  return Math.ceil(seconds / FIXED_DT) + 1
}

export function run(state: GameState, count: number, inp: InputState = IDLE): void {
  for (let i = 0; i < count; i++) step(state, inp, FIXED_DT)
}

/**
 * Đóng băng nhịp wave lại: nhiều test cần thao tác trên một màn hình trống mà
 * không bị wave sau đổ thiên thạch vào giữa chừng.
 */
export function freezeWaves(state: GameState): void {
  state.asteroids.length = 0
  state.waveClearMs = Number.MAX_SAFE_INTEGER
}

export function bulletAt(x: number, y: number): Bullet {
  return { x, y, vx: 0, vy: 0, r: 3, lifeMs: 1000, pierce: false, fromUfo: false }
}
