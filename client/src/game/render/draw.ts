// Tầng vẽ. Chỉ ĐỌC `GameState` — bất biến #7: chỉ `step()` được sửa state.
//
// Toạ độ vào đây luôn là đơn vị thế giới 1600×1200 (bất biến #4); việc đổi sang
// pixel màn hình nằm gọn trong `resize` + phép biến đổi ở đầu `draw`. Nhờ vậy mọi
// hàm vẽ bên dưới viết bằng đơn vị thế giới và không cần biết màn hình to hay nhỏ.
//
// Mọi nét dùng `stroke`, không `fill` — MASTER.md §0. Ngoại lệ duy nhất là nền:
// nó là mặt phẳng của canvas chứ không phải một vật thể.

import { COLOR, EFFECTS, POWERUP, POWERUP_COLOR, SHIP, WORLD_H, WORLD_W } from '../core/constants'
import { createRng } from '../core/rng'
import type { Asteroid, Bullet, GameState, Particle, PowerUp, PowerUpKind, Ship, Ufo } from '../core/types'

export interface Renderer {
  /** Đặt lại kích thước khung vẽ. `dpr` là `window.devicePixelRatio`. */
  resize(cssWidth: number, cssHeight: number, dpr: number): void
  /** Vẽ một frame. Không sửa `state`. */
  draw(state: GameState): void
  setReducedMotion(reduced: boolean): void
}

const TAU = Math.PI * 2

/** Nền gần-đen của MASTER.md §0. Không phải vật thể nên được phép `fill`. */
const BG = '#08090F'

/**
 * Nét mảnh nhất chấp nhận được, tính bằng pixel CSS. Ở khổ 375px hệ số scale chỉ
 * còn ~0.23, nên một nét 2 đơn vị thế giới sẽ ra 0.47px và biến mất. Mọi lineWidth
 * đi qua `lw()` để không bao giờ xuống dưới ngưỡng này.
 */
const MIN_LINE_CSS_PX = 1.1
const MIN_FONT_CSS_PX = 13

/**
 * Sao nền: sinh MỘT LẦN lúc nạp module bằng RNG riêng có seed cố định.
 *
 * Hai điều cấm ở đây: `Math.random` (mỗi frame một bầu trời khác, nhấp nháy),
 * và `state.rng` (đọc RNG của lõi từ tầng vẽ sẽ đẩy con trỏ RNG và làm hai ván
 * cùng seed ra kết quả khác nhau — bất biến #2, NFR-ROB-04).
 */
const STARFIELD_SEED = 0x5eed1337
const STAR_COUNT = 150

/** Ba hạng sao, mỗi hạng vẽ bằng một path duy nhất để đổi state canvas ít nhất. */
const STAR_TIERS = [
  { size: 1.6, alpha: 0.16 },
  { size: 2.5, alpha: 0.28 },
  { size: 3.6, alpha: 0.44 },
] as const

interface Star {
  x: number
  y: number
  tier: number
}

const STARFIELD: readonly Star[] = (() => {
  const rng = createRng(STARFIELD_SEED)
  const stars: Star[] = []
  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push({
      x: rng.range(0, WORLD_W),
      y: rng.range(0, WORLD_H),
      // Sao mờ nhiều hơn sao sáng, nếu không bầu trời trông như rắc hạt tiêu.
      tier: rng.next() < 0.62 ? 0 : rng.next() < 0.75 ? 1 : 2,
    })
  }
  return stars
})()

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v
}

