'use client'

// components
import { Button } from '@/components/Button'
import { Panel } from '@/components/Panel'
import { Backdrop } from '../Backdrop'

// others
import { vi } from '@/i18n/vi'
import { formatScore } from '@/lib/format'

export function PauseOverlay({
  score,
  onResume,
  onMenu,
}: {
  /** Điểm đang có — vào câu cảnh báo, để hậu quả là một con số chứ không phải ý niệm. */
  score: number
  onResume: () => void
  onMenu: () => void
}) {
  return (
    <Backdrop>
      <Panel className="flex w-full max-w-xs flex-col gap-4 p-6">
        <h2 className="text-center text-sm uppercase tracking-[0.3em] text-muted">{vi.pause.title}</h2>
        <Button variant="primary" onClick={onResume} autoFocus>
          {vi.pause.resume}
        </Button>
        {/* Hậu quả nói TRƯỚC cú bấm — F-05 · ADR-0019. Đặt trên nút, đúng khuôn mà
            màn Tuỳ chỉnh đã dùng và đã được kiểm bằng người thật. */}
        <p className="text-center text-xs leading-relaxed text-muted">
          {vi.pause.toMenuWarning(score > 0 ? formatScore(score) : null)}
        </p>
        <Button onClick={onMenu}>{vi.pause.toMenu}</Button>
      </Panel>
    </Backdrop>
  )
}
