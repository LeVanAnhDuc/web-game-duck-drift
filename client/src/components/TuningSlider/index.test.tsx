import { describe, expect, it, vi as vitestVi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { TuningSlider } from './index'

describe('TuningSlider — FR-21 · NFR-A11Y-03', () => {
  const base = { min: 1, max: 10, step: 1, onChange: () => {} }

  it('giá trị hiện ra cũng đọc được cho trình đọc màn hình', () => {
    // `valueText` nằm ở <span> bên cạnh nên AT không thấy. Không có
    // aria-valuetext thì thanh UFO đọc là "10" — mà 10 nghĩa là TẮT.
    render(<TuningSlider id="ufo" label="UFO từ wave" value={10} valueText="tắt" {...base} />)
    expect(screen.getByRole('slider', { name: 'UFO từ wave' }).getAttribute('aria-valuetext')).toBe('tắt')
    expect(screen.getByText('tắt')).toBeTruthy()
  })

  it('nhãn trỏ đúng vào thanh trượt', () => {
    render(<TuningSlider id="lives" label="Số mạng" value={3} valueText="3" {...base} />)
    expect(screen.getByLabelText('Số mạng').getAttribute('id')).toBe('lives')
  })

  it('kéo thanh trượt gọi onChange với SỐ, không phải chuỗi', () => {
    const onChange = vitestVi.fn()
    render(
      <TuningSlider
        id="lives"
        label="Số mạng"
        value={3}
        valueText="3"
        min={1}
        max={6}
        step={1}
        onChange={onChange}
      />,
    )
    fireEvent.change(screen.getByRole('slider'), { target: { value: '5' } })
    expect(onChange).toHaveBeenCalledWith(5)
  })
})
