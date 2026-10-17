import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { vi as strings } from '@/i18n/vi'
import { ControlsHint } from '.'

describe('ControlsHint — F-02', () => {
  it('hiện suốt wave 1', () => {
    render(<ControlsHint wave={1} />)

    const hint = screen.getByText(new RegExp(strings.hud.controlsHint))
    expect(hint).toBeTruthy()
    // Ba phím cần để sống sót. Tên phím phải đúng thứ màn Cách chơi nói.
    expect(hint.textContent).toContain(strings.help.keyboard.rotateKeys)
    expect(hint.textContent).toContain(strings.help.keyboard.thrustKeys)
    expect(hint.textContent).toContain(strings.help.keyboard.fireKeys)
  })

  it('VẪN hiện dù đã có điểm — điểm lên không có nghĩa là đã biết chơi', () => {
    // Viên đá giết tàu cũng vỡ, và vỡ thì được điểm. Điểm lên 20 ngay ở cú chết đầu
    // tiên mà người chơi chưa làm gì. Bản đầu dùng `score === 0` nên gợi ý biến mất
    // trước khi đọc kịp — nhìn app thật mới thấy.
    render(<ControlsHint wave={1} />)
    expect(screen.getByText(new RegExp(strings.hud.controlsHint))).toBeTruthy()
  })

  it('biến mất khi qua wave 1 — qua được wave mới thật sự là đã biết chơi', () => {
    render(<ControlsHint wave={2} />)
    expect(screen.queryByText(new RegExp(strings.hud.controlsHint))).toBeNull()
  })

  it('không chen vào vùng aria-live của NFR-A11Y-06', () => {
    const { container } = render(<ControlsHint wave={1} />)
    expect(container.querySelector('[aria-live]')).toBeNull()
    expect(container.querySelector('[aria-hidden="true"]')).toBeTruthy()
  })
})
