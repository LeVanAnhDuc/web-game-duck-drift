// Kiểu dữ liệu của lõi game. Không import gì ngoài file này — bất biến #1.
// Tên gọi khoá theo docs/01-product/glossary.md.

export type Phase = 'menu' | 'playing' | 'paused' | 'gameover' | 'highscores' | 'help' | 'custom'

export type AsteroidSize = 'large' | 'medium' | 'small'

export type PowerUpKind = 'shield' | 'rapid' | 'spread' | 'pierce' | 'life'

/** Ba mức dựng sẵn cộng một mức người chơi tự đặt — glossary.md. */
export type DifficultyId = 'easy' | 'normal' | 'hard' | 'custom'

/**
 * Bốn số quyết định độ khó. Đặt một lần lúc bắt đầu ván rồi không đổi nữa —
 * ADR-0010. Thêm núm thứ năm thì phải sửa ADR đó trước.
 */
export interface Tuning {
  /** Mạng lúc bắt đầu ván. */
  startLives: number
  /** Nhân vào hệ số tốc độ thiên thạch của wave. 1 = như mức Thường. */
  asteroidSpeed: number
  /** Xác suất rơi power-up mỗi lần thiên thạch vỡ, 0..1. */
  dropChance: number
  /** Wave đầu tiên UFO xuất hiện. `UFO_NEVER` nghĩa là không bao giờ. */
  ufoFirstWave: number
}

/** Ba loại chiếm khe vũ khí. `shield` và `life` không chiếm khe — ADR-0004. */
export type WeaponKind = Extract<PowerUpKind, 'rapid' | 'spread' | 'pierce'>

/** Hàm sinh số ngẫu nhiên có state riêng. Lấy từ `state.rng` — bất biến #2. */
export interface Rng {
  /** [0, 1) */
  next(): number
  /** [min, max) */
  range(min: number, max: number): number
  /** Số nguyên [min, max] */
  int(min: number, max: number): number
  pick<T>(items: readonly T[]): T
}

export interface Body {
  x: number
  y: number
  vx: number
  vy: number
  /** Bán kính dùng cho va chạm. Với tàu, nó nhỏ hơn bán kính vẽ — bất biến #10. */
  r: number
}

export interface Ship extends Body {
  /** Radian. 0 = hướng lên (−Y), tăng theo chiều kim đồng hồ — bất biến #6. */
  angle: number
  thrusting: boolean
  alive: boolean
  invulnMs: number
  cooldownMs: number
  hyperMs: number
  shield: boolean
  weapon: WeaponKind | null
  weaponMs: number
  /** Đếm ngược trước khi hồi sinh sau khi chết. */
  respawnMs: number
}

export interface Asteroid extends Body {
  size: AsteroidSize
  angle: number
  spin: number
  /** Hệ số bán kính cho từng đỉnh của đa giác. Sinh một lần lúc tạo. */
  shape: number[]
}

export interface Bullet extends Body {
  lifeMs: number
  pierce: boolean
  fromUfo: boolean
}

export interface Ufo extends Body {
  big: boolean
  fireMs: number
  turnMs: number
}

export interface PowerUp extends Body {
  kind: PowerUpKind
  lifeMs: number
}

export interface Particle extends Body {
  lifeMs: number
  maxLifeMs: number
  color: string
}

export interface GameState {
  phase: Phase
  rng: Rng
  /** Mức của ván này. Màn Hết lượt đọc nó để biết có hỏi tên hay không. */
  difficulty: DifficultyId
  /** Bốn số cân bằng của ván này — ADR-0010. */
  tuning: Tuning
  ship: Ship
  asteroids: Asteroid[]
  bullets: Bullet[]
  ufos: Ufo[]
  powerUps: PowerUp[]
  particles: Particle[]
  score: number
  lives: number
  wave: number
  /** Mốc điểm kế tiếp được cộng một mạng. */
  nextExtraLifeAt: number
  shakeMs: number
  /** Khoảng nghỉ sau khi bắn hết thiên thạch, trước khi wave sau bắt đầu. */
  waveClearMs: number
  /**
   * Đồng hồ riêng của banner "WAVE n". Tách khỏi `waveClearMs` vì hai thứ đếm
   * ngược trong hai khoảng khác nhau: `waveClearMs` chỉ chạy khi màn đã sạch,
   * còn banner phải mờ dần ngay sau khi wave bắt đầu — lúc màn đầy thiên thạch.
   */
  waveBannerMs: number
  ufoTimerMs: number
  /** Thời gian đã chơi của ván này, tính bằng ms. */
  elapsedMs: number
  /** Chuỗi cho aria-live (NFR-A11Y-06). Tầng React đọc xong thì tự xoá. */
  announce: string | null
}

/** Một object dùng lại, không tạo mới mỗi sự kiện — NFR-PERF-05. */
export interface InputState {
  /** −1 xoay trái · 0 đứng yên · 1 xoay phải */
  rotate: -1 | 0 | 1
  thrust: boolean
  fire: boolean
  hyperspace: boolean
}

/** Bản rút gọn React nhận được. Chỉ chứa thứ HUD vẽ — bất biến #8. */
export interface HudSnapshot {
  phase: Phase
  difficulty: DifficultyId
  lives: number
  score: number
  wave: number
  weapon: WeaponKind | null
  weaponMs: number
  shield: boolean
  hyperReady: boolean
}

export interface ScoreEntry {
  /** Đúng ba ký tự in hoa. */
  initials: string
  score: number
  wave: number
  /** Epoch ms, UTC — NFR-I18N-02. */
  at: number
}
