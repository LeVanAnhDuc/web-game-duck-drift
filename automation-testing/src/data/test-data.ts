// Constants and generators for test input. No .env, no network: values only.

export type Preset = "easy" | "normal" | "hard";

// localStorage keys the game owns: ../client/src/storage/localScoreStore.ts (SCORE_KEYS, one table per difficulty —
// normal reuses the pre-difficulty key, ADR-0011) and ../client/src/storage/settingsStore.ts (DIFFICULTY_KEY,
// TUNING_KEY). Values are JSON.
export const STORAGE = {
  scores: {
    easy: "asteroids.highscores.easy.v1",
    normal: "asteroids.highscores.v1",
    hard: "asteroids.highscores.hard.v1",
  },
  difficulty: "asteroids.difficulty.v1",
  tuning: "asteroids.tuning.v1",
} as const;

// The three presets' knobs: ../client/src/game/core/constants.ts (DIFFICULTY). Lives is what the HUD shows.
export const PRESET_LIVES: Record<Preset, number> = { easy: 5, normal: 3, hard: 2 };

// Slider bounds: ../client/src/game/core/constants.ts (TUNING_LIMITS); ufoFirstWave's max is UFO_NEVER ("tắt").
export const TUNING_LIMITS = {
  startLives: { min: 1, max: 6 },
  asteroidSpeed: { min: 0.6, max: 1.6 },
  dropChance: { min: 0, max: 0.3 },
  ufoFirstWave: { min: 1, max: 10 },
} as const;

export interface ScoreEntry {
  initials: string;
  score: number;
  wave: number;
  at: number;
}

/** A high-score row in the game's own storage shape (ScoreEntry in ../client/src/game/core/types.ts). */
export function entry(initials: string, score: number, wave = 3, at = Date.UTC(2026, 9, 1, 12)): ScoreEntry {
  return { initials, score, wave, at };
}

/** n rows, best first, all scoring well above what an idle game reaches (an idle Hard game ends on 40). */
export function fullTable(n = 10, from = 5000): ScoreEntry[] {
  return Array.from({ length: n }, (_, i) => entry(`R${String.fromCharCode(65 + i)}${String.fromCharCode(65 + i)}`, from - i * 100, 4, Date.UTC(2026, 8, 1 + i, 12)));
}

// Game rules the gameplay specs measure against: ../client/src/game/core/constants.ts (WORLD_W/H, SHIP, BULLET,
// ASTEROID_SCORE, ASTEROID, WAVE, POWERUP, SCORING) and spawn.ts / asteroids.ts (wave size and speed formulas). The
// numbers are the documented ones too: docs/specs/asteroids-core/design.md §3, FR-04…FR-09, ADR-0004, ADR-0005.
export const RULES = {
  world: { w: 1600, h: 1200 },
  /** The ship spawns here, nose up. */
  shipStart: { x: 800, y: 600 },
  asteroidScore: { large: 20, medium: 50, small: 100 },
  extraLifeEvery: 10_000,
  invulnMs: 2000,
  respawnMs: 900,
  hyperCooldownMs: 5000,
  bullet: { speed: 780, maxOnScreen: 4, maxOnScreenBoosted: 9, cooldownMs: 280 },
  weaponMs: 12_000,
  weaponMaxMs: 20_000,
  waveClearDelayMs: 1500,
  waveSafeRadius: 260,
  asteroidSpeed: { min: 60, max: 130 },
  /** Large asteroids a wave starts with: 2 + n, capped at 11. */
  waveCount: (wave: number) => Math.min(2 + wave, 11),
  /** Base speed multiplier of a wave (Normal): 1 + 0.06 (n − 1), capped at 1.8. */
  waveSpeedFactor: (wave: number) => Math.min(1 + 0.06 * (wave - 1), 1.8),
} as const;

// The flag-on e2e export (../client/scripts/build-e2e.mjs auth) signs in against this fake issuer. It is never
// resolved: the issuer fixture answers every request to it (ADR-0021).
export const DUCKER = {
  issuer: "http://ducker.test",
  profilePath: "/profile",
  user: { sub: "u1", name: "Lê Văn Anh Đức", email: "duc@ducker.id" },
  pkceKey: "ducker.pkce",
} as const;
