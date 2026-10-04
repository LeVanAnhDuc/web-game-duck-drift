'use client'

// types
import type { ButtonHTMLAttributes, Ref } from 'react'

type Variant = 'primary' | 'ghost'

const VARIANT: Record<Variant, string> = {
  primary: 'bg-primary/15 text-fg border-primary/60 hover:bg-primary/25 hover:shadow-glow-md',
  ghost: 'bg-transparent text-muted border-hairline hover:text-fg hover:border-fg/40',
}

export function Button({
  variant = 'ghost',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; ref?: Ref<HTMLButtonElement> }) {
  return (
    <button
      {...props}
      // min-h-11 = 44px — NFR-A11Y-03, áp cho cả nút trên desktop cho nhất quán.
      className={`min-h-11 cursor-pointer rounded-lg border px-5 text-sm font-medium tracking-wide transition-colors ${VARIANT[variant]} ${className}`}
    />
  )
}