export function createRenderer(canvas: HTMLCanvasElement): Renderer {
  const maybeCtx = canvas.getContext('2d')
  if (!maybeCtx) throw new Error('createRenderer: canvas không trả về context 2d')
  // Gán lại vào một biến đã có kiểu: TypeScript không giữ được kết quả thu hẹp
  // kiểu bên trong các `function` khai báo bên dưới (chúng được hoist).
  const ctx: CanvasRenderingContext2D = maybeCtx

  // Trạng thái của khung vẽ. Khởi tạo bằng chính kích thước thế giới để `draw`
  // gọi được ngay cả khi chưa ai gọi `resize` (test, hoặc frame đầu tiên).
  let cssW = WORLD_W
  let cssH = WORLD_H
  let dpr = 1
  let scale = 1
  let offsetX = 0
  let offsetY = 0

  let reducedMotion = false
  /** Đồng hồ riêng của tầng vẽ, cho hiệu ứng không có mốc thời gian nào trong state. */
  let frame = 0

  /** Bề rộng nét theo đơn vị thế giới, có sàn tính theo pixel CSS. */
  function lw(worldWidth: number): number {
    const floor = MIN_LINE_CSS_PX / scale
    return worldWidth > floor ? worldWidth : floor
  }

  /** Cỡ chữ theo đơn vị thế giới, cũng có sàn — chữ ở khổ 375 phải còn đọc được. */
  function fontSize(worldSize: number): number {
    const floor = MIN_FONT_CSS_PX / scale
    return worldSize > floor ? worldSize : floor
  }

  // Bộ đệm dùng lại cho phép nhân bản qua mép; tránh cấp phát mảng cho mỗi vật
  // thể mỗi frame (NFR-PERF-05).
  const wrapXs = [0, 0]
  const wrapYs = [0, 0]

  /**
   * Vẽ một vật thể ở MỌI vị trí nó hiện diện trên hình xuyến.
   *
   * Thế giới wrap, nên một vật thể chạm mép trái đang đồng thời thò ra ở mép phải.
   * Vẽ đúng một lần sẽ thấy nó bị cắt đôi ngay lúc bay qua mép — lỗi nhìn thấy rõ
   * nhất mà cũng dễ quên nhất. Tối đa 4 lần vẽ (hai mép ngang × hai mép dọc).
   */
  function wrapped<T>(
    x: number,
    y: number,
    r: number,
    item: T,
    render: (px: number, py: number, item: T) => void,
  ): void {
    let nx = 1
    wrapXs[0] = x
    if (x - r < 0) wrapXs[nx++] = x + WORLD_W
    else if (x + r > WORLD_W) wrapXs[nx++] = x - WORLD_W

    let ny = 1
    wrapYs[0] = y
    if (y - r < 0) wrapYs[ny++] = y + WORLD_H
    else if (y + r > WORLD_H) wrapYs[ny++] = y - WORLD_H

    for (let i = 0; i < nx; i++) {
      for (let j = 0; j < ny; j++) {
        render(wrapXs[i] as number, wrapYs[j] as number, item)
      }
    }
  }

  // ---------- lớp 1: sao nền ----------

  function drawStars(): void {
    ctx.strokeStyle = COLOR.fg
    for (let t = 0; t < STAR_TIERS.length; t++) {
      const tier = STAR_TIERS[t] as (typeof STAR_TIERS)[number]
      ctx.globalAlpha = tier.alpha
      ctx.lineWidth = lw(tier.size)
      ctx.beginPath()
      for (const s of STARFIELD) {
        if (s.tier !== t) continue
        // Đoạn thẳng dài gần bằng 0 với lineCap 'round' cho ra một chấm tròn, và
        // vẫn là `stroke` chứ không `fill`.
        ctx.moveTo(s.x, s.y)
        ctx.lineTo(s.x + 0.01, s.y)
      }
      ctx.stroke()
    }
    ctx.globalAlpha = 1
  }

  // ---------- lớp 2: particle ----------

  const strokeParticleAt = (px: number, py: number, p: Particle): void => {
    const sp = Math.hypot(p.vx, p.vy)
    const len = sp > 1 ? Math.min(12, sp * 0.03) : 1.5
    const ux = sp > 1 ? p.vx / sp : 0
    const uy = sp > 1 ? p.vy / sp : 1
    ctx.beginPath()
    ctx.moveTo(px - ux * len, py - uy * len)
    ctx.lineTo(px, py)
    ctx.stroke()
  }

  function drawParticles(list: readonly Particle[]): void {
    ctx.lineWidth = lw(2.4)
    for (const p of list) {
      const a = p.maxLifeMs > 0 ? clamp01(p.lifeMs / p.maxLifeMs) : 0
      if (a <= 0) continue
      ctx.globalAlpha = a
      ctx.strokeStyle = p.color
      wrapped(p.x, p.y, 14, p, strokeParticleAt)
    }
    ctx.globalAlpha = 1
  }

  // ---------- lớp 3: thiên thạch ----------

  const strokeAsteroidAt = (px: number, py: number, a: Asteroid): void => {
    const n = a.shape.length
    ctx.beginPath()
    if (n < 3) {
      // Không có đa giác thì vẽ vòng tròn, còn hơn không vẽ gì.
      ctx.arc(px, py, a.r, 0, TAU)
    } else {
      for (let i = 0; i < n; i++) {
        const t = a.angle + (i / n) * TAU
        const rr = a.r * (a.shape[i] ?? 1)
        const vx = px + Math.sin(t) * rr
        const vy = py - Math.cos(t) * rr
        if (i === 0) ctx.moveTo(vx, vy)
        else ctx.lineTo(vx, vy)
      }
      ctx.closePath()
    }
    ctx.stroke()
  }

  function drawAsteroids(list: readonly Asteroid[]): void {
    ctx.strokeStyle = COLOR.asteroid
    ctx.lineWidth = lw(2.6)
    for (const a of list) {
      // Nới bán kính khi xét nhân bản: đỉnh lồi nhất của đa giác còn thò ra ngoài
      // bán kính va chạm, nên lấy đúng `a.r` sẽ hụt vài đơn vị ngay ở mép.
      wrapped(a.x, a.y, a.r * 1.4, a, strokeAsteroidAt)
    }
  }

  // ---------- lớp 4: power-up ----------

  /**
   * Ký hiệu hình học riêng cho từng loại — MASTER.md §0.
   *
   * Mã hoá kép màu + hình là bắt buộc chứ không phải trang trí: mù màu đỏ–lục
   * không phân biệt được `#FB7185` (xuyên) với `#34D399` (mạng) nếu chỉ khác màu.
   */
  function drawPowerUpMark(px: number, py: number, kind: PowerUpKind, m: number): void {
    ctx.beginPath()
    switch (kind) {
      case 'shield': {
        // Lục giác viền.
        for (let i = 0; i < 6; i++) {
          const t = (i / 6) * TAU
          const vx = px + Math.sin(t) * m
          const vy = py - Math.cos(t) * m
          if (i === 0) ctx.moveTo(vx, vy)
          else ctx.lineTo(vx, vy)
        }
        ctx.closePath()
        break
      }
      case 'rapid': {
        // Ba chevron xếp dọc, cùng hướng lên.
        for (let k = -1; k <= 1; k++) {
          const y0 = py + k * m * 0.72
          ctx.moveTo(px - m * 0.85, y0 + m * 0.3)
          ctx.lineTo(px, y0 - m * 0.3)
          ctx.lineTo(px + m * 0.85, y0 + m * 0.3)
        }
        break
      }
      case 'spread': {
        // Quạt ba tia toả ra từ một gốc.
        const ox = px
        const oy = py + m
        for (const t of [-0.5, 0, 0.5]) {
          ctx.moveTo(ox, oy)
          ctx.lineTo(ox + Math.sin(t) * m * 2, oy - Math.cos(t) * m * 2)
        }
        break
      }
      case 'pierce': {
        // Mũi tên nét đôi: hai thân song song + một đầu nhọn.
        ctx.moveTo(px - m * 0.3, py + m)
        ctx.lineTo(px - m * 0.3, py - m * 0.2)
        ctx.moveTo(px + m * 0.3, py + m)
        ctx.lineTo(px + m * 0.3, py - m * 0.2)
        ctx.moveTo(px - m * 0.72, py - m * 0.15)
        ctx.lineTo(px, py - m)
        ctx.lineTo(px + m * 0.72, py - m * 0.15)
        break
      }
      case 'life': {
        // Dấu cộng.
        ctx.moveTo(px - m, py)
        ctx.lineTo(px + m, py)
        ctx.moveTo(px, py - m)
        ctx.lineTo(px, py + m)
        break
      }
    }
    ctx.stroke()
  }

  const strokePowerUpAt = (px: number, py: number, p: PowerUp): void => {
    ctx.beginPath()
    ctx.arc(px, py, p.r, 0, TAU)
    ctx.stroke()
    drawPowerUpMark(px, py, p.kind, p.r * 0.5)
  }

  function drawPowerUps(list: readonly PowerUp[]): void {
    ctx.lineWidth = lw(2.4)
    for (const p of list) {
      // Nhấp nháy ở POWERUP.blinkMs cuối để báo sắp biến mất. Nhịp lấy từ chính
      // `lifeMs` chứ không từ đồng hồ tường — vẽ vẫn là hàm thuần của state.
      if (p.lifeMs < POWERUP.blinkMs && Math.floor(p.lifeMs / 130) % 2 === 0) continue
      ctx.strokeStyle = POWERUP_COLOR[p.kind]
      wrapped(p.x, p.y, p.r * 1.2, p, strokePowerUpAt)
    }
  }

  // ---------- lớp 5: UFO ----------

  const strokeUfoAt = (px: number, py: number, u: Ufo): void => {
    const rw = u.r
    const rh = u.r * 0.42
    ctx.beginPath()
    ctx.ellipse(px, py, rw, rh, 0, 0, TAU)
    ctx.stroke()
    // Vòm kính: nửa trên của một cung tròn.
    ctx.beginPath()
    ctx.arc(px, py - rh * 0.35, rw * 0.46, Math.PI, TAU)
    ctx.stroke()
    // Đường thân ngang, thứ làm cái đĩa bay ra đĩa bay.
    ctx.beginPath()
    ctx.moveTo(px - rw, py)
    ctx.lineTo(px + rw, py)
    ctx.stroke()
  }

  function drawUfos(list: readonly Ufo[]): void {
    ctx.strokeStyle = COLOR.ufo
    ctx.lineWidth = lw(2.6)
    for (const u of list) wrapped(u.x, u.y, u.r * 1.2, u, strokeUfoAt)
  }

  // ---------- lớp 6: đạn ----------

  const strokeBulletAt = (px: number, py: number, b: Bullet): void => {
    const sp = Math.hypot(b.vx, b.vy)
    const len = sp > 1 ? Math.min(20, sp * 0.018) : b.r
    const ux = sp > 1 ? b.vx / sp : 0
    const uy = sp > 1 ? b.vy / sp : 1
    if (b.pierce) {
      // Đạn xuyên vẽ nét đôi, khớp với ký hiệu mũi tên nét đôi của power-up.
      const offX = -uy * b.r * 0.8
      const offY = ux * b.r * 0.8
      ctx.beginPath()
      ctx.moveTo(px - ux * len + offX, py - uy * len + offY)
      ctx.lineTo(px + offX, py + offY)
      ctx.moveTo(px - ux * len - offX, py - uy * len - offY)
      ctx.lineTo(px - offX, py - offY)
      ctx.stroke()
      return
    }
    ctx.beginPath()
    ctx.moveTo(px - ux * len, py - uy * len)
    ctx.lineTo(px, py)
    ctx.stroke()
  }

  function drawBullets(list: readonly Bullet[]): void {
    ctx.lineWidth = lw(3)
    for (const b of list) {
      ctx.strokeStyle = b.fromUfo ? COLOR.ufo : COLOR.fg
      wrapped(b.x, b.y, 22, b, strokeBulletAt)
    }
  }

  // ---------- lớp 7: tàu ----------

  const strokeShipAt = (px: number, py: number, s: Ship): void => {
    // Bán kính VẼ, không phải bán kính va chạm: hitbox nhỏ hơn hình 20% là chủ ý
    // — bất biến #10.
    const R = SHIP.drawRadius
    const lA = s.angle + 2.5
    const rA = s.angle - 2.5
    ctx.beginPath()
    ctx.moveTo(px + Math.sin(s.angle) * R * 1.15, py - Math.cos(s.angle) * R * 1.15)
    ctx.lineTo(px + Math.sin(lA) * R * 0.95, py - Math.cos(lA) * R * 0.95)
    ctx.lineTo(px - Math.sin(s.angle) * R * 0.42, py + Math.cos(s.angle) * R * 0.42)
    ctx.lineTo(px + Math.sin(rA) * R * 0.95, py - Math.cos(rA) * R * 0.95)
    ctx.closePath()
    ctx.stroke()
  }

  const strokeFlameAt = (px: number, py: number, s: Ship): void => {
    const R = SHIP.drawRadius
    // Ngọn lửa nhấp nháy theo đồng hồ riêng của tầng vẽ. Ở chế độ giảm chuyển
    // động nó đứng yên nhưng vẫn hiện — lửa là chỉ báo "đang đẩy", không phải
    // hiệu ứng trang trí, tắt hẳn thì mất thông tin.
    const flick = reducedMotion ? 1 : 0.72 + 0.38 * Math.abs(Math.sin(frame * 0.9))
    const len = R * (0.5 + 1.05 * flick)
    const lA = s.angle + 2.5
    const rA = s.angle - 2.5
    ctx.beginPath()
    ctx.moveTo(px + Math.sin(lA) * R * 0.6, py - Math.cos(lA) * R * 0.6)
    ctx.lineTo(px - Math.sin(s.angle) * len, py + Math.cos(s.angle) * len)
    ctx.lineTo(px + Math.sin(rA) * R * 0.6, py - Math.cos(rA) * R * 0.6)
    ctx.stroke()
  }

  const strokeTrailAt = (px: number, py: number, s: Ship): void => {
    const R = SHIP.drawRadius
    ctx.beginPath()
    ctx.moveTo(px - Math.sin(s.angle) * R * 1.6, py + Math.cos(s.angle) * R * 1.6)
    ctx.lineTo(px - Math.sin(s.angle) * R * 3.4, py + Math.cos(s.angle) * R * 3.4)
    ctx.stroke()
  }

  const strokeShieldAt = (px: number, py: number, s: Ship): void => {
    void s
    ctx.beginPath()
    ctx.arc(px, py, SHIP.drawRadius * 1.7, 0, TAU)
    ctx.stroke()
  }

  function drawShip(s: Ship): void {
    // Nhấp nháy khi bất tử. Nhịp lấy từ `invulnMs` nên vẽ chỉ phụ thuộc state.
    //
    // Đáy 0.55, không phải 0.4 — ADR-0018. Bất tử xảy ra ngay khi vào ván và ngay
    // sau mỗi lần hồi sinh, tức đúng hai lúc người mới cần thấy tàu nhất; ở 0.4 thì
    // tàu biến mất khỏi màn (F-03). 0.55 vẫn đọc ra là "đang nhấp nháy".
    const blinkAlpha = s.invulnMs > 0 && Math.floor(s.invulnMs / 110) % 2 === 1 ? 0.55 : 1

    if (s.thrusting) {
      if (!reducedMotion) {
        // Vệt đẩy — đúng thứ `prefers-reduced-motion` phải tắt (MASTER.md §0).
        ctx.globalAlpha = blinkAlpha * 0.35
        ctx.strokeStyle = COLOR.primary
        ctx.lineWidth = lw(2)
        wrapped(s.x, s.y, SHIP.drawRadius * 4, s, strokeTrailAt)
      }
      ctx.globalAlpha = blinkAlpha
      ctx.strokeStyle = COLOR.primary
      ctx.lineWidth = lw(2.4)
      wrapped(s.x, s.y, SHIP.drawRadius * 2.5, s, strokeFlameAt)
    }

    ctx.globalAlpha = blinkAlpha
    ctx.strokeStyle = COLOR.fg
    // Nét nặng nhất trên canvas — ADR-0018. Thiên thạch và UFO ở lw(2.6), và tàu ở
    // 2.8 thì chênh 0.2, không nhìn ra được, trong khi thiên thạch lớn hơn tàu nhiều
    // lần về diện tích nên chiếm hết chú ý. KHÔNG đổi `SHIP.drawRadius` để thay cho
    // việc này — bất biến #10.
    ctx.lineWidth = lw(3.6)
    wrapped(s.x, s.y, SHIP.drawRadius * 1.3, s, strokeShipAt)

    if (s.shield) {
      ctx.globalAlpha = blinkAlpha * 0.85
      ctx.strokeStyle = POWERUP_COLOR.shield
      ctx.lineWidth = lw(2.4)
      wrapped(s.x, s.y, SHIP.drawRadius * 1.9, s, strokeShieldAt)
    }

    ctx.globalAlpha = 1
  }

  // ---------- chữ trong canvas ----------

  function drawWaveBanner(state: GameState): void {
    if (state.phase !== 'playing' || state.waveBannerMs <= 0) return
    // Cỡ chữ qua `fontSize` vì lý do y hệt bề rộng nét: 64 đơn vị thế giới ở khổ
    // 375px chỉ còn 15px, và ở khổ nhỏ hơn nữa thì không đọc được.
    const size = fontSize(64)
    ctx.font = `600 ${size}px "JetBrains Mono", ui-monospace, monospace`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.strokeStyle = COLOR.accent
    ctx.lineWidth = lw(2)
    ctx.globalAlpha = clamp01(state.waveBannerMs / 600)
    ctx.strokeText(`WAVE ${state.wave}`, WORLD_W / 2, WORLD_H * 0.32)
    ctx.globalAlpha = 1
  }

  // ---------- rung màn hình ----------

  const shake = { x: 0, y: 0 }

  function shakeOf(state: GameState): { x: number; y: number } {
    shake.x = 0
    shake.y = 0
    if (reducedMotion || state.shakeMs <= 0) return shake
    // Biên độ tắt dần theo bình phương: cú rung đầu nặng, đuôi nhẹ.
    const k = clamp01(state.shakeMs / EFFECTS.shakeOnDeathMs)
    const amp = EFFECTS.shakeMaxOffset * k * k
    // Hai tần số lệch nhau cho quỹ đạo trông ngẫu nhiên, nhưng vẫn là hàm thuần
    // của `shakeMs` — tầng vẽ tuyệt đối không được đụng `state.rng` (bất biến #2).
    const p = state.shakeMs * 0.055
    shake.x = Math.sin(p * 1.7) * amp
    shake.y = Math.cos(p * 2.3) * amp
    return shake
  }

  // ---------- API ----------

  function resize(cssWidth: number, cssHeight: number, nextDpr: number): void {
    cssW = cssWidth > 0 ? cssWidth : 1
    cssH = cssHeight > 0 ? cssHeight : 1
    dpr = nextDpr > 0 ? nextDpr : 1

    canvas.width = Math.round(cssW * dpr)
    canvas.height = Math.round(cssH * dpr)

    // Scale-to-fit: lấy hệ số nhỏ hơn để cả thế giới lọt trong khung, phần thừa
    // thành hai dải đen (letterbox). Không bao giờ crop và không bao giờ nới tầm
    // nhìn — màn hình rộng mà thấy nhiều thế giới hơn là đổi độ khó theo thiết
    // bị, và điểm giữa hai máy hết so được (bất biến #4).
    scale = Math.min(cssW / WORLD_W, cssH / WORLD_H)
    offsetX = (cssW - WORLD_W * scale) / 2
    offsetY = (cssH - WORLD_H * scale) / 2
  }

  function draw(state: GameState): void {
    frame++

    // Toàn bộ phép vẽ đi qua đúng một lần setTransform; nhờ vậy dpr chỉ xuất hiện
    // ở đây và không hàm vẽ nào bên dưới phải biết đến pixel vật lý.
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.globalAlpha = 1
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.fillStyle = BG
    ctx.fillRect(0, 0, cssW, cssH)

    ctx.save()
    // Cắt theo khung thế giới, nếu không thì lúc rung màn hình vật thể sẽ tràn
    // vào dải letterbox.
    ctx.beginPath()
    ctx.rect(offsetX, offsetY, WORLD_W * scale, WORLD_H * scale)
    ctx.clip()
    ctx.translate(offsetX, offsetY)
    ctx.scale(scale, scale)

    const sh = shakeOf(state)
    if (sh.x !== 0 || sh.y !== 0) ctx.translate(sh.x, sh.y)

    // Thứ tự lớp theo design.md §4. Đổi thứ tự là đổi cái gì che cái gì.
    drawStars()
    if (!reducedMotion) drawParticles(state.particles)
    drawAsteroids(state.asteroids)
    drawPowerUps(state.powerUps)
    drawUfos(state.ufos)
    drawBullets(state.bullets)
    if (state.ship.alive) drawShip(state.ship)
    drawWaveBanner(state)

    ctx.restore()
    ctx.globalAlpha = 1
  }

  function setReducedMotion(reduced: boolean): void {
    reducedMotion = reduced
  }

  return { resize, draw, setReducedMotion }
}
