import { describe, expect, it } from 'vitest'
import { COLOR, POWERUP, POWERUP_COLOR, WORLD_H, WORLD_W } from '../core/constants'
import { createGameState } from '../core/state'
import type { Asteroid, Bullet, GameState, Particle, PowerUp, Ufo } from '../core/types'
import { createRenderer } from './draw'

// happy-dom không có context 2d thật, nên thay vì cãi nhau với DOM thì dựng một
// context giả chỉ biết ghi lại lời gọi. Nó cũng cho phép kiểm những thứ mà một
// canvas thật giấu đi: toạ độ đã vẽ, màu đang dùng, bề rộng nét.

interface Call {
  op: string
  args: unknown[]
  /** `strokeStyle` tại thời điểm gọi — dùng để lọc ra lời gọi của từng lớp. */
  style: string
  /** `lineWidth` tại thời điểm gọi — F-03 cần so bề rộng nét giữa các lớp. */
  lw: number
  /** `globalAlpha` tại thời điểm gọi — F-03 cần biết tàu mờ tới đâu lúc bất tử. */
  alpha: number
}

interface FakeCtx {
  calls: Call[]
  ctx: CanvasRenderingContext2D
  canvas: HTMLCanvasElement
}

function createFakeCanvas(): FakeCtx {
  const calls: Call[] = []
  let strokeStyle = ''
  let lineWidth = 1
  let globalAlpha = 1

  const rec =
    (op: string) =>
    (...args: unknown[]): void => {
      calls.push({ op, args, style: strokeStyle, lw: lineWidth, alpha: globalAlpha })
    }

  const ctx = {
    get strokeStyle() {
      return strokeStyle
    },
    set strokeStyle(v: string) {
      strokeStyle = v
      calls.push({ op: 'set:strokeStyle', args: [v], style: v, lw: lineWidth, alpha: globalAlpha })
    },
    get lineWidth() {
      return lineWidth
    },
    set lineWidth(v: number) {
      lineWidth = v
      calls.push({ op: 'set:lineWidth', args: [v], style: strokeStyle, lw: v, alpha: globalAlpha })
    },
    fillStyle: '',
    get globalAlpha() {
      return globalAlpha
    },
    set globalAlpha(v: number) {
      globalAlpha = v
    },
    lineCap: '',
    lineJoin: '',
    font: '',
    textAlign: '',
    textBaseline: '',
    setTransform: rec('setTransform'),
    save: rec('save'),
    restore: rec('restore'),
    translate: rec('translate'),
    scale: rec('scale'),
    rotate: rec('rotate'),
    beginPath: rec('beginPath'),
    closePath: rec('closePath'),
    moveTo: rec('moveTo'),
    lineTo: rec('lineTo'),
    arc: rec('arc'),
    ellipse: rec('ellipse'),
    rect: rec('rect'),
    clip: rec('clip'),
    stroke: rec('stroke'),
    fill: rec('fill'),
    fillRect: rec('fillRect'),
    clearRect: rec('clearRect'),
    strokeText: rec('strokeText'),
    fillText: rec('fillText'),
  }

  const canvas = {
    width: 0,
    height: 0,
    getContext: () => ctx,
  }

  return {
    calls,
    ctx: ctx as unknown as CanvasRenderingContext2D,
    canvas: canvas as unknown as HTMLCanvasElement,
  }
}

function playingState(): GameState {
  const state = createGameState(42)
  state.phase = 'playing'
  return state
}

function asteroid(x: number, y: number, r = 76): Asteroid {
  return {
    x,
    y,
    vx: 0,
    vy: 0,
    r,
    size: 'large',
    angle: 0,
    spin: 0,
    shape: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  }
}

/** Toạ độ x của những lời gọi vẽ đường thuộc một màu nhất định. */
function pathXs(calls: readonly Call[], style: string): number[] {
  return calls
    .filter((c) => (c.op === 'moveTo' || c.op === 'lineTo') && c.style === style)
    .map((c) => c.args[0] as number)
}

