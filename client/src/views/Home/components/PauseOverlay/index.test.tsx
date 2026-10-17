import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { vi as strings } from '@/i18n/vi'
import { PauseOverlay } from '.'

describe('PauseOverlay — F-05', () => {
  it('nói hậu quả của "Về menu" TRƯỚC cú bấm, kèm số điểm đang có', () => {
    // Hai persona bấm nút này vì tin nó an toàn: p02 "nghĩ chắc điểm 40 vẫn được lưu
    // lại", p04 "bấm Về menu cho chắc ăn". Cả hai mất điểm.
    render(<PauseOverlay score={40} onResume={() => {}} onMenu={() => {}} />)

    const warning = screen.getByText(strings.pause.toMenuWarning('40'))
    expect(warning).toBeTruthy()
    expect(warning.textContent).toContain('40')
  })

  it('chưa có điểm thì KHÔNG nhắc tới điểm', () => {
    // "0 điểm sẽ không được ghi" là cảnh báo về một mất mát không tồn tại — đúng cái
    // mà ADR-0019 nói là dạy người ta bỏ qua cảnh báo.
    render(<PauseOverlay score={0} onResume={() => {}} onMenu={() => {}} />)

    const warning = screen.getByText(strings.pause.toMenuWarning(null))
    expect(warning.textContent).not.toContain('0')
  })

  it('vẫn có hai lối đi cũ, không thêm bước xác nhận nào', () => {
    render(<PauseOverlay score={0} onResume={() => {}} onMenu={() => {}} />)
    expect(screen.getByRole('button', { name: strings.pause.resume })).toBeTruthy()
    expect(screen.getByRole('button', { name: strings.pause.toMenu })).toBeTruthy()
  })
})
