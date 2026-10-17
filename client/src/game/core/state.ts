import { DIFFICULTY, SCORING, SHIP, WORLD_H, WORLD_W } from './constants'
import { createRng } from './rng'
import type { DifficultyId, GameState, HudSnapshot, Ship, Tuning } from './types'

/** Tuỳ chọn của một ván mới. Bỏ trống trường nào thì giữ nguyên trường đó. */
export interface NewGameOptions {
  seed?: number
  difficulty?: DifficultyId
  tuning?: Tuning
}

/** Tàu ở giữa thế giới, đứng yên, hướng lên, đang bất tử. */
export function createShip(): Ship {
  return {
    x: WORLD_W / 2,
    y: WORLD_H / 2,
    vx: 0,
    vy: 0,
    r: SHIP.hitRadius,
    angle: 0,
    thrusting: false,
    alive: true,
    invulnMs: SHIP.invulnMs,
    cooldownMs: 0,
    hyperMs: 0,
    shield: false,
    weapon: null,
    weaponMs: 0,
    respawnMs: 0,
  }
}

/**
 * Trạng thái ban đầu ở pha `menu`. Không có thiên thạch nào — wave đầu do
 * `startGame` sinh, để menu không tốn công mô phỏng.
 */
export function createGameState(seed: number): GameState {
  return {
    phase: 'menu',
    rng: createRng(seed),
    difficulty: 'normal',
    tuning: DIFFICULTY.normal,
    ship: createShip(),
    asteroids: [],
    bullets: [],
    ufos: [],
    powerUps: [],
    particles: [],
    score: 0,
    lives: DIFFICULTY.normal.startLives,
    wave: 0,
    nextExtraLifeAt: SCORING.extraLifeEvery,
    shakeMs: 0,
    waveClearMs: 0,
    waveBannerMs: 0,
    ufoTimerMs: 0,
    elapsedMs: 0,
    announce: null,
  }
}

/** Đưa state về đầu một ván mới, giữ nguyên object để không phá tham chiếu. */
export function resetForNewGame(state: GameState, options: NewGameOptions = {}): void {
  if (options.seed !== undefined) state.rng = createRng(options.seed)
  if (options.difficulty !== undefined) state.difficulty = options.difficulty
  if (options.tuning !== undefined) state.tuning = options.tuning
  state.phase = 'playing'
  state.ship = createShip()
  state.asteroids.length = 0
  state.bullets.length = 0
  state.ufos.length = 0
  state.powerUps.length = 0
  state.particles.length = 0
  state.score = 0
  state.lives = state.tuning.startLives
  state.wave = 0
  state.nextExtraLifeAt = SCORING.extraLifeEvery
  state.shakeMs = 0
  state.waveClearMs = 0
  state.waveBannerMs = 0
  state.ufoTimerMs = 0
  state.elapsedMs = 0
  state.announce = null
}

/**
 * Chuyển pha là việc của lõi, kể cả khi lệnh đến từ một cú bấm nút — bất biến #7.
 * React gọi những hàm có tên ở đây, không bao giờ gán thẳng `state.phase`.
 */
export function pauseGame(state: GameState): void {
  if (state.phase === 'playing') state.phase = 'paused'
}

export function resumeGame(state: GameState): void {
  if (state.phase === 'paused') state.phase = 'playing'
}

export function goToPhase(state: GameState, phase: GameState['phase']): void {
  state.phase = phase
}

export function takeAnnouncement(state: GameState): string | null {
  const message = state.announce
  state.announce = null
  return message
}

export function hudOf(state: GameState): HudSnapshot {
  return {
    phase: state.phase,
    difficulty: state.difficulty,
    lives: state.lives,
    score: state.score,
    wave: state.wave,
    weapon: state.ship.weapon,
    weaponMs: state.ship.weaponMs,
    shield: state.ship.shield,
    hyperReady: state.ship.hyperMs <= 0,
  }
}

/** So sánh nông hai snapshot — dùng để chỉ báo React khi có thay đổi thật (NFR-PERF-03). */
export function hudEquals(a: HudSnapshot, b: HudSnapshot): boolean {
  return (
    a.phase === b.phase &&
    a.difficulty === b.difficulty &&
    a.lives === b.lives &&
    a.score === b.score &&
    a.wave === b.wave &&
    a.weapon === b.weapon &&
    a.shield === b.shield &&
    a.hyperReady === b.hyperReady &&
    // Đồng hồ vũ khí đổi liên tục; chỉ báo khi phần giây hiển thị đổi.
    Math.ceil(a.weaponMs / 1000) === Math.ceil(b.weaponMs / 1000)
  )
}

export const NEUTRAL_INPUT = Object.freeze({
  rotate: 0 as const,
  thrust: false,
  fire: false,
  hyperspace: false,
})