function pathYs(calls: readonly Call[], style: string): number[] {
  return calls
    .filter((c) => (c.op === 'moveTo' || c.op === 'lineTo') && c.style === style)
    .map((c) => c.args[1] as number)
}

describe('resize', () => {
  it('nhân kích thước bộ đệm theo dpr', () => {
    const f = createFakeCanvas()
    const r = createRenderer(f.canvas)
    r.resize(800, 600, 2)
    expect(f.canvas.width).toBe(1600)
    expect(f.canvas.height).toBe(1200)
  })

  it('scale-to-fit và căn giữa phần thừa thành letterbox', () => {
    const f = createFakeCanvas()
    const r = createRenderer(f.canvas)
    // 800×400 rộng hơn tỉ lệ 4:3, nên chiều cao quyết định hệ số và phần thừa
    // rơi vào hai dải dọc hai bên.
    r.resize(800, 400, 1)
    r.draw(playingState())

    const scaleCall = f.calls.find((c) => c.op === 'scale')
    const translateCall = f.calls.find((c) => c.op === 'translate')
    const expected = 400 / WORLD_H

    expect(scaleCall?.args[0]).toBeCloseTo(expected, 6)
    expect(scaleCall?.args[1]).toBeCloseTo(expected, 6)
    expect(translateCall?.args[0]).toBeCloseTo((800 - WORLD_W * expected) / 2, 6)
    expect(translateCall?.args[1]).toBeCloseTo(0, 6)
  })

  it('giữ nét không mảnh dưới 1 pixel CSS ở khổ 375', () => {
    const f = createFakeCanvas()
    const r = createRenderer(f.canvas)
    r.resize(375, 281, 1)

    const state = playingState()
    state.asteroids.push(asteroid(800, 600))
    r.draw(state)

    const scale = Math.min(375 / WORLD_W, 281 / WORLD_H)
    const widths = f.calls.filter((c) => c.op === 'set:lineWidth').map((c) => c.args[0] as number)

    expect(widths.length).toBeGreaterThan(0)
    for (const w of widths) {
      expect(w * scale).toBeGreaterThanOrEqual(1)
    }
  })
})

describe('draw — bất biến #7', () => {
  it('không sửa state', () => {
    const f = createFakeCanvas()
    const r = createRenderer(f.canvas)
    r.resize(1600, 1200, 1)

    const state = playingState()
    state.asteroids.push(asteroid(120, 300), asteroid(1500, 1100, 40))
    state.bullets.push({
      x: 10,
      y: 10,
      vx: 780,
      vy: 0,
      r: 3,
      lifeMs: 900,
      pierce: true,
      fromUfo: false,
    })
    state.ufos.push({
      x: 400,
      y: 400,
      vx: 170,
      vy: 0,
      r: 26,
      big: true,
      fireMs: 500,
      turnMs: 900,
    })
    state.powerUps.push({
      x: 700,
      y: 200,
      vx: 0,
      vy: 40,
      r: 16,
      kind: 'spread',
      lifeMs: 9000,
    })
    state.particles.push({
      x: 60,
      y: 60,
      vx: 100,
      vy: -20,
      r: 1,
      lifeMs: 300,
      maxLifeMs: 600,
      color: '#FFD166',
    })
    state.shakeMs = 300
    state.waveClearMs = 500
    state.ship.thrusting = true
    state.ship.shield = true

    // `rng` là object toàn hàm nên JSON hoá thành `{}` — đủ để so sánh sâu phần
    // dữ liệu, mà không cần structuredClone (sẽ ném lỗi vì hàm).
    const before = JSON.parse(JSON.stringify(state)) as unknown
    r.draw(state)
    const after = JSON.parse(JSON.stringify(state)) as unknown

    expect(after).toEqual(before)
  })

  it('không tiêu thụ state.rng — hai renderer vẽ xong, RNG vẫn ở đúng chỗ cũ', () => {
    const f = createFakeCanvas()
    const r = createRenderer(f.canvas)
    const state = playingState()
    state.asteroids.push(asteroid(300, 300))

    const probe = createGameState(42)
    r.draw(state)
    r.draw(state)

    // Cùng seed, lõi chưa chạy bước nào: hai RNG phải vẫn cho cùng một số.
    expect(state.rng.next()).toBe(probe.rng.next())
  })
})

