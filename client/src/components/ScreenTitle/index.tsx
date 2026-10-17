'use client'

// types
import type { ReactNode } from 'react'

/** Tiêu đề màn hình. Chữ số ở mọi nơi khác dùng font mono, tiêu đề thì không. */
export function ScreenTitle({ children }: { children: ReactNode }) {
  return <h1 className="text-center text-2xl font-semibold tracking-[0.3em] sm:text-3xl">{children}</h1>
}
