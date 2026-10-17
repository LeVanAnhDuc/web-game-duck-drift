import type { InputState, Phase } from '@/game/core/types'

/**
 * Bàn phím ghi thẳng vào một `InputState` dùng lại — không tạo object mới mỗi sự
 * kiện (NFR-PERF-05). Bàn phím và cảm ứng chia nhau đúng một kiểu dữ liệu này,
 * nên lõi game không biết người chơi đang dùng gì.
 */
export interface KeyboardOptions {
  input: InputState
  onPause?: () => void
  /**
   * Pha hiện tại của ván. **Bắt buộc** — ADR-0015.
   *
   * Listener này gắn vào `window`, nên `preventDefault` của nó huỷ luôn hành vi mặc
   * định của phần tử đang có tiêu điểm. Không hỏi pha thì mũi tên không đổi được
   * thanh trượt và `Space` không bấm được nút (NFR-A11Y-02). Để tham số này optional
   * là mời người gọi sau quên nó, và lỗi đó không lộ ra ở test nào của gameplay.
   */
  getPhase: () => Phase | null
}

const LEFT = new Set(['ArrowLeft', 'KeyA'])
const RIGHT = new Set(['ArrowRight', 'KeyD'])
const THRUST = new Set(['ArrowUp', 'KeyW'])
const FIRE = new Set(['Space'])
const HYPER = new Set(['ShiftLeft', 'ShiftRight'])
const PAUSE = new Set(['Escape', 'KeyP'])

/** Trả về hàm gỡ listener. */
export function attachKeyboard(target: Window | HTMLElement, opts: KeyboardOptions): () => void {
  const { input, onPause, getPhase } = opts
  // Giữ riêng hai phím xoay: thả phím phải trong khi vẫn giữ phím trái thì phải
  // quay lại xoay trái, chứ không phải dừng hẳn.
  let left = false
  let right = false

  const applyRotate = () => {
    input.rotate = left === right ? 0 : left ? -1 : 1
  }

  /** Dọn cả hai cờ xoay cục bộ lẫn `input` — dùng khi rời pha chơi hoặc mất focus. */
  const clear = () => {
    left = false
    right = false
    resetInput(input)
  }

  const onKeyDown = (e: Event) => {
    const ev = e as KeyboardEvent
    if (ev.repeat) return
    const code = ev.code
    const phase = getPhase()

    // Ngoài pha chơi, bàn phím game không sở hữu phím nào — ADR-0015. `paused` giữ
    // riêng phím tạm dừng để chơi tiếp được bằng bàn phím, còn mũi tên và Space thì
    // để cho hai nút trên overlay.
    if (phase !== 'playing') {
      // Rời pha chơi giữa lúc đang giữ phím: trình duyệt không gửi `keyup` nữa, nên
      // dọn ở đây, nếu không trạng thái "đang đẩy" dính sang ván sau.
      clear()
      if (phase === 'paused' && PAUSE.has(code)) {
        onPause?.()
        ev.preventDefault()
      }
      return
    }

    if (LEFT.has(code)) left = true
    else if (RIGHT.has(code)) right = true
    else if (THRUST.has(code)) input.thrust = true
    else if (FIRE.has(code)) input.fire = true
    else if (HYPER.has(code)) input.hyperspace = true
    else if (PAUSE.has(code)) onPause?.()
    else return

    applyRotate()
    // Space và mũi tên cuộn trang; chặn sau khi đã biết phím này là của game.
    ev.preventDefault()
  }

  const onKeyUp = (e: Event) => {
    const ev = e as KeyboardEvent
    const code = ev.code
    if (getPhase() !== 'playing') return

    if (LEFT.has(code)) left = false
    else if (RIGHT.has(code)) right = false
    else if (THRUST.has(code)) input.thrust = false
    else if (FIRE.has(code)) input.fire = false
    else if (HYPER.has(code)) input.hyperspace = false
    else return

    applyRotate()
    ev.preventDefault()
  }

  // Mất focus giữa lúc đang giữ phím thì trình duyệt không gửi keyup — không dọn
  // thì tàu kẹt ở trạng thái đang đẩy cho tới hết ván.
  const onBlur = clear

  target.addEventListener('keydown', onKeyDown)
  target.addEventListener('keyup', onKeyUp)
  target.addEventListener('blur', onBlur)

  return () => {
    target.removeEventListener('keydown', onKeyDown)
    target.removeEventListener('keyup', onKeyUp)
    target.removeEventListener('blur', onBlur)
  }
}

export function createInput(): InputState {
  return { rotate: 0, thrust: false, fire: false, hyperspace: false }
}

export function resetInput(input: InputState): void {
  input.rotate = 0
  input.thrust = false
  input.fire = false
  input.hyperspace = false
}
