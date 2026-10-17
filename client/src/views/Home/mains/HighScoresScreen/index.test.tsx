import { describe, expect, it, vi as vitestVi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { HighScoresScreen } from './index'
import { vi as strings } from '@/i18n/vi'
import type { ScoreEntry } from '@/game/core/types'

const noop = () => {}

describe('HighScoresScreen', () => {
  const entry = (score: number, at: number): ScoreEntry => ({ initials: 'ABC', score, wave: 2, at })

  it('bảng trống thì nói rõ, không hiện bảng rỗng — US-06', () => {
    render(
      <HighScoresScreen
        entries={[]}
        difficulty="normal"
        onDifficulty={() => {}}
        onBack={() => {}}
        onClear={() => {}}
      />,
    )
    expect(screen.getByText(strings.highScores.emptyOf(strings.difficulty.normal))).toBeTruthy()
    expect(screen.queryByRole('table')).toBeNull()
  })

  it('bảng trống thì không hiện nút xoá', () => {
    render(
      <HighScoresScreen
        entries={[]}
        difficulty="normal"
        onDifficulty={() => {}}
        onBack={() => {}}
        onClear={() => {}}
      />,
    )
    expect(screen.queryByRole('button', { name: /Xoá bảng/ })).toBeNull()
  })

  it('làm nổi đúng dòng vừa thêm', () => {
    const rows = [entry(300, 111), entry(100, 222)]
    const { container } = render(
      <HighScoresScreen
        entries={rows}
        difficulty="normal"
        onDifficulty={() => {}}
        highlightAt={222}
        onBack={() => {}}
        onClear={() => {}}
      />,
    )
    const highlighted = container.querySelectorAll('tr.bg-primary\\/15')
    expect(highlighted).toHaveLength(1)
  })
})

describe('bảng điểm ba tab — FR-22', () => {
  const rows: ScoreEntry[] = [{ initials: 'DUC', score: 12400, wave: 7, at: 1_757_000_000_000 }]
  const table = (difficulty: 'easy' | 'normal' | 'hard', entries = rows, onDifficulty = noop) => (
    <HighScoresScreen
      entries={entries}
      difficulty={difficulty}
      onDifficulty={onDifficulty}
      highlightAt={null}
      onBack={noop}
      onClear={noop}
    />
  )

  it('ba tab, tab của mức đang xem được chọn', () => {
    render(table('hard'))
    expect(screen.getAllByRole('tab')).toHaveLength(3)
    expect(screen.getByRole('tab', { selected: true }).textContent).toBe(strings.difficulty.hard)
  })

  it('nút xoá ghi rõ nó xoá bảng nào — nó chỉ xoá tab đang mở', () => {
    render(table('easy'))
    expect(
      screen.getByRole('button', { name: strings.highScores.clearOf(strings.difficulty.easy) }),
    ).toBeTruthy()
  })

  it('bảng trống thì nói rõ mức nào trống, và nút xoá biến mất hẳn', () => {
    render(table('hard', []))
    expect(screen.getByText(strings.highScores.emptyOf(strings.difficulty.hard))).toBeTruthy()
    expect(screen.queryByRole('button', { name: /Xoá bảng/ })).toBeNull()
  })

  it('bấm tab khác gọi onDifficulty', () => {
    const onDifficulty = vitestVi.fn()
    render(table('normal', rows, onDifficulty))
    fireEvent.click(screen.getByRole('tab', { name: strings.difficulty.hard }))
    expect(onDifficulty).toHaveBeenCalledWith('hard')
  })
})
