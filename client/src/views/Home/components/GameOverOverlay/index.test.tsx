import { describe, expect, it, vi as vitestVi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { GameOverOverlay } from './index'
import { vi as strings } from '@/i18n/vi'

const noop = () => {}

describe('GameOverOverlay — US-02', () => {
  it('không lọt bảng thì KHÔNG hỏi tên', () => {
    render(
      <GameOverOverlay
        score={120}
        wave={2}
        rank={null}
        canSave
        onSubmit={() => {}}
        onPlayAgain={() => {}}
        onMenu={() => {}}
      />,
    )
    expect(screen.queryByRole('group')).toBeNull()
    expect(screen.getByText(strings.gameOver.noRank)).toBeTruthy()
  })

  it('lọt bảng thì hỏi tên và gửi đúng ba ký tự in hoa', () => {
    const onSubmit = vitestVi.fn()
    render(
      <GameOverOverlay
        score={5000}
        wave={4}
        rank={2}
        canSave
        onSubmit={onSubmit}
        onPlayAgain={() => {}}
        onMenu={() => {}}
      />,
    )

    fireEvent.click(screen.getByText(strings.gameOver.save))
    expect(onSubmit).toHaveBeenCalledWith('AAA')
  })

  it('lưu xong thì ô nhập tên biến mất — không lưu được hai lần', () => {
    render(
      <GameOverOverlay
        score={5000}
        wave={4}
        rank={2}
        canSave
        onSubmit={() => {}}
        onPlayAgain={() => {}}
        onMenu={() => {}}
      />,
    )

    fireEvent.click(screen.getByText(strings.gameOver.save))
    expect(screen.queryByText(strings.gameOver.save)).toBeNull()
  })
})

describe('màn Hết lượt ở ván tuỳ chỉnh — FR-21', () => {
  it('không hỏi tên và không hiện thứ hạng khi ván không ghi bảng', () => {
    render(
      <GameOverOverlay
        score={5000}
        wave={4}
        rank={1}
        canSave={false}
        onSubmit={noop}
        onPlayAgain={noop}
        onMenu={noop}
      />,
    )
    expect(screen.queryByRole('button', { name: strings.gameOver.save })).toBeNull()
    expect(screen.getByText(strings.gameOver.customNoSave)).toBeTruthy()
    expect(screen.queryByText(strings.gameOver.rank)).toBeNull()
  })

  it('ván mức sẵn thì vẫn hỏi tên như trước', () => {
    render(
      <GameOverOverlay
        score={5000}
        wave={4}
        rank={1}
        canSave
        onSubmit={noop}
        onPlayAgain={noop}
        onMenu={noop}
      />,
    )
    expect(screen.getByRole('button', { name: strings.gameOver.save })).toBeTruthy()
  })
})

// F-04 · F-05 của UX review 2026-09-11.
describe('không để mất điểm âm thầm', () => {
  it('nhãn khối ba ký tự NHÌN THẤY ĐƯỢC, không chỉ là aria-label — F-04', () => {
    render(
      <GameOverOverlay
        score={40}
        wave={1}
        rank={1}
        canSave
        onSubmit={() => {}}
        onPlayAgain={() => {}}
        onMenu={() => {}}
      />,
    )

    // Persona cảm ứng đọc ba chữ A với sáu chevron thành "ô nhập mã bí mật" và sợ nó
    // tính tiền. Chuỗi này trước đây chỉ vào `aria-label`, tức chỉ tới trình đọc màn hình.
    const labels = screen.getAllByText(strings.gameOver.enterName)
    expect(labels.some((el) => el.tagName !== 'DIV' || !el.getAttribute('aria-label'))).toBe(true)
    expect(screen.getByText(strings.gameOver.initialsHelp)).toBeTruthy()
  })

  it('cảnh báo chưa lưu khi có hạng và chưa lưu — F-05', () => {
    render(
      <GameOverOverlay
        score={40}
        wave={1}
        rank={1}
        canSave
        onSubmit={() => {}}
        onPlayAgain={() => {}}
        onMenu={() => {}}
      />,
    )
    expect(screen.getByText(strings.gameOver.unsavedWarning)).toBeTruthy()
  })

  it('KHÔNG cảnh báo khi không lọt bảng — không có gì để mất', () => {
    render(
      <GameOverOverlay
        score={40}
        wave={1}
        rank={null}
        canSave
        onSubmit={() => {}}
        onPlayAgain={() => {}}
        onMenu={() => {}}
      />,
    )
    expect(screen.queryByText(strings.gameOver.unsavedWarning)).toBeNull()
  })

  it('KHÔNG cảnh báo sau khi đã lưu', () => {
    render(
      <GameOverOverlay
        score={40}
        wave={1}
        rank={1}
        canSave
        onSubmit={() => {}}
        onPlayAgain={() => {}}
        onMenu={() => {}}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: strings.gameOver.save }))
    expect(screen.queryByText(strings.gameOver.unsavedWarning)).toBeNull()
  })
})
