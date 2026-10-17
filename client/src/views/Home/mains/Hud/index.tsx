'use client'

import { POWERUP } from '@/game/core/constants'
import type { HudSnapshot } from '@/game/core/types'
import { vi } from '@/i18n/vi'
import { formatScore } from '@/lib/format'
import { PowerUpMark } from '../../components/PowerUpMark'

const WEAPON_COLOR = {
  rapid: 'text-power-rapid',
  spread: 'text-power-spread',
  pierce: 'text-power-pierce',
} as const

export function Hud({ hud, onPause }: { hud: HudSnapshot; onPause: () => void }) {
  return (
    <div className="pointer-events-none flex w-full flex-col gap-1">
      <div className="flex items-center justify-between gap-3 px-1 py-1 font-mono text-sm tabular-nums">
        <div className="flex items-center gap-2" aria-label={`${vi.hud.lives}: ${hud.lives}`}>
          {Array.from({ length: Math.max(0, hud.lives) }, (_, i) => (
            <ShipPip key={i} />
          ))}
          {hud.shield ? <ShieldPip /> : null}
        </div>

        <span
          data-testid="hud-score"
          className="text-base text-accent"
          aria-label={`${vi.hud.score}: ${hud.score}`}
        >
          {formatScore(hud.score)}
        </span>

        <div className="flex items-center gap-2">
          {/* testid vì chuỗi "Wave 1" cũng xuất hiện trong vùng aria-live;
              e2e cần trỏ đúng vào HUD chứ không phải vào thông báo. */}
          <span data-testid="hud-wave" className="text-muted">
            {vi.hud.wave} {hud.wave}
          </span>
          <button
            type="button"
            onClick={onPause}
            aria-label={vi.hud.pause}
            className="pointer-events-auto flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg border border-hairline text-muted transition-colors hover:text-fg"
          >
            <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true">
              <rect x="4" y="3" width="3" height="10" fill="currentColor" />
              <rect x="9" y="3" width="3" height="10" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>

      {/* Thanh vũ khí chỉ tồn tại khi đang có power-up — không chiếm chỗ khi rỗng. */}
      {hud.weapon ? (
        <div className="flex items-center gap-2 px-1">
          <PowerUpMark kind={hud.weapon} className={`h-4 w-4 ${WEAPON_COLOR[hud.weapon]}`} />
          <span className={`text-xs uppercase tracking-widest ${WEAPON_COLOR[hud.weapon]}`}>
            {vi.powerUps[hud.weapon].name}
          </span>
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-hairline">
            <div
              className="h-full bg-current transition-[width] duration-200"
              style={{ width: `${Math.min(100, (hud.weaponMs / POWERUP.effectMs) * 100)}%` }}
            />
          </div>
          <span className="font-mono text-xs tabular-nums text-muted">{Math.ceil(hud.weaponMs / 1000)}s</span>
        </div>
      ) : null}
    </div>
  )
}

function ShipPip() {
  return (
    <svg viewBox="0 0 12 14" className="h-3.5 w-3" aria-hidden="true">
      <path d="M6 1 L11 13 L6 10 L1 13 Z" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}

function ShieldPip() {
  return (
    <svg viewBox="0 0 14 14" className="h-3.5 w-3.5 text-power-shield" aria-hidden="true">
      <path
        d="M7 1 L12.2 4 L12.2 10 L7 13 L1.8 10 L1.8 4 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      />
    </svg>
  )
}
