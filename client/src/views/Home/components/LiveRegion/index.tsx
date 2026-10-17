'use client'

import { vi } from '@/i18n/vi'

/**
 * Lõi phát khoá (`constants.ts` §ANNOUNCE) chứ không phát chuỗi tiếng Việt, vì
 * lõi không được import module chuỗi (bất biến #1) mà chuỗi thì chỉ được nằm ở
 * một chỗ (NFR-I18N-01). Việc dịch xảy ra ở đây.
 */
export function translateAnnouncement(key: string | null): string {
  if (!key) return ''
  const [kind, arg] = key.split(':')
  const n = Number(arg)

  switch (kind) {
    case 'wave':
      return vi.announce.waveStart(n)
    case 'lifeLost':
      return vi.announce.lifeLost(n)
    case 'extraLife':
      return vi.announce.extraLife
    case 'gameOver':
      return vi.announce.gameOver(Number.isFinite(n) ? n : 0)
    default:
      return ''
  }
}

/** Người dùng trình đọc màn hình không thấy canvas — NFR-A11Y-06. */
export function LiveRegion({ message }: { message: string }) {
  return (
    <div aria-live="polite" aria-atomic="true" className="sr-only">
      {message}
    </div>
  )
}
