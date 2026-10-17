import { useCallback, useEffect, useRef, useState } from 'react'

const ITEMS = '[role="menuitem"]'

/** Hành vi của menu tài khoản — không có styling. */
export function useAccountMenu() {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const close = useCallback((refocus: boolean) => {
    setOpen(false)
    if (refocus) triggerRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!open) return
    // Capture trên window + stopPropagation: game cũng nghe keydown ở window, nên nếu không chặn
    // thì mũi tên/Esc đi xuyên qua menu vào game. Chỉ chạy khi menu mở.
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        close(true)
        return
      }
      if (event.key === 'Tab') {
        event.stopPropagation()
        close(false) // không preventDefault: Tab vẫn đi tiếp, không giành lại focus
        return
      }
      const items = Array.from(menuRef.current?.querySelectorAll<HTMLElement>(ITEMS) ?? [])
      if (items.length === 0) return
      const index = items.indexOf(document.activeElement as HTMLElement)
      let next: number
      if (event.key === 'ArrowDown') next = (index + 1) % items.length
      else if (event.key === 'ArrowUp') next = (index - 1 + items.length) % items.length
      else if (event.key === 'Home') next = 0
      else if (event.key === 'End') next = items.length - 1
      else return
      event.stopPropagation()
      event.preventDefault()
      items[next]?.focus()
    }
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node
      if (!menuRef.current?.contains(target) && !triggerRef.current?.contains(target)) close(false)
    }
    // Safari không focus nút khi bấm, nên relatedTarget = null không có nghĩa là rời đi:
    // chỉ đóng khi focus chuyển sang một phần tử CÓ THẬT nằm ngoài menu và nút mở.
    const onFocusOut = (event: FocusEvent) => {
      const next = event.relatedTarget as Node | null
      if (next && !menuRef.current?.contains(next) && !triggerRef.current?.contains(next)) close(false)
    }
    window.addEventListener('keydown', onKey, true)
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('focusout', onFocusOut)
    menuRef.current?.querySelector<HTMLElement>(ITEMS)?.focus()
    return () => {
      window.removeEventListener('keydown', onKey, true)
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('focusout', onFocusOut)
    }
  }, [open, close])

  return { open, toggle: () => setOpen((value) => !value), close, triggerRef, menuRef }
}
