'use client'

// types
import type { ReactNode } from 'react'

/**
 * Signature element của dự án: khung hairline có bốn vạch góc (MASTER.md §0).
 * Lớp `.panel` định nghĩa ở globals.css để cả hai pseudo-element vẽ được vạch góc.
 */
export function Panel({
  children,
  className = '',
  id,
  role,
}: {
  children: ReactNode
  className?: string
  /** Cho phép panel làm đích của `aria-controls` — bảng điểm dùng nó làm tabpanel. */
  id?: string
  role?: string
}) {
  return (
    <div className={`panel ${className}`} id={id} role={role}>
      {children}
    </div>
  )
}
