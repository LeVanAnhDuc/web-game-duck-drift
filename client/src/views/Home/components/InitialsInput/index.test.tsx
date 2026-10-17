import { describe, expect, it, vi as vitestVi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { InitialsInput } from './index'

describe('InitialsInput', () => {
  it('mũi tên lên đổi ký tự đang chọn', () => {
    const onChange = vitestVi.fn()
    render(<InitialsInput value="AAA" onChange={onChange} label="Tên" />)

    fireEvent.keyDown(screen.getByRole('group'), { key: 'ArrowUp' })
    expect(onChange).toHaveBeenCalledWith('BAA')
  })

  it('gõ chữ ghi thẳng vào ô đang chọn rồi nhảy sang ô sau', () => {
    const onChange = vitestVi.fn()
    render(<InitialsInput value="AAA" onChange={onChange} label="Tên" />)

    const group = screen.getByRole('group')
    fireEvent.keyDown(group, { key: 'z' })
    expect(onChange).toHaveBeenCalledWith('ZAA')
  })

  it('quay vòng từ A xuống Z', () => {
    const onChange = vitestVi.fn()
    render(<InitialsInput value="AAA" onChange={onChange} label="Tên" />)

    fireEvent.keyDown(screen.getByRole('group'), { key: 'ArrowDown' })
    expect(onChange).toHaveBeenCalledWith('ZAA')
  })

  it('có nút tăng giảm cho cả ba ký tự — dùng được bằng ngón tay', () => {
    render(<InitialsInput value="AAA" onChange={() => {}} label="Tên" />)
    expect(screen.getAllByRole('button')).toHaveLength(6)
  })
})
