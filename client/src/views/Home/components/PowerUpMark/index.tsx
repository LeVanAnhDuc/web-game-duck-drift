import type { PowerUpKind } from '@/game/core/types'

/**
 * Ký hiệu hình học của từng loại power-up — cùng bộ hình mà canvas vẽ.
 * Mã hoá kép màu + hình là bắt buộc (NFR-A11Y-04): chỉ dựa vào màu thì người mù
 * màu đỏ–lục không phân biệt được `pierce` với `life`.
 */
export function PowerUpMark({ kind, className = '' }: { kind: PowerUpKind; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      {kind === 'shield' && <path d="M12 3 L20 7.5 L20 16.5 L12 21 L4 16.5 L4 7.5 Z" />}
      {kind === 'rapid' && (
        <>
          <path d="M6 7 L12 11 L18 7" />
          <path d="M6 12 L12 16 L18 12" />
          <path d="M6 17 L12 21 L18 17" />
        </>
      )}
      {kind === 'spread' && (
        <>
          <path d="M12 21 L12 4" />
          <path d="M12 21 L5 8" />
          <path d="M12 21 L19 8" />
        </>
      )}
      {kind === 'pierce' && (
        <>
          <path d="M12 21 L12 3" />
          <path d="M7 9 L12 3 L17 9" />
          <path d="M8 14 L16 14" />
        </>
      )}
      {kind === 'life' && (
        <>
          <path d="M12 5 L12 19" />
          <path d="M5 12 L19 12" />
        </>
      )}
    </svg>
  )
}
