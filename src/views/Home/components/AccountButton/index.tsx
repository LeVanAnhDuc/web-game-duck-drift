'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/Button'
import { useAccountMenu } from '@/hooks/useAccountMenu'
import { useDuckerAuth } from '@/hooks/useDuckerAuth'
import { vi } from '@/i18n/vi'
import { initialOf } from '@/lib/initials'

const ITEM =
  'flex min-h-11 w-full cursor-pointer items-center rounded-lg px-3 text-left text-sm text-fg ' +
  'transition-colors hover:bg-primary/15'

/** Biểu tượng người — SVG inline, dự án không có thư viện icon. */
function UserIcon() {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
    </svg>
  )
}

/**
 * Đăng nhập Ducker ID tuỳ chọn của Duck Drift (ADR-0021). Cờ tắt ⇒ không render gì cả,
 * kể cả wrapper. Menu là `.panel` (khung hairline + bốn vạch góc) — MASTER.md §0.
 */
export function AccountButton() {
  const auth = useDuckerAuth()
  const menu = useAccountMenu()
  const signInRef = useRef<HTMLButtonElement>(null)
  const refocusSignIn = useRef(false)
  const [brokenPicture, setBrokenPicture] = useState<string | null>(null)

  // Sau "Đăng xuất" nút mở menu biến mất; đưa focus sang nút Đăng nhập cùng chỗ,
  // không để nó rơi về <body>.
  useEffect(() => {
    if (refocusSignIn.current && signInRef.current) {
      refocusSignIn.current = false
      signInRef.current.focus()
    }
  })

  if (!auth.enabled) return null

  const { profile } = auth
  if (auth.status !== 'signed-in' || !profile) {
    // idle (HTML tĩnh / render đầu) và loading đều là nút vô hiệu cùng kích thước nút Đăng nhập:
    // bấm trước khi hydrate không làm gì, và hàng không nhảy khi trạng thái đổi.
    const busy = auth.status === 'idle' || auth.status === 'loading'
    return (
      <div className="mt-2 flex justify-center">
        <Button
          ref={signInRef}
          onClick={auth.signIn}
          disabled={busy}
          aria-busy={auth.status === 'loading'}
          className="inline-flex flex-none items-center gap-2 disabled:cursor-wait disabled:opacity-60"
        >
          <UserIcon />
          <span>{auth.status === 'loading' ? vi.account.signingIn : vi.account.signIn}</span>
        </Button>
      </div>
    )
  }

  const primary = profile.name?.trim() || profile.email?.trim() || ''
  const secondary = profile.name?.trim() ? profile.email?.trim() : undefined
  const showPicture = profile.picture && profile.picture !== brokenPicture

  return (
    <div className="mt-2 flex justify-center">
      <div className="relative">
        <button
          ref={menu.triggerRef}
          type="button"
          onClick={menu.toggle}
          aria-haspopup="menu"
          aria-expanded={menu.open}
          aria-label={vi.account.menuLabel}
          className="flex h-11 w-11 flex-none cursor-pointer items-center justify-center rounded-full border border-hairline transition-colors hover:border-fg/40"
        >
          {showPicture ? (
            // eslint-disable-next-line @next/next/no-img-element -- ảnh từ Ducker ID, export tĩnh không có image optimizer
            <img
              src={profile.picture ?? undefined}
              alt=""
              width={32}
              height={32}
              referrerPolicy="no-referrer"
              onError={() => setBrokenPicture(profile.picture ?? null)}
              className="h-8 w-8 rounded-full"
            />
          ) : (
            <span
              aria-hidden="true"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-semibold text-bg"
            >
              {initialOf(profile)}
            </span>
          )}
        </button>
        {menu.open && (
          <div
            ref={menu.menuRef}
            role="menu"
            aria-label={vi.account.menuLabel}
            // `!absolute`: `.panel { position: relative }` (globals.css) đứng sau trong CSS build
            // và thắng `absolute`, làm menu chiếm chỗ trong luồng và đẩy cả màn hình menu.
            className="panel !absolute bottom-full left-1/2 z-10 mb-2 flex w-64 max-w-[calc(100vw-32px)] -translate-x-1/2 flex-col gap-1 p-2 shadow-glow-sm"
          >
            <div role="none" className="px-3 py-2">
              <p className="truncate text-sm font-medium text-fg">{primary}</p>
              {secondary && <p className="truncate text-xs text-muted">{secondary}</p>}
            </div>
            <a
              role="menuitem"
              href={auth.profileUrl ?? undefined}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => menu.close(false)}
              className={ITEM}
            >
              {vi.account.openProfile}
            </a>
            <button
              role="menuitem"
              type="button"
              onClick={() => {
                menu.close(false)
                refocusSignIn.current = true
                auth.signOut()
              }}
              className={ITEM}
            >
              {vi.account.signOut}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