describe('vẽ nhân bản qua mép', () => {
  it('thiên thạch sát mép trái được vẽ ở cả hai mép', () => {
    const f = createFakeCanvas()
    const r = createRenderer(f.canvas)
    r.resize(1600, 1200, 1)

    const state = playingState()
    state.asteroids.push(asteroid(5, 600))
    r.draw(state)

    const xs = pathXs(f.calls, COLOR.asteroid)
    expect(xs.length).toBeGreaterThan(0)
    expect(Math.min(...xs)).toBeLessThan(200)
    expect(Math.max(...xs)).toBeGreaterThan(WORLD_W - 200)
  })

  it('thiên thạch ở góc được vẽ bốn lần', () => {
    const f = createFakeCanvas()
    const r = createRenderer(f.canvas)
    const state = playingState()
    state.asteroids.push(asteroid(5, 5))
    r.draw(state)

    const xs = pathXs(f.calls, COLOR.asteroid)
    const ys = pathYs(f.calls, COLOR.asteroid)
    expect(Math.min(...xs)).toBeLessThan(200)
    expect(Math.max(...xs)).toBeGreaterThan(WORLD_W - 200)
    expect(Math.min(...ys)).toBeLessThan(200)
    expect(Math.max(...ys)).toBeGreaterThan(WORLD_H - 200)
    // Đa giác 10 đỉnh × 4 bản = 40 điểm đường.
    expect(xs.length).toBe(40)
  })

  it('vật thể ở giữa chỉ được vẽ một lần', () => {
    const f = createFakeCanvas()
    const r = createRenderer(f.canvas)
    const state = playingState()
    state.asteroids.push(asteroid(800, 600))
    r.draw(state)

    expect(pathXs(f.calls, COLOR.asteroid).length).toBe(10)
  })
})

describe('setReducedMotion', () => {
  it('tắt particle', () => {
    const particle: Particle = {
      x: 800,
      y: 600,
      vx: 120,
      vy: 0,
      r: 1,
      lifeMs: 400,
      maxLifeMs: 600,
      color: '#123456',
    }

    const on = createFakeCanvas()
    const rOn = createRenderer(on.canvas)
    const stateOn = playingState()
    stateOn.particles.push({ ...particle })
    rOn.draw(stateOn)
    expect(on.calls.some((c) => c.op === 'set:strokeStyle' && c.args[0] === '#123456')).toBe(true)

    const off = createFakeCanvas()
    const rOff = createRenderer(off.canvas)
    rOff.setReducedMotion(true)
    const stateOff = playingState()
    stateOff.particles.push({ ...particle })
    rOff.draw(stateOff)
    expect(off.calls.some((c) => c.op === 'set:strokeStyle' && c.args[0] === '#123456')).toBe(false)
  })

  it('tắt rung màn hình — không còn translate thứ hai trong khung thế giới', () => {
    const state = playingState()
    state.shakeMs = 400

    const on = createFakeCanvas()
    createRenderer(on.canvas).draw(state)
    expect(on.calls.filter((c) => c.op === 'translate').length).toBe(2)

    const off = createFakeCanvas()
    const rOff = createRenderer(off.canvas)
    rOff.setReducedMotion(true)
    rOff.draw(state)
    expect(off.calls.filter((c) => c.op === 'translate').length).toBe(1)
  })

  it('tắt vệt đẩy nhưng giữ ngọn lửa', () => {
    const state = playingState()
    state.ship.thrusting = true

    const off = createFakeCanvas()
    const rOff = createRenderer(off.canvas)
    rOff.setReducedMotion(true)
    rOff.draw(state)

    // Lửa vẫn dùng màu primary; chỉ số lần đặt màu đó giảm từ 2 (vệt + lửa) còn 1.
    const primarySets = off.calls.filter((c) => c.op === 'set:strokeStyle' && c.args[0] === COLOR.primary)
    expect(primarySets.length).toBe(1)
  })
})

