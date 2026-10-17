import type { Phase } from '@/game/core/types'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { attachKeyboard, createInput, resetInput } from './keyboard'

const press = (el: HTMLElement, code: string, repeat = false) =>
  el.dispatchEvent(new KeyboardEvent('keydown', { code, repeat, bubbles: true, cancelable: true }))

const release = (el: HTMLElement, code: string) =>
  el.dispatchEvent(new KeyboardEvent('keyup', { code, bubbles: true, cancelable: true }))

describe('attachKeyboard', () => {
  let el: HTMLElement
  let input = createInput()

  beforeEach(() => {
    el = document.createElement('div')
    document.body.appendChild(el)
    input = createInput()
  })

  it('ánh xạ cả mũi tên lẫn WASD', () => {
    attachKeyboard(el, { input, getPhase: () => 'playing' })

    press(el, 'ArrowLeft')
    expect(input.rotate).toBe(-1)
    release(el, 'ArrowLeft')

    press(el, 'KeyD')
    expect(input.rotate).toBe(1)
  })

  it('giữ hai phím xoay cùng lúc thì đứng yên, thả một phím thì quay lại phím còn lại', () => {
    attachKeyboard(el, { input, getPhase: () => 'playing' })

    press(el, 'ArrowLeft')
    press(el, 'ArrowRight')
    expect(input.rotate).toBe(0)

    release(el, 'ArrowRight')
    expect(input.rotate).toBe(-1)
  })

  it('nhận đẩy và bắn cùng lúc', () => {
    attachKeyboard(el, { input, getPhase: () => 'playing' })

    press(el, 'ArrowUp')
    press(el, 'Space')
    expect(input.thrust).toBe(true)
    expect(input.fire).toBe(true)
  })

  it('bỏ qua sự kiện lặp do giữ phím', () => {
    attachKeyboard(el, { input, getPhase: () => 'playing' })
    press(el, 'Space')
    input.fire = false
    press(el, 'Space', true)
    expect(input.fire).toBe(false)
  })

  it('gọi onPause với Esc và P, và không đụng vào input', () => {
    const onPause = vi.fn()
    attachKeyboard(el, { input, onPause, getPhase: () => 'playing' })

    press(el, 'Escape')
    press(el, 'KeyP')
    expect(onPause).toHaveBeenCalledTimes(2)
    expect(input).toEqual(createInput())
  })

  it('mất focus thì nhả hết phím — nếu không thì tàu kẹt ở trạng thái đang đẩy', () => {
    attachKeyboard(el, { input, getPhase: () => 'playing' })
    press(el, 'ArrowUp')
    press(el, 'ArrowLeft')

    el.dispatchEvent(new Event('blur'))
    expect(input).toEqual(createInput())
  })

  it('gỡ listener thì không nhận phím nữa', () => {
    const detach = attachKeyboard(el, { input, getPhase: () => 'playing' })
    detach()
    press(el, 'ArrowUp')
    expect(input.thrust).toBe(false)
  })

  it('chặn hành vi mặc định của phím game, bỏ qua phím khác', () => {
    attachKeyboard(el, { input, getPhase: () => 'playing' })

    const space = new KeyboardEvent('keydown', { code: 'Space', bubbles: true, cancelable: true })
    el.dispatchEvent(space)
    expect(space.defaultPrevented).toBe(true)

    const tab = new KeyboardEvent('keydown', { code: 'Tab', bubbles: true, cancelable: true })
    el.dispatchEvent(tab)
    expect(tab.defaultPrevented).toBe(false)
  })
})

// ADR-0015. Trước đây listener gắn vào `window` cho cả đời component và không hỏi pha,
// nên nó chặn mũi tên và Space trên MỌI màn: thanh trượt ở màn Tuỳ chỉnh không nhận
// mũi tên (F-09, kéo theo F-06 vì không với tới được mốc "tắt"), và `Space` không bấm
// được nút đang có tiêu điểm — vi phạm NFR-A11Y-02.
describe('attachKeyboard sở hữu phím theo pha', () => {
  let el: HTMLElement
  let input = createInput()

  beforeEach(() => {
    el = document.createElement('div')
    document.body.appendChild(el)
    input = createInput()
  })

  const dispatch = (code: string) => {
    const ev = new KeyboardEvent('keydown', { code, bubbles: true, cancelable: true })
    el.dispatchEvent(ev)
    return ev
  }

  const OUTSIDE_PLAY = ['menu', 'help', 'highscores', 'custom', 'gameover'] as const

  for (const phase of OUTSIDE_PLAY) {
    it(`pha "${phase}": không chạm mũi tên và Space, không đổi input`, () => {
      attachKeyboard(el, { input, getPhase: () => phase })

      for (const code of ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'Space', 'ShiftLeft']) {
        expect(dispatch(code).defaultPrevented).toBe(false)
      }
      expect(input).toEqual(createInput())
    })
  }

  it('pha "playing": vẫn chặn và vẫn đổi input — chống hồi quy gameplay', () => {
    attachKeyboard(el, { input, getPhase: () => 'playing' })

    expect(dispatch('ArrowLeft').defaultPrevented).toBe(true)
    expect(input.rotate).toBe(-1)
    expect(dispatch('Space').defaultPrevented).toBe(true)
    expect(input.fire).toBe(true)
  })

  it('pha "paused": chỉ sở hữu phím tạm dừng, mũi tên và Space để cho overlay', () => {
    const onPause = vi.fn()
    attachKeyboard(el, { input, onPause, getPhase: () => 'paused' })

    expect(dispatch('Escape').defaultPrevented).toBe(true)
    expect(onPause).toHaveBeenCalledTimes(1)

    expect(dispatch('ArrowLeft').defaultPrevented).toBe(false)
    expect(dispatch('Space').defaultPrevented).toBe(false)
    expect(input).toEqual(createInput())
  })

  it('pha "menu": phím tạm dừng cũng không làm gì', () => {
    const onPause = vi.fn()
    attachKeyboard(el, { input, onPause, getPhase: () => 'menu' })

    expect(dispatch('Escape').defaultPrevented).toBe(false)
    expect(onPause).not.toHaveBeenCalled()
  })

  it('rời pha playing giữa lúc đang giữ phím đẩy thì input được dọn', () => {
    // Không dọn thì trạng thái "đang đẩy" dính sang ván sau: trình duyệt không gửi
    // `keyup` cho phím đang giữ khi màn hình đã đổi.
    let phase: Phase = 'playing'
    attachKeyboard(el, { input, getPhase: () => phase })

    dispatch('ArrowUp')
    expect(input.thrust).toBe(true)

    phase = 'menu'
    dispatch('ArrowUp')
    expect(input).toEqual(createInput())
  })
})

describe('resetInput', () => {
  it('đưa mọi thứ về trung tính', () => {
    const input = { rotate: 1 as const, thrust: true, fire: true, hyperspace: true }
    resetInput(input)
    expect(input).toEqual(createInput())
  })
})
