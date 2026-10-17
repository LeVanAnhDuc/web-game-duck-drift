import { render, screen } from '@testing-library/react'
import { useCallback, useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { FreezeRankAtGameOver } from '.'

/**
 * Lưu ý về phạm vi: F-01 nằm ở CÁCH NỐI DÂY trong `views/Home` — hạng được giữ trong
 * `useRef` rồi đọc lúc render, nên gán vào `.current` không làm overlay render lại.
 * Ghost này khi đó vẫn đúng. Nên test dưới đây khoá HỢP ĐỒNG của ghost, còn thứ bắt
 * được chính F-01 là test e2e "ván đầu sau khi tải trang hiện hạng và form".
 *
 * Bài học đáng khoá lại: một người tiêu thụ giữ giá trị trong state thì thấy hạng
 * ngay ở lần render đầu của overlay — đó là điều `useLayoutEffect` bảo đảm.
 */
describe('FreezeRankAtGameOver', () => {
  const resolveRank = vi.fn((_id: string, score: number) => (score > 0 ? 1 : null))

  it('chốt hạng khi pha chuyển sang gameover', () => {
    const onFreeze = vi.fn()
    render(
      <FreezeRankAtGameOver
        phase="gameover"
        score={40}
        difficulty="hard"
        canSave
        resolveRank={resolveRank}
        onFreeze={onFreeze}
      />,
    )

    expect(onFreeze).toHaveBeenCalledWith(1)
  })

  it('không chốt gì ở các pha khác', () => {
    const onFreeze = vi.fn()
    render(
      <FreezeRankAtGameOver
        phase="playing"
        score={40}
        difficulty="hard"
        canSave
        resolveRank={resolveRank}
        onFreeze={onFreeze}
      />,
    )

    expect(onFreeze).not.toHaveBeenCalled()
  })

  it('ván tuỳ chỉnh không có hạng — FR-21', () => {
    const onFreeze = vi.fn()
    render(
      <FreezeRankAtGameOver
        phase="gameover"
        score={40}
        difficulty="custom"
        canSave={false}
        resolveRank={resolveRank}
        onFreeze={onFreeze}
      />,
    )

    expect(onFreeze).toHaveBeenCalledWith(null)
    expect(resolveRank).not.toHaveBeenCalledWith('custom', 40)
  })

  it('người tiêu thụ giữ hạng trong state thì thấy ngay ở lần render đầu — ADR-0016', () => {
    // Đây là hình dạng nối dây đúng của `views/Home`. Với `useRef` thì dòng dưới đọc
    // ra "chưa có hạng" ở ván đầu tiên, đúng F-01.
    function Harness() {
      const [rank, setRank] = useState<number | null>(null)
      const onFreeze = useCallback((next: number | null) => setRank(next), [])
      return (
        <>
          <FreezeRankAtGameOver
            phase="gameover"
            score={40}
            difficulty="hard"
            canSave
            resolveRank={resolveRank}
            onFreeze={onFreeze}
          />
          <output>{rank === null ? 'chưa có hạng' : `#${rank}`}</output>
        </>
      )
    }

    render(<Harness />)
    expect(screen.getByText('#1')).toBeTruthy()
  })
})