describe('power-up', () => {
  it('mỗi loại vẽ bằng màu riêng của nó', () => {
    for (const kind of ['shield', 'rapid', 'spread', 'pierce', 'life'] as const) {
      const f = createFakeCanvas()
      const r = createRenderer(f.canvas)
      const state = playingState()
      const p: PowerUp = {
        x: 800,
        y: 600,
        vx: 0,
        vy: 0,
        r: 16,
        kind,
        lifeMs: 9000,
      }
      state.powerUps.push(p)
      r.draw(state)
      expect(f.calls.some((c) => c.op === 'set:strokeStyle' && c.args[0] === POWERUP_COLOR[kind])).toBe(true)
    }
  })

  it('mỗi loại có ký hiệu hình học khác nhau, không chỉ khác màu', () => {
    const shapes = new Map<string, number>()
    for (const kind of ['shield', 'rapid', 'spread', 'pierce', 'life'] as const) {
      const f = createFakeCanvas()
      const r = createRenderer(f.canvas)
      const state = playingState()
      state.powerUps.push({
        x: 800,
        y: 600,
        vx: 0,
        vy: 0,
        r: 16,
        kind,
        lifeMs: 9000,
      })
      r.draw(state)
      const marks = f.calls.filter(
        (c) => (c.op === 'moveTo' || c.op === 'lineTo') && c.style === POWERUP_COLOR[kind],
      )
      shapes.set(kind, marks.length)
    }
    // Năm loại, ít nhất bốn số điểm đường khác nhau — chỉ trùng khi hai ký hiệu
    // tình cờ cùng số đoạn, và không loại nào được vẽ rỗng.
    for (const n of shapes.values()) expect(n).toBeGreaterThan(0)
    expect(new Set(shapes.values()).size).toBeGreaterThanOrEqual(4)
  })

  it('nhấp nháy ở POWERUP.blinkMs cuối', () => {
    const draws = new Set<boolean>()
    // Quét qua cửa sổ nhấp nháy: phải có frame vẽ và frame không vẽ.
    for (let lifeMs = 0; lifeMs < POWERUP.blinkMs; lifeMs += 65) {
      const f = createFakeCanvas()
      const r = createRenderer(f.canvas)
      const state = playingState()
      state.powerUps.push({
        x: 800,
        y: 600,
        vx: 0,
        vy: 0,
        r: 16,
        kind: 'life',
        lifeMs,
      })
      r.draw(state)
      draws.add(f.calls.some((c) => c.op === 'set:strokeStyle' && c.args[0] === POWERUP_COLOR.life))
    }
    expect(draws.has(true)).toBe(true)
    expect(draws.has(false)).toBe(true)
  })

  it('không nhấp nháy khi còn nhiều thời gian', () => {
    const f = createFakeCanvas()
    const r = createRenderer(f.canvas)
    const state = playingState()
    state.powerUps.push({
      x: 800,
      y: 600,
      vx: 0,
      vy: 0,
      r: 16,
      kind: 'life',
      lifeMs: POWERUP.blinkMs + 1,
    })
    r.draw(state)
    expect(f.calls.some((c) => c.op === 'set:strokeStyle' && c.args[0] === POWERUP_COLOR.life)).toBe(true)
  })
})

