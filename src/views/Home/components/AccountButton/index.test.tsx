import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'

const auth = vi.hoisted(() => ({ value: {} as Record<string, unknown> }))
vi.mock('@/hooks/useDuckerAuth', () => ({ useDuckerAuth: () => auth.value }))

import { AccountButton } from './index'
import { vi as strings } from '@/i18n/vi'

const base = { enabled: true, profileUrl: 'http://localhost:3000/profile', signIn: vi.fn(), signOut: vi.fn() }
const user = { sub: 'u1', name: 'Lê Văn Anh Đức', email: 'duc@ducker.id' }
const signedIn = { ...base, status: 'signed-in', profile: user }

const openMenu = () => {
  const trigger = screen.getByRole('button', { name: strings.account.menuLabel })
  fireEvent.click(trigger)
  return trigger
}

describe('AccountButton', () => {
  beforeEach(() => {
    base.signIn.mockClear()
    base.signOut.mockClear()
  })

  it('renders nothing when the feature is disabled', () => {
    auth.value = { ...base, enabled: false, status: 'idle', profile: null }
    const { container } = render(<AccountButton />)
    expect(container.innerHTML).toBe('')
  })

  it('shows the sign-in button when signed out and starts login on click', () => {
    auth.value = { ...base, status: 'signed-out', profile: null }
    render(<AccountButton />)
    fireEvent.click(screen.getByRole('button', { name: 'Đăng nhập' }))
    expect(base.signIn).toHaveBeenCalledOnce()
  })

  it('renders a disabled same-label button while idle, so nothing is clickable before hydration', () => {
    auth.value = { ...base, status: 'idle', profile: null }
    render(<AccountButton />)
    const button = screen.getByRole('button', { name: 'Đăng nhập' }) as HTMLButtonElement
    expect(button.disabled).toBe(true)
    fireEvent.click(button)
    expect(base.signIn).not.toHaveBeenCalled()
  })

  it('falls back to the initial when the picture fails, and sends no referrer', () => {
    auth.value = { ...signedIn, profile: { ...user, picture: 'http://x.test/a.png' } }
    const { container } = render(<AccountButton />)
    const img = container.querySelector('img')!
    expect(img.getAttribute('referrerpolicy')).toBe('no-referrer')
    fireEvent.error(img)
    expect(container.querySelector('img')).toBeNull()
    expect(screen.getByRole('button', { name: strings.account.menuLabel }).textContent).toBe('L')
  })

  it('keeps the identity block out of the menu items', () => {
    auth.value = signedIn
    render(<AccountButton />)
    openMenu()
    expect(screen.getByText('Lê Văn Anh Đức').parentElement!.getAttribute('role')).toBe('none')
  })

  it('disables the button while signing in', () => {
    auth.value = { ...base, status: 'loading', profile: null }
    render(<AccountButton />)
    expect((screen.getByRole('button', { name: 'Đang đăng nhập…' }) as HTMLButtonElement).disabled).toBe(true)
  })

  it('opens the menu with profile link and sign out; Esc closes and refocuses the trigger', () => {
    auth.value = signedIn
    render(<AccountButton />)
    const trigger = openMenu()
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu')
    expect(screen.getByText('Lê Văn Anh Đức')).toBeTruthy()
    expect(screen.getByText('duc@ducker.id')).toBeTruthy()
    const link = screen.getByRole('menuitem', { name: 'Mở hồ sơ Ducker ID' })
    expect(link.getAttribute('href')).toBe('http://localhost:3000/profile')
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.getAttribute('rel')).toBe('noopener noreferrer')
    act(() => {
      fireEvent.keyDown(document, { key: 'Escape' })
    })
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(trigger)
    fireEvent.click(trigger)
    fireEvent.click(screen.getByRole('menuitem', { name: 'Đăng xuất' }))
    expect(base.signOut).toHaveBeenCalledOnce()
  })

  it('closes on an outside pointer press', () => {
    auth.value = signedIn
    render(<AccountButton />)
    const trigger = openMenu()
    fireEvent.pointerDown(document.body)
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
  })

  it('moves focus with arrow keys, wrapping, and Home/End', () => {
    auth.value = signedIn
    render(<AccountButton />)
    openMenu()
    const profile = screen.getByRole('menuitem', { name: 'Mở hồ sơ Ducker ID' })
    const out = screen.getByRole('menuitem', { name: 'Đăng xuất' })
    const menu = screen.getByRole('menu')
    expect(document.activeElement).toBe(profile)
    fireEvent.keyDown(menu, { key: 'ArrowDown' })
    expect(document.activeElement).toBe(out)
    fireEvent.keyDown(menu, { key: 'ArrowDown' })
    expect(document.activeElement).toBe(profile)
    fireEvent.keyDown(menu, { key: 'ArrowUp' })
    expect(document.activeElement).toBe(out)
    fireEvent.keyDown(menu, { key: 'Home' })
    expect(document.activeElement).toBe(profile)
    fireEvent.keyDown(menu, { key: 'End' })
    expect(document.activeElement).toBe(out)
  })

  it('keeps menu keys away from the game while open, and gives them back once closed', () => {
    auth.value = signedIn
    render(<AccountButton />)
    const seen: string[] = []
    const gameListener = (event: KeyboardEvent) => seen.push(event.key)
    window.addEventListener('keydown', gameListener)
    const trigger = openMenu()
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'ArrowUp' })
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'ArrowDown' })
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Home' })
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'End' })
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' })
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(seen).toEqual([])
    fireEvent.keyDown(document.body, { key: 'ArrowUp' })
    fireEvent.keyDown(document.body, { key: 'Escape' })
    expect(seen).toEqual(['ArrowUp', 'Escape'])
    window.removeEventListener('keydown', gameListener)
  })

  it('Tab closes the menu without pulling focus back to the trigger', () => {
    auth.value = signedIn
    render(<AccountButton />)
    const trigger = openMenu()
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Tab' })
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(document.activeElement).not.toBe(trigger)
  })

  it('closes when focus moves to an element outside, but not on a null relatedTarget (Safari click)', () => {
    auth.value = signedIn
    render(
      <>
        <AccountButton />
        <button>outside</button>
      </>,
    )
    const trigger = openMenu()
    act(() => {
      fireEvent.focusOut(trigger, { relatedTarget: null })
    })
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    act(() => {
      fireEvent.focusOut(trigger, { relatedTarget: screen.getByText('outside') })
    })
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
  })

  it('shows the email as the main line when there is no name, and no email line when there is none', () => {
    auth.value = { ...base, status: 'signed-in', profile: { sub: 'u1', email: 'only@ducker.id' } }
    const { unmount } = render(<AccountButton />)
    openMenu()
    expect(screen.getAllByText('only@ducker.id')).toHaveLength(1)
    unmount()
    auth.value = { ...base, status: 'signed-in', profile: { sub: 'u1', name: 'Chỉ Tên' } }
    render(<AccountButton />)
    openMenu()
    expect(screen.getByText('Chỉ Tên')).toBeTruthy()
    expect(screen.getByRole('menu').textContent).not.toContain('@')
  })

  it('uses the first letter as the avatar when there is no picture, the picture otherwise', () => {
    auth.value = signedIn
    const { container, unmount } = render(<AccountButton />)
    expect(screen.getByRole('button', { name: strings.account.menuLabel }).textContent).toBe('L')
    unmount()
    auth.value = { ...signedIn, profile: { ...user, picture: 'http://localhost:3000/a.png' } }
    const second = render(<AccountButton />)
    expect(second.container.querySelector('img')?.getAttribute('src')).toBe('http://localhost:3000/a.png')
    expect(container).toBeTruthy()
  })

  it('puts focus on the sign-in button after signing out from the menu, never on <body>', () => {
    auth.value = signedIn
    const { rerender } = render(<AccountButton />)
    base.signOut.mockImplementation(() => {
      auth.value = { ...base, status: 'signed-out', profile: null }
      rerender(<AccountButton />)
    })
    openMenu()
    fireEvent.click(screen.getByRole('menuitem', { name: 'Đăng xuất' }))
    const signIn = screen.getByRole('button', { name: 'Đăng nhập' })
    expect(document.activeElement).toBe(signIn)
    base.signOut.mockReset()
  })
})
