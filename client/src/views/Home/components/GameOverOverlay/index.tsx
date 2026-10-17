'use client'

// libs
import { useState } from 'react'

// components
import { Button } from '@/components/Button'
import { Panel } from '@/components/Panel'
import { Stat } from '@/components/Stat'
import { Backdrop } from '../Backdrop'
import { InitialsInput } from '../InitialsInput'

// others
import { vi } from '@/i18n/vi'
import { formatScore } from '@/lib/format'
import { normalizeInitials } from '@/storage/scoreStore'

export function GameOverOverlay({
  score,
  wave,
  rank,
  canSave,
  onSubmit,
  onPlayAgain,
  onMenu,
}: {
  score: number
  wave: number
  /** `null` nghĩa là không lọt top 10 — khi đó KHÔNG hỏi tên (US-02). */
  rank: number | null
  /**
   * `false` ở ván tuỳ chỉnh: ván đó không ghi bảng nào (FR-21). Hỏi tên rồi vứt
   * điểm đi tệ hơn không hỏi, nên không hỏi, và cũng không hiện thứ hạng.
   */
  canSave: boolean
  onSubmit: (initials: string) => void
  onPlayAgain: () => void
  onMenu: () => void
}) {
  const [initials, setInitials] = useState('AAA')
  const [saved, setSaved] = useState(false)

  const save = () => {
    onSubmit(normalizeInitials(initials))
    setSaved(true)
  }

  return (
    <Backdrop>
      <Panel className="flex w-full max-w-sm flex-col gap-5 p-6">
        <h2 className="text-center text-sm uppercase tracking-[0.3em] text-muted">{vi.gameOver.title}</h2>

        <div className="flex flex-col gap-2">
          <Stat label={vi.gameOver.score} value={formatScore(score)} />
          <Stat label={vi.gameOver.wave} value={wave} />
          {canSave ? (
            <Stat label={vi.gameOver.rank} value={rank === null ? vi.gameOver.noRank : `#${rank}`} />
          ) : (
            <p className="text-xs leading-relaxed text-muted">{vi.gameOver.customNoSave}</p>
          )}
        </div>

        {canSave && rank !== null && !saved ? (
          <div className="flex flex-col gap-3">
            {/* Nhãn phải NHÌN THẤY ĐƯỢC — F-04 · ADR-0019. Trước đây `enterName` chỉ
                vào `aria-label`, nên trên màn chỉ có ba chữ A và sáu chevron: đúng
                hình dạng một ô nhập mã. Một persona sợ nó tính tiền rồi bỏ luôn. */}
            <div className="flex flex-col gap-1 text-center">
              <span className="text-xs uppercase tracking-widest text-muted">{vi.gameOver.enterName}</span>
              <span className="text-xs leading-relaxed text-muted">{vi.gameOver.initialsHelp}</span>
            </div>
            <InitialsInput value={initials} onChange={setInitials} label={vi.gameOver.enterName} />
            <Button variant="primary" onClick={save}>
              {vi.gameOver.save}
            </Button>
          </div>
        ) : null}

        <div className="flex flex-col gap-3">
          <Button variant="primary" onClick={onPlayAgain} autoFocus={!canSave || rank === null}>
            {vi.gameOver.playAgain}
          </Button>
          {/* Chỉ khi thật sự có gì để mất — F-05. Cảnh báo sai chỗ dạy người ta bỏ qua
              cảnh báo. */}
          {canSave && rank !== null && !saved ? (
            <p className="text-center text-xs leading-relaxed text-muted">{vi.gameOver.unsavedWarning}</p>
          ) : null}
          <Button onClick={onMenu}>{vi.gameOver.toMenu}</Button>
        </div>
      </Panel>
    </Backdrop>
  )
}
