'use client'

import type { DifficultyId } from '@/game/core/types'
import { vi } from '@/i18n/vi'
import { Button } from '@/components/Button'
import { ScreenTitle } from '@/components/ScreenTitle'
import { Segmented } from '@/components/Segmented'
import { formatScore } from '@/lib/format'
import { AccountButton } from '../../components/AccountButton'

/** Mức có bảng điểm riêng. `custom` không nằm đây — nó là NÚT, không phải lựa chọn. */
export type PresetId = Exclude<DifficultyId, 'custom'>

export const PRESETS: readonly { id: PresetId; label: string }[] = [
  { id: 'easy', label: vi.difficulty.easy },
  { id: 'normal', label: vi.difficulty.normal },
  { id: 'hard', label: vi.difficulty.hard },
]

export function MenuScreen({
  best,
  difficulty,
  onDifficulty,
  onPlay,
  onHighScores,
  onHelp,
  onCustom,
}: {
  best: number | null
  difficulty: PresetId
  onDifficulty: (id: PresetId) => void
  onPlay: () => void
  onHighScores: () => void
  onHelp: () => void
  onCustom: () => void
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-8 px-6">
      <ScreenTitle>{vi.menu.title}</ScreenTitle>

      <div className="flex w-full max-w-xs flex-col gap-3">
        {/* Dãy mức ngay trên nút Chơi: bấm Chơi là vào ván, không thêm cú bấm
            nào cho người không quan tâm — overview.md §4, Non-Goal đầu tiên. */}
        <Segmented options={PRESETS} value={difficulty} onChange={onDifficulty} label={vi.difficulty.label} />
        <Button variant="primary" onClick={onPlay} autoFocus>
          {vi.menu.play}
        </Button>

        <Button className="mt-2" onClick={onHighScores}>
          {vi.menu.highScores}
        </Button>
        <Button onClick={onHelp}>{vi.menu.help}</Button>
        <Button onClick={onCustom}>{vi.menu.custom}</Button>
      </div>

      <div className="flex flex-col items-center gap-1">
        {/* Luôn nêu MỨC, kể cả khi chưa có điểm — F-07. Đây là chỗ duy nhất ở menu nói
            về bảng điểm của mức đang chọn, nên nó phải đổi khi người chơi đổi mức. */}
        <p className="font-mono text-xs uppercase tracking-widest text-muted">
          {best === null
            ? vi.menu.noBestOf(vi.difficulty[difficulty])
            : `${vi.menu.bestOf(vi.difficulty[difficulty])}  ${formatScore(best)}`}
        </p>
        {/* Kỳ vọng chỉnh ở menu, TRƯỚC cú bấm "Bảng điểm" — F-08 · ADR-0020. */}
        <p className="text-[11px] tracking-wide text-muted">{vi.menu.localNote}</p>
        {/* Đăng nhập Ducker ID tuỳ chọn (ADR-0021): chỉ định danh, không đồng bộ gì cả.
            Cờ tắt thì AccountButton không render gì và cột này y hệt trước đây. */}
        <div className="mt-2 flex justify-center">
          <AccountButton />
        </div>
      </div>
    </div>
  )
}
