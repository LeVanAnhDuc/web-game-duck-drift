// Vòng lặp game: bước mô phỏng cố định + vẽ một lần mỗi frame.
//
// `now`, `schedule`, `cancel` tiêm được vì hai lý do: test chạy được không cần
// trình duyệt, và cả vòng lặp chỉ có ĐÚNG MỘT nguồn thời gian — mọi phép đo
// khoảng cách thời gian đều đi qua `now()`.

import { FIXED_DT, MAX_FRAME_S } from './core/constants'
import { hudEquals, hudOf } from './core/state'
import { step } from './core/step'
import type { GameState, HudSnapshot, InputState } from './core/types'

export interface Loop {
  start(): void
  stop(): void
  isRunning(): boolean
}

export interface LoopOptions {
  state: GameState
  input: InputState
  /** Móc của tầng vẽ. Gọi mỗi frame, kể cả khi không có bước mô phỏng nào. */
  onFrame: (state: GameState) => void
  /** CHỈ gọi khi snapshot khác lần trước (NFR-PERF-03, bất biến #8). */
  onHud: (hud: HudSnapshot) => void
  now?: () => number
  schedule?: (cb: (t: number) => void) => number
  cancel?: (id: number) => void
}

/**
 * Trần số bước trong một frame. Bằng đúng số bước nhét vừa `MAX_FRAME_S`
 * (0.25s ÷ 1/60 = 15) — NFR-ROB-03.
 *
 * Không có trần này thì một tab bị treo 30 giây khi quay lại sẽ chạy 1800 bước
 * trong một frame: trình duyệt đứng hình, rồi frame sau lại nợ thêm — vòng xoáy
 * chết. Bỏ phần nợ đi và để game "nhảy cóc" là lựa chọn đúng ở đây.
 */
const MAX_STEPS_PER_FRAME = Math.ceil(MAX_FRAME_S / FIXED_DT)

export function createLoop(opts: LoopOptions): Loop {
  const { state, input, onFrame, onHud } = opts
  const now = opts.now ?? (() => performance.now())
  const schedule = opts.schedule ?? ((cb: (t: number) => void) => requestAnimationFrame(cb))
  const cancel = opts.cancel ?? ((id: number) => cancelAnimationFrame(id))

  let running = false
  let handle: number | null = null
  let lastAt = 0
  /** Thời gian thật đã trôi mà chưa được tiêu bằng bước mô phỏng, tính bằng giây. */
  let accumulator = 0
  let lastHud: HudSnapshot | null = null

  /**
   * Bỏ qua tham số timestamp của requestAnimationFrame và luôn hỏi `now()`.
   *
   * Hai đồng hồ trong một vòng lặp là cách chắc chắn nhất để lệch: rAF đưa vào
   * đồng hồ của trình duyệt còn `now` là đồng hồ tiêm được, trộn cả hai thì test
   * đo một đằng còn thực tế chạy một nẻo.
   */
  function frame(): void {
    handle = null
    if (!running) return

    const at = now()
    let elapsed = (at - lastAt) / 1000
    lastAt = at
    // Đồng hồ nhảy lùi (đổi giờ hệ thống, máy ngủ dậy) không được sinh dt âm.
    if (!(elapsed > 0)) elapsed = 0
    if (elapsed > MAX_FRAME_S) elapsed = MAX_FRAME_S

    if (state.phase === 'playing') {
      accumulator += elapsed
      let steps = 0
      while (accumulator >= FIXED_DT && steps < MAX_STEPS_PER_FRAME) {
        // dt LUÔN là FIXED_DT, không bao giờ là thời gian thật — bất biến #3.
        // Nhờ vậy máy 144Hz và máy 60Hz cho cùng một ván.
        step(state, input, FIXED_DT)
        accumulator -= FIXED_DT
        steps++
      }
      if (steps >= MAX_STEPS_PER_FRAME) accumulator = 0
    } else {
      // Pha khác `playing` không mô phỏng, nhưng cũng không được giữ lại nợ thời
      // gian: nếu không, bấm tiếp tục sau 30 giây tạm dừng sẽ chạy bù 15 bước.
      accumulator = 0
    }

    // Vẽ một lần mỗi frame, không phải một lần mỗi bước.
    onFrame(state)

    const hud = hudOf(state)
    if (lastHud === null || !hudEquals(lastHud, hud)) {
      lastHud = hud
      onHud(hud)
    }

    // `onFrame`/`onHud` có thể đã gọi `stop()`; đừng đặt lại lịch sau đó.
    if (running) handle = schedule(frame)
  }

  function start(): void {
    if (running) return
    running = true
    lastAt = now()
    accumulator = 0
    // Quên snapshot cũ để frame đầu luôn đẩy HUD lên React một lần.
    lastHud = null
    handle = schedule(frame)
  }

  function stop(): void {
    running = false
    if (handle !== null) {
      cancel(handle)
      handle = null
    }
  }

  function isRunning(): boolean {
    return running
  }

  return { start, stop, isRunning }
}
