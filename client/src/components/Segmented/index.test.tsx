import { describe, expect, it, vi as vitestVi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { Segmented } from './index'

describe('Segmented — FR-20 · FR-22', () => {
  const options = [
    { id: 'easy' as const, label: 'Dễ' },
    { id: 'normal' as const, label: 'Thường' },
    { id: 'hard' as const, label: 'Khó' },
  ]

  it('ở menu là nhóm nút bật/tắt: đúng một cái aria-pressed=true', () => {
    render(<Segmented options={options} value="normal" onChange={() => {}} label="Độ khó" />)
    expect(screen.getByRole('button', { name: 'Thường' }).getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByRole('button', { name: 'Dễ' }).getAttribute('aria-pressed')).toBe('false')
  })

  it('ở bảng điểm là tab thật, không phải nút bật/tắt', () => {
    // Cùng một hình, hai ngữ nghĩa: ở menu là lựa chọn để dùng SAU khi bấm Chơi,
    // ở bảng điểm nó lọc ngay cái bảng bên dưới.
    render(
      <Segmented
        options={options}
        value="easy"
        onChange={() => {}}
        label="Bảng điểm"
        variant="tablist"
        controls="scores-panel"
      />,
    )
    expect(screen.getByRole('tablist')).toBeTruthy()
    expect(screen.getByRole('tab', { selected: true }).textContent).toBe('Dễ')
    expect(screen.getByRole('tab', { name: 'Dễ' }).getAttribute('aria-controls')).toBe('scores-panel')
  })

  it('bấm một lựa chọn gọi onChange với id của nó', () => {
    const onChange = vitestVi.fn()
    render(<Segmented options={options} value="normal" onChange={onChange} label="Độ khó" />)
    fireEvent.click(screen.getByRole('button', { name: 'Dễ' }))
    expect(onChange).toHaveBeenCalledWith('easy')
  })
})

// F-07 của UX review 2026-09-11: persona đổi mức rồi không tin là đã đổi được —
// "hình như chọn được rồi, nhưng tôi không chắc lắm nên bấm lại thêm một lần cho
// chắc ăn". Trạng thái đang chọn phải khác bằng NHIỀU HƠN một sắc nền.
describe('trạng thái đang chọn đủ khác để tin — F-07', () => {
  const OPTIONS = [
    { id: 'easy', label: 'Dễ' },
    { id: 'normal', label: 'Thường' },
    { id: 'hard', label: 'Khó' },
  ] as const

  it('nút đang chọn khác nút không chọn ở nhiều tín hiệu, không chỉ màu — NFR-A11Y-04', () => {
    render(<Segmented options={OPTIONS} value="easy" onChange={() => {}} label="Độ khó" />)

    const on = screen.getByRole('button', { name: 'Dễ' })
    const off = screen.getByRole('button', { name: 'Thường' })

    // aria-pressed là tín hiệu cho trợ năng — đã có từ trước, khoá lại để không mất.
    expect(on.getAttribute('aria-pressed')).toBe('true')
    expect(off.getAttribute('aria-pressed')).toBe('false')

    // Và trên màn: chữ đậm hơn, viền đặc, cộng một chấm chỉ thị.
    expect(on.className).toContain('font-semibold')
    expect(off.className).not.toContain('font-semibold')
    expect(on.className).toContain('border-primary')
    expect(on.querySelector('span[aria-hidden="true"]')).toBeTruthy()
    expect(off.querySelector('span[aria-hidden="true"]')).toBeNull()
  })
})
