'use client'

// types
import type { ReactNode } from 'react'

export function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-6">
      <span className="text-xs uppercase tracking-widest text-muted">{label}</span>
      <span className="font-mono text-lg tabular-nums">{value}</span>
    </div>
  )
}
