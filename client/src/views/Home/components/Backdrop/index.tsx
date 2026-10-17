'use client'

// types
import type { ReactNode } from 'react'

/** Nền mờ dùng chung cho mọi lớp phủ trong màn chơi. */
export function Backdrop({ children }: { children: ReactNode }) {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-bg/80 px-4 backdrop-blur-[2px]">
      {children}
    </div>
  )
}
