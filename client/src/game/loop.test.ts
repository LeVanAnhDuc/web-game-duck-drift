import { beforeEach, describe, expect, it, vi } from 'vitest'
import { FIXED_DT, MAX_FRAME_S } from './core/constants'
import { createGameState } from './core/state'
import type { GameState, HudSnapshot, InputState } from './core/types'

// `step` bị giả lập: test này kiểm VÒNG LẶP, không kiểm luật chơi. Nhờ vậy nó
// đếm được số bước chính xác và không phụ thuộc vào tiến độ của lõi.
const stepCalls = vi.hoisted(() => ({ count: 0, dts: [] as number[] }))
vi.mock('./core/step', () => ({
  step: (_state: unknown, _input: unknown, dt: number) => {
    stepCalls.count++
    stepCalls.dts.push(dt)
  },
}))

import { createLoop } from './loop'

/** Bộ lập lịch tay: không rAF, không đồng hồ thật, tự quyết định thời gian trôi. */
function createHarness() {
  let t = 0
  let nextId = 1
  const queued = new Map<number, (ts: number) => void>()

  return {
    now: () => t,
    schedule: (cb: (ts: number) => void): number => {
      const id = nextId++
      queued.set(id, cb)
      return id
    },
    cancel: (id: number): void => {
      queued.delete(id)
    },
    advance: (ms: number): void => {
      t += ms
    },
    pending: (): number => queued.size,
    /** Chạy hết các callback đang chờ, đúng một lượt. */
    tick: (): void => {
      const cbs = [...queued.values()]
      queued.clear()
      for (const cb of cbs) cb(t)
    },
    /** Trôi `ms` rồi chạy một frame. */
    frame (ms: number): void {
      t += ms
      const cbs = [...queued.values()]
      queued.clear()
      for (const cb of cbs) cb(t)
    },
  }
}

const neutralInput = (): InputState => ({
  rotate: 0,
  thrust: false,
  fire: false,
  hyperspace: false,
})

interface Built {
  state: GameState
  huds: HudSnapshot[]
  frames: number
  h: ReturnType<typeof createHarness>
  loop: ReturnType<typeof createLoop>
}

function build(phase: GameState['phase'] = 'playing'): Built {
  const h = createHarness()
  const state = createGameState(1)
  state.phase = phase
  const huds: HudSnapshot[] = []
  const box = { frames: 0 }
  const loop = createLoop({
    state,
    input: neutralInput(),
    onFrame: () => {
      box.frames++
    },
    onHud: (hud) => {
      huds.push(hud)
    },
    now: h.now,
    schedule: h.schedule,
    cancel: h.cancel,
  })
  return {
    state,
    huds,
    get frames() {
      return box.frames
    },
    h,
    loop,
  } as Built
}

beforeEach(() => {
  stepCalls.count = 0
  stepCalls.dts.length = 0
})

describe('bước cố định', () => {
  it('luôn gọi step với đúng FIXED_DT — bất biến #3', () => {
    const b = build()
    b.loop.start()
    b.h.frame(100)
    expect(stepCalls.count).toBeGreaterThan(0)
    for (const dt of stepCalls.dts) expect(dt).toBe(FIXED_DT)
  })

  it('một frame 10 giây chỉ chạy tối đa 15 bước — NFR-ROB-03', () => {
    const b = build()
    b.loop.start()
    b.h.frame(10_000)
    const cap = Math.ceil(MAX_FRAME_S / FIXED_DT)
    expect(cap).toBe(15)
    expect(stepCalls.count).toBeLessThanOrEqual(15)
    expect(stepCalls.count).toBe(15)
  })

  it('không tích luỹ nợ sau frame bị kẹp — frame sau lại chạy bình thường', () => {
    const b = build()
    b.loop.start()
    b.h.frame(10_000)
    stepCalls.count = 0
    b.h.frame(20)
    expect(stepCalls.count).toBe(1)
  })

  it('60 frame 16.67ms cho khoảng 60 bước', () => {
    const b = build()
    b.loop.start()
    for (let i = 0; i < 60; i++) b.h.frame(1000 / 60)
    expect(stepCalls.count).toBeGreaterThanOrEqual(59)
    expect(stepCalls.count).toBeLessThanOrEqual(61)
  })

  it('frame ngắn hơn một bước không chạy bước nào, nhưng phần dư được giữ lại', () => {
    const b = build()
    b.loop.start()
    b.h.frame(8)
    expect(stepCalls.count).toBe(0)
    b.h.frame(9)
    expect(stepCalls.count).toBe(1)
  })

  it('đồng hồ nhảy lùi không sinh bước âm hay treo vòng lặp', () => {
    const h = createHarness()
    let t = 1000
    const state = createGameState(1)
    state.phase = 'playing'
    const loop = createLoop({
      state,
      input: neutralInput(),
      onFrame: () => {},
      onHud: () => {},
      now: () => t,
      schedule: h.schedule,
      cancel: h.cancel,
    })
    loop.start()
    t = 500
    h.tick()
    expect(stepCalls.count).toBe(0)
  })
})