describe('tàu và UFO', () => {
  it('vẽ vòng khiên khi ship.shield', () => {
    const withShield = createFakeCanvas()
    const state = playingState()
    state.ship.shield = true
    createRenderer(withShield.canvas).draw(state)
    expect(
      withShield.calls.some((c) => c.op === 'set:strokeStyle' && c.args[0] === POWERUP_COLOR.shield),
    ).toBe(true)

    const without = createFakeCanvas()
    const plain = playingState()
    createRenderer(without.canvas).draw(plain)
    expect(without.calls.some((c) => c.op === 'set:strokeStyle' && c.args[0] === POWERUP_COLOR.shield)).toBe(
      false,
    )
  })

  it('không vẽ tàu khi tàu đã chết', () => {
    const f = createFakeCanvas()
    const state = playingState()
    state.ship.alive = false
    createRenderer(f.canvas).draw(state)
    // Màu tàu chỉ được đặt bởi sao nền (một lần) khi tàu không được vẽ.
    const fgSets = f.calls.filter((c) => c.op === 'set:strokeStyle' && c.args[0] === COLOR.fg)
    expect(fgSets.length).toBe(1)
  })

  it('UFO dùng màu riêng, đạn UFO cũng vậy', () => {
    const f = createFakeCanvas()
    const state = playingState()
    const ufo: Ufo = {
      x: 800,
      y: 600,
      vx: 0,
      vy: 0,
      r: 26,
      big: true,
      fireMs: 0,
      turnMs: 0,
    }
    const shot: Bullet = {
      x: 810,
      y: 620,
      vx: 0,
      vy: 420,
      r: 3,
      lifeMs: 1000,
      pierce: false,
      fromUfo: true,
    }
    state.ufos.push(ufo)
    state.bullets.push(shot)
    createRenderer(f.canvas).draw(state)
    const ufoSets = f.calls.filter((c) => c.op === 'set:strokeStyle' && c.args[0] === COLOR.ufo)
    expect(ufoSets.length).toBe(2)
  })
})

// F-03 của UX review 2026-09-11. Ba persona gọi vật mình điều khiển là "con vịt",
// hai người nói thẳng là không thấy nó trên canvas — p01: "con vịt đâu tôi cũng
// không thấy rõ trên canvas"; p04: "sao không thấy con vịt nhúc nhích". Hai nguyên
// nhân đo được: nét tàu mảnh hơn nét UFO, và lúc bất tử tàu mờ tới mức mất hẳn —
// đúng hai thời điểm (vào ván, hồi sinh) mà người mới cần thấy nó nhất.
describe('tàu là thứ đọc được đầu tiên trên canvas — F-03', () => {
  it('nét tàu hơn nét thiên thạch một khoảng nhìn ra được', () => {
    // Khoá TỈ LỆ, không khoá con số: `lw(3.6)` là một lựa chọn, còn yêu cầu là
    // "chênh đủ để mắt thấy". Trước khi sửa, tàu 2.8 so với thiên thạch 2.6 — chênh
    // 0.2, trong khi thiên thạch lớn hơn tàu nhiều lần về diện tích.
    const f = createFakeCanvas()
    const state = playingState()
    state.asteroids.push(asteroid(400, 400))
    state.ship.invulnMs = 0

    createRenderer(f.canvas).draw(state)

    const strokes = f.calls.filter((c) => c.op === 'stroke')
    const shipWidth = Math.max(...strokes.filter((c) => c.style === COLOR.fg).map((c) => c.lw))
    const asteroidWidth = Math.max(...strokes.filter((c) => c.style === COLOR.asteroid).map((c) => c.lw))

    expect(asteroidWidth).toBeGreaterThan(0)
    expect(shipWidth / asteroidWidth).toBeGreaterThanOrEqual(1.25)
  })

  it('lúc bất tử tàu vẫn đọc được — không mờ dưới 55%', () => {
    // Sao nền cũng vẽ bằng `COLOR.fg` với alpha 0.16/0.28/0.44, nên không lọc tàu
    // ra được chỉ bằng màu. Thứ phân biệt: alpha của tàu ĐỔI theo `invulnMs`, alpha
    // của sao thì không. Nên render hai lần và lấy phần chênh.
    const fgAlphas = (invulnMs: number): Set<number> => {
      const f = createFakeCanvas()
      const state = playingState()
      state.ship.invulnMs = invulnMs
      state.ship.thrusting = false
      createRenderer(f.canvas).draw(state)
      return new Set(f.calls.filter((c) => c.op === 'stroke' && c.style === COLOR.fg).map((c) => c.alpha))
    }

    const base = fgAlphas(0)
    // Nhịp mờ của hiệu ứng nhấp nháy: `Math.floor(invulnMs / 110) % 2 === 1`.
    const blinking = [...fgAlphas(110)].filter((a) => !base.has(a))

    expect(blinking.length, 'tàu phải mờ đi khi bất tử, nếu không thì test này vô nghĩa').toBe(1)
    expect(blinking[0]).toBeGreaterThanOrEqual(0.55)
  })
})
