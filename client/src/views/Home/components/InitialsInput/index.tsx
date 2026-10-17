'use client'

import { useEffect, useRef, useState } from 'react'
import { normalizeInitials } from '@/storage/scoreStore'

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

/**
 * Ba ký tự kiểu arcade thay vì một ô text: bàn phím ảo trên điện thoại che mất
 * nửa màn hình, và tên ba chữ là quy ước người chơi arcade đã biết (US-02).
 */
export function InitialsInput({
  value,
  onChange,
  label,
}: {
  value: string
  onChange: (next: string) => void
  label: string
}) {
  const [active, setActive] = useState(0)
  const groupRef = useRef<HTMLDivElement | null>(null)
  const chars = normalizeInitials(value).split('')

  useEffect(() => {
    groupRef.current?.focus()
  }, [])

  const bump = (index: number, delta: number) => {
    const current = LETTERS.indexOf(chars[index] ?? 'A')
    const next = (current + delta + LETTERS.length) % LETTERS.length
    const updated = [...chars]
    updated[index] = LETTERS[next] as string
    onChange(updated.join(''))
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') bump(active, 1)
    else if (e.key === 'ArrowDown') bump(active, -1)
    else if (e.key === 'ArrowLeft') setActive((i) => (i + 2) % 3)
    else if (e.key === 'ArrowRight') setActive((i) => (i + 1) % 3)
    else if (/^[a-zA-Z]$/.test(e.key)) {
      const updated = [...chars]
      updated[active] = e.key.toUpperCase()
      onChange(updated.join(''))
      setActive((i) => Math.min(2, i + 1))
    } else return
    e.preventDefault()
  }

  return (
    <div
      ref={groupRef}
      role="group"
      aria-label={label}
      tabIndex={0}
      onKeyDown={onKeyDown}
      className="flex justify-center gap-3 rounded-lg outline-none"
    >
      {chars.map((char, i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <button
            type="button"
            aria-label={`${label} ${i + 1} +`}
            onClick={() => {
              setActive(i)
              bump(i, 1)
            }}
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded text-muted transition-colors hover:text-fg"
          >
            <Chevron up />
          </button>

          <span
            className={`flex h-12 w-11 items-center justify-center rounded border font-mono text-2xl ${
              i === active ? 'border-primary text-accent shadow-glow-md' : 'border-hairline text-fg'
            }`}
          >
            {char}
          </span>

          <button
            type="button"
            aria-label={`${label} ${i + 1} −`}
            onClick={() => {
              setActive(i)
              bump(i, -1)
            }}
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded text-muted transition-colors hover:text-fg"
          >
            <Chevron />
          </button>
        </div>
      ))}
    </div>
  )
}

function Chevron({ up = false }: { up?: boolean }) {
  return (
    <svg viewBox="0 0 16 16" className={`h-4 w-4 ${up ? '' : 'rotate-180'}`} aria-hidden="true">
      <path d="M3 10 L8 5 L13 10" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}