describe('pha không phải playing', () => {
  it('không mô phỏng nhưng vẫn vẽ và vẫn phát HUD', () => {
    const b = build('menu')
    b.loop.start()
    b.h.frame(500)
    expect(stepCalls.count).toBe(0)
    expect(b.frames).toBe(1)
    expect(b.huds.length).toBe(1)
  })

  it('thời gian tạm dừng không bị chạy bù khi vào lại playing', () => {
    const b = build('paused')
    b.loop.start()
    b.h.frame(30_000)
    expect(stepCalls.count).toBe(0)
    b.state.phase = 'playing'
    b.h.frame(1000 / 60)
    expect(stepCalls.count).toBe(1)
  })
})

describe('HUD — NFR-PERF-03', () => {
  it('phát đúng một lần ở frame đầu rồi im khi không có gì đổi', () => {
    const b = build()
    b.loop.start()
    for (let i = 0; i < 120; i++) b.h.frame(1000 / 60)
    expect(b.frames).toBe(120)
    expect(b.huds.length).toBe(1)
  })

  it('điểm đổi thì phát thêm đúng một lần', () => {
    const b = build()
    b.loop.start()
    for (let i = 0; i < 30; i++) b.h.frame(1000 / 60)
    expect(b.huds.length).toBe(1)

    b.state.score = 120
    b.h.frame(1000 / 60)
    expect(b.huds.length).toBe(2)
    expect(b.huds[1]?.score).toBe(120)

    for (let i = 0; i < 30; i++) b.h.frame(1000 / 60)
    expect(b.huds.length).toBe(2)
  })

  it('đổi pha cũng là một thay đổi HUD', () => {
    const b = build()
    b.loop.start()
    b.h.frame(16)
    b.state.phase = 'gameover'
    b.h.frame(16)
    expect(b.huds.length).toBe(2)
    expect(b.huds[1]?.phase).toBe('gameover')
  })
})

describe('start / stop', () => {
  it('isRunning phản ánh đúng trạng thái', () => {
    const b = build()
    expect(b.loop.isRunning()).toBe(false)
    b.loop.start()
    expect(b.loop.isRunning()).toBe(true)
    b.loop.stop()
    expect(b.loop.isRunning()).toBe(false)
  })

  it('stop huỷ callback đã đặt lịch', () => {
    const b = build()
    b.loop.start()
    expect(b.h.pending()).toBe(1)
    b.loop.stop()
    expect(b.h.pending()).toBe(0)

    // Không còn gì để chạy, nên có trôi bao lâu cũng không thêm bước nào.
    b.h.frame(1000)
    expect(stepCalls.count).toBe(0)
  })

  it('start hai lần không đặt hai lịch song song', () => {
    const b = build()
    b.loop.start()
    b.loop.start()
    expect(b.h.pending()).toBe(1)
  })

  it('stop gọi từ trong onFrame thì không đặt lịch tiếp', () => {
    const h = createHarness()
    const state = createGameState(1)
    state.phase = 'playing'
    const loop = createLoop({
      state,
      input: neutralInput(),
      onFrame: () => {
        loop.stop()
      },
      onHud: () => {},
      now: h.now,
      schedule: h.schedule,
      cancel: h.cancel,
    })
    loop.start()
    h.frame(16)
    expect(h.pending()).toBe(0)
    expect(loop.isRunning()).toBe(false)
  })

  it('start lại sau stop chạy tiếp bình thường', () => {
    const b = build()
    b.loop.start()
    b.h.frame(1000 / 60)
    b.loop.stop()
    stepCalls.count = 0
    b.loop.start()
    b.h.frame(1000 / 60)
    expect(stepCalls.count).toBe(1)
  })
})
