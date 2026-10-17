import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { createInput } from '@/input/keyboard'
import { createTouchInput, isCoarsePointer } from '@/input/touch'
import { vi as strings } from '@/i18n/vi'
import { TouchControls } from './index'

/** happy-dom không có Pointer Capture API; nút phải chạy được mà không cần nó. */
function stubPointerCapture() {
  const el = HTMLElement.prototype as unknown as Record<string, unknown>
  const captured = new Set<number>()
  el.setPointerCapture = function (id: number) {
    captured.add(id)
  }
  el.releasePointerCapture = function (id: number) {
    captured.delete(id)
  }
  el.hasPointerCapture = function (id: number) {
    return captured.has(id)
  }
  return captured
}

const down = (el: Element, pointerId = 1) =>
  fireEvent.pointerDown(el, { pointerId, bubbles: true, cancelable: true })
const up = (el: Element, pointerId = 1) => fireEvent.pointerUp(el, { pointerId, bubbles: true })
const cancel = (el: Element, pointerId = 1) => fireEvent.pointerCancel(el, { pointerId, bubbles: true })

describe('TouchControls — US-03', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('nút giữ được: bấm xuống thì bật, nhả ra thì tắt', () => {
    stubPointerCapture()
    const input = createInput()
    render(<TouchControls touch={createTouchInput(input)} />)

    const thrust = screen.getByLabelText(strings.a11y.thrust)
    down(thrust)
    expect(input.thrust).toBe(true)

    up(thrust)
    expect(input.thrust).toBe(false)
  })

  it('pointercancel cũng nhả nút — cuộc gọi đến giữa lúc đang giữ không được làm kẹt tàu', () => {
    stubPointerCapture()
    const input = createInput()
    render(<TouchControls touch={createTouchInput(input)} />)

    const thrust = screen.getByLabelText(strings.a11y.thrust)
    down(thrust)
    cancel(thrust)
    expect(input.thrust).toBe(false)
  })

  it('bắt pointer khi bấm, để ngón trượt ra ngoài nút vẫn tính là đang giữ', () => {
    const captured = stubPointerCapture()
    const input = createInput()
    render(<TouchControls touch={createTouchInput(input)} />)

    down(screen.getByLabelText(strings.a11y.fire), 7)
    expect(captured.has(7)).toBe(true)
  })

  it('hai ngón hai cụm: đẩy và bắn cùng lúc đều nhận', () => {
    stubPointerCapture()
    const input = createInput()
    render(<TouchControls touch={createTouchInput(input)} />)

    down(screen.getByLabelText(strings.a11y.thrust), 1)
    down(screen.getByLabelText(strings.a11y.fire), 2)

    expect(input.thrust).toBe(true)
    expect(input.fire).toBe(true)
  })

  it('có đủ năm nút, mỗi nút một nhãn đọc được', () => {
    stubPointerCapture()
    render(<TouchControls touch={createTouchInput(createInput())} />)

    for (const label of [
      strings.a11y.rotateLeft,
      strings.a11y.rotateRight,
      strings.a11y.thrust,
      strings.a11y.fire,
      strings.a11y.hyperspace,
    ]) {
      expect(screen.getByLabelText(label)).toBeTruthy()
    }
  })

  it('mọi nút đều chặn cử chỉ cuộn/phóng to của trình duyệt', () => {
    stubPointerCapture()
    render(<TouchControls touch={createTouchInput(createInput())} />)

    for (const button of screen.getAllByRole('button')) {
      expect((button as HTMLElement).style.touchAction).toBe('none')
    }
  })

  it('không nút nào nhỏ hơn 44px — NFR-A11Y-03', () => {
    stubPointerCapture()
    render(<TouchControls touch={createTouchInput(createInput())} />)

    // happy-dom không tính layout, nên kiểm qua lớp tiện ích Tailwind: h-12 = 48px
    // là cỡ nhỏ nhất được phép xuất hiện ở đây.
    const allowed = /\bh-(12|16|20)\b/
    for (const button of screen.getAllByRole('button')) {
      expect(button.className).toMatch(allowed)
    }
  })
})

describe('isCoarsePointer', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('bật khi thiết bị dùng ngón tay', () => {
    vi.stubGlobal('matchMedia', (q: string) => ({ matches: q.includes('coarse'), media: q }))
    expect(isCoarsePointer()).toBe(true)
  })

  it('tắt trên chuột — nút cảm ứng không chiếm chỗ trên desktop', () => {
    vi.stubGlobal('matchMedia', (q: string) => ({ matches: false, media: q }))
    expect(isCoarsePointer()).toBe(false)
  })

  it('không ném lỗi khi trình duyệt không có matchMedia', () => {
    vi.stubGlobal('matchMedia', undefined)
    expect(isCoarsePointer()).toBe(false)
  })
})
