'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  createGameState,
  goToPhase,
  hudOf,
  pauseGame,
  resetForNewGame,
  resumeGame,
  takeAnnouncement,
  type NewGameOptions,
} from '@/game/core/state'
import type { GameState, HudSnapshot, InputState, Phase } from '@/game/core/types'
import { createLoop, type Loop } from '@/game/loop'
import { createRenderer, type Renderer } from '@/game/render/draw'
import { attachKeyboard, createInput, resetInput } from '@/input/keyboard'
import { createTouchInput, type TouchInput } from '@/input/touch'

export interface GameActions {
  /** Bỏ trống thì chơi lại đúng mức và bộ núm của ván trước (ADR-0010). */
  start(options?: NewGameOptions): void
  pause(): void
  resume(): void
  toMenu(): void
  show(phase: Phase): void
}

export interface UseGame {
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  hud: HudSnapshot
  announce: string
  touch: TouchInput
  actions: GameActions
}

/**
 * Cây cầu DUY NHẤT giữa React và lõi game (architecture.md §3).
 *
 * `GameState` sống trong một ref và không bao giờ vào `useState` — bất biến #8.
 * React chỉ nhận `HudSnapshot`, và chỉ khi nó thật sự đổi giá trị (NFR-PERF-03).
 */
export function useGame(seed: number): UseGame {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const stateRef = useRef<GameState | null>(null)
  const inputRef = useRef<InputState | null>(null)
  const loopRef = useRef<Loop | null>(null)
  const rendererRef = useRef<Renderer | null>(null)

  if (stateRef.current === null) stateRef.current = createGameState(seed)
  if (inputRef.current === null) inputRef.current = createInput()

  const [hud, setHud] = useState<HudSnapshot>(() => hudOf(stateRef.current as GameState))
  const [announce, setAnnounce] = useState('')

  const touch = useMemo(() => createTouchInput(inputRef.current as InputState), [])

  // Dựng renderer + loop một lần, sau khi canvas đã có trong DOM.
  useEffect(() => {
    const canvas = canvasRef.current
    const state = stateRef.current
    const input = inputRef.current
    if (!canvas || !state || !input) return

    const renderer = createRenderer(canvas)
    rendererRef.current = renderer

    const applyReducedMotion = (matches: boolean) => renderer.setReducedMotion(matches)
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    applyReducedMotion(motionQuery.matches)
    motionQuery.addEventListener('change', (e) => applyReducedMotion(e.matches))

    const resize = () => {
      const parent = canvas.parentElement
      if (!parent) return
      const rect = parent.getBoundingClientRect()
      renderer.resize(rect.width, rect.height, window.devicePixelRatio || 1)
    }
    resize()

    const observer = new ResizeObserver(resize)
    if (canvas.parentElement) observer.observe(canvas.parentElement)

    const loop = createLoop({
      state,
      input,
      onFrame: (s) => {
        renderer.draw(s)
        const message = takeAnnouncement(s)
        if (message) setAnnounce(message)
      },
      onHud: setHud,
    })
    loopRef.current = loop
    loop.start()

    return () => {
      loop.stop()
      observer.disconnect()
      motionQuery.removeEventListener('change', (e) => applyReducedMotion(e.matches))
    }
  }, [])

  const start = useCallback((options?: NewGameOptions) => {
    const state = stateRef.current
    if (!state) return
    resetForNewGame(state, options ?? {})
    setHud(hudOf(state))
  }, [])

  const pause = useCallback(() => {
    const state = stateRef.current
    const input = inputRef.current
    if (!state || !input) return
    pauseGame(state)
    // Nhả hết phím: người chơi bấm Esc trong lúc đang giữ nút đẩy thì không được
    // để tàu tiếp tục đẩy khi quay lại.
    resetInput(input)
    touch.releaseAll()
    setHud(hudOf(state))
  }, [touch])

  const resume = useCallback(() => {
    const state = stateRef.current
    if (!state) return
    resumeGame(state)
    setHud(hudOf(state))
  }, [])

  const toMenu = useCallback(() => {
    const state = stateRef.current
    const input = inputRef.current
    if (!state || !input) return
    goToPhase(state, 'menu')
    resetInput(input)
    touch.releaseAll()
    setHud(hudOf(state))
  }, [touch])

  const show = useCallback((phase: Phase) => {
    const state = stateRef.current
    if (!state) return
    goToPhase(state, phase)
    setHud(hudOf(state))
  }, [])

  // Bàn phím. Gắn vào `window` để chơi được mà không cần bấm vào canvas trước.
  useEffect(() => {
    const input = inputRef.current
    if (!input) return
    return attachKeyboard(window, {
      input,
      // ADR-0015: bàn phím game chỉ sở hữu phím ở pha `playing`, cộng phím tạm dừng ở
      // `paused`. Đọc pha qua hàm chứ không đưa vào dependency của effect — đưa vào là
      // gắn lại listener mỗi lần đổi màn, và mất trạng thái phím đang giữ.
      getPhase: () => stateRef.current?.phase ?? null,
      onPause: () => {
        const state = stateRef.current
        if (!state) return
        if (state.phase === 'playing') pause()
        else if (state.phase === 'paused') resume()
      },
    })
  }, [pause, resume])

  // Chuyển tab thì tự tạm dừng — FR-15, US-04.
  useEffect(() => {
    const onHidden = () => {
      if (document.visibilityState === 'hidden') pause()
    }
    document.addEventListener('visibilitychange', onHidden)
    window.addEventListener('blur', pause)
    return () => {
      document.removeEventListener('visibilitychange', onHidden)
      window.removeEventListener('blur', pause)
    }
  }, [pause])

  return {
    canvasRef,
    hud,
    announce,
    touch,
    actions: { start, pause, resume, toMenu, show },
  }
}
