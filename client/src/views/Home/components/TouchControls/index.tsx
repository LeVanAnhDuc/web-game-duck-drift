'use client'

import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react'
import { vi } from '@/i18n/vi'
import type { TouchAction, TouchInput } from '@/input/touch'

/**
 * Nút giữ được, không phải nút bấm. Ba chi tiết dễ bỏ sót, mỗi cái đều làm game
 * không chơi được trên điện thoại (US-03):
 *  - `setPointerCapture` để ngón trượt ra ngoài nút vẫn tính là đang giữ, còn
 *    `pointercancel` (cuộc gọi đến, chuyển app) thì phải nhả.
 *  - `touch-action: none` để trình duyệt không hiểu thành cuộn hay phóng to.
 *  - vùng bấm ≥ 44px — NFR-A11Y-03.
 */
function HoldButton({
  action,
  touch,
  label,
  children,
  className = '',
}: {
  action: TouchAction
  touch: TouchInput
  label: string
  children: ReactNode
  className?: string
}) {
  const press = (e: ReactPointerEvent<HTMLButtonElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    touch.set(action, true)
    e.preventDefault()
  }

  const release = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
    touch.set(action, false)
  }

  return (
    <button
      type="button"
      aria-label={label}
      onPointerDown={press}
      onPointerUp={release}
      onPointerCancel={release}
      onContextMenu={(e) => e.preventDefault()}
      className={`flex select-none items-center justify-center rounded-xl border border-hairline bg-surface/70 text-fg/80 transition-colors active:border-primary active:bg-primary/20 active:text-fg ${className}`}
      style={{ touchAction: 'none', WebkitTapHighlightColor: 'transparent' }}
    >
      {children}
    </button>
  )
}

export function TouchControls({ touch }: { touch: TouchInput }) {
  return (
    <div className="flex w-full items-end justify-between gap-3 px-3 pb-3 pt-2">
      {/* Cụm trái: ngón cái trái xoay */}
      <div className="flex gap-3">
        <HoldButton action="left" touch={touch} label={vi.a11y.rotateLeft} className="h-16 w-16">
          <RotateIcon />
        </HoldButton>
        <HoldButton action="right" touch={touch} label={vi.a11y.rotateRight} className="h-16 w-16">
          <RotateIcon flipped />
        </HoldButton>
      </div>

      {/* Giữa: hiếm dùng, tách hẳn khỏi hai cụm ngón cái để không bấm nhầm */}
      <HoldButton action="hyperspace" touch={touch} label={vi.a11y.hyperspace} className="h-12 w-12">
        <HyperIcon />
      </HoldButton>

      {/* Cụm phải: ngón cái phải đẩy và bắn */}
      <div className="flex items-end gap-3">
        <HoldButton action="thrust" touch={touch} label={vi.a11y.thrust} className="h-16 w-16">
          <ThrustIcon />
        </HoldButton>
        <HoldButton action="fire" touch={touch} label={vi.a11y.fire} className="h-20 w-20 text-accent">
          <FireIcon />
        </HoldButton>
      </div>
    </div>
  )
}

function RotateIcon({ flipped = false }: { flipped?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={`h-7 w-7 ${flipped ? '-scale-x-100' : ''}`} aria-hidden="true">
      <path
        d="M17 8 A7 7 0 1 0 19 13"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M17 3 L17 9 L11 9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ThrustIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
      <path
        d="M12 3 L18 19 L12 15.5 L6 19 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function FireIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8" aria-hidden="true">
      <circle cx="12" cy="12" r="4" fill="currentColor" />
      <circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.4" opacity="0.5" />
    </svg>
  )
}

function HyperIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
      <path d="M4 12 H16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path
        d="M12 7 L17 12 L12 17"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M20 6 V18"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  )
}
