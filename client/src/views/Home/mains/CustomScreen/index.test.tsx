import { describe, expect, it, vi as vitestVi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { CustomScreen } from './index'
import { vi as strings } from '@/i18n/vi'
import { DIFFICULTY, UFO_NEVER } from '@/game/core/constants'

const noop = () => {}

describe('CustomScreen — FR-21', () => {
  const custom = (tuning = DIFFICULTY.normal) => (
    <CustomScreen tuning={tuning} onChange={noop} onPlay={noop} onBack={noop} />
  )

  it('bốn thanh trượt, không ba không năm', () => {
    render(custom())
    expect(screen.getAllByRole('slider')).toHaveLength(4)
  })

  it('nói TRƯỚC khi chơi rằng ván này không ghi bảng điểm', () => {
    render(custom())
    expect(screen.getByText(strings.custom.notSaved)).toBeTruthy()
  })

  it('mốc cuối của núm UFO hiện là "tắt", không phải số 10', () => {
    render(custom({ ...DIFFICULTY.normal, ufoFirstWave: UFO_NEVER }))
    expect(
      screen.getByRole('slider', { name: strings.custom.ufoFirstWave }).getAttribute('aria-valuetext'),
    ).toBe(strings.custom.ufoOff)
  })

  it('tỉ lệ rơi hiện theo phần trăm, không phải 0.08', () => {
    render(custom())
    expect(
      screen.getByRole('slider', { name: strings.custom.dropChance }).getAttribute('aria-valuetext'),
    ).toBe('8%')
  })

  it('kéo một núm gọi onChange với cả bốn số, ba núm kia không đổi', () => {
    const onChange = vitestVi.fn()
    render(<CustomScreen tuning={DIFFICULTY.normal} onChange={onChange} onPlay={noop} onBack={noop} />)
    fireEvent.change(screen.getByRole('slider', { name: strings.custom.startLives }), {
      target: { value: '6' },
    })
    expect(onChange).toHaveBeenCalledWith({ ...DIFFICULTY.normal, startLives: 6 })
  })
})
