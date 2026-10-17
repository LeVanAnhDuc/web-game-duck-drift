import type { InputState } from '@/game/core/types'

/** Một nút cảm ứng tương ứng với đúng một hành động. */
export type TouchAction = 'left' | 'right' | 'thrust' | 'fire' | 'hyperspace'

/**
 * Cảm ứng ghi vào cùng một `InputState` như bàn phím — lõi game không phân biệt
 * hai nguồn (US-03).
 *
 * `rotate` phải suy từ trạng thái của CẢ HAI nút: nhả nút phải trong khi ngón kia
 * vẫn giữ nút trái thì phải quay lại xoay trái. Vì vậy nó cần một bộ nhớ riêng
 * chứ không đọc ngược được từ `input.rotate`.
 */
export interface TouchInput {
  set(action: TouchAction, pressed: boolean): void
  /** Nhả tất cả — dùng khi mất pointer capture hoặc khi rời màn chơi. */
  releaseAll(): void
  isPressed(action: TouchAction): boolean
}

export function createTouchInput(input: InputState): TouchInput {
  const pressed: Record<TouchAction, boolean> = {
    left: false,
    right: false,
    thrust: false,
    fire: false,
    hyperspace: false,
  }

  const sync = () => {
    input.rotate = pressed.left === pressed.right ? 0 : pressed.left ? -1 : 1
    input.thrust = pressed.thrust
    input.fire = pressed.fire
    input.hyperspace = pressed.hyperspace
  }

  return {
    set(action, isDown) {
      pressed[action] = isDown
      sync()
    },
    releaseAll() {
      for (const key of Object.keys(pressed) as TouchAction[]) pressed[key] = false
      sync()
    },
    isPressed: (action) => pressed[action],
  }
}

/**
 * Thiết bị này có phải màn hình cảm ứng không. Dùng `pointer: coarse` chứ không
 * dùng chiều rộng màn hình: máy tính bảng rộng 1024 vẫn cần nút, còn cửa sổ
 * desktop kéo hẹp lại thì không.
 */
export function isCoarsePointer(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return window.matchMedia('(pointer: coarse)').matches
}
