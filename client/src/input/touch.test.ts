import { describe, expect, it } from 'vitest'
import { createInput } from './keyboard'
import { createTouchInput } from './touch'

describe('createTouchInput', () => {
  it('cảm ứng và bàn phím cho ra cùng một hình dạng InputState', () => {
    const input = createInput()
    const touch = createTouchInput(input)

    touch.set('left', true)
    expect(input).toEqual({ rotate: -1, thrust: false, fire: false, hyperspace: false })
  })

  it('giữ hai nút xoay thì đứng yên, nhả một nút thì quay lại nút còn lại', () => {
    const input = createInput()
    const touch = createTouchInput(input)

    touch.set('left', true)
    touch.set('right', true)
    expect(input.rotate).toBe(0)

    touch.set('right', false)
    expect(input.rotate).toBe(-1)
  })

  it('nhận đẩy và bắn cùng lúc — hai ngón hai cụm', () => {
    const input = createInput()
    const touch = createTouchInput(input)

    touch.set('thrust', true)
    touch.set('fire', true)
    expect(input.thrust).toBe(true)
    expect(input.fire).toBe(true)
  })

  it('releaseAll nhả sạch — dùng khi ngón trượt ra ngoài nút', () => {
    const input = createInput()
    const touch = createTouchInput(input)

    touch.set('left', true)
    touch.set('thrust', true)
    touch.set('fire', true)
    touch.releaseAll()

    expect(input).toEqual(createInput())
    expect(touch.isPressed('thrust')).toBe(false)
  })

  it('nhả một nút không đụng tới nút đang giữ khác', () => {
    const input = createInput()
    const touch = createTouchInput(input)

    touch.set('thrust', true)
    touch.set('fire', true)
    touch.set('fire', false)

    expect(input.thrust).toBe(true)
    expect(input.fire).toBe(false)
  })
})
