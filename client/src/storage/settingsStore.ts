import { DIFFICULTY, TUNING_LIMITS } from '@/game/core/constants'
import type { DifficultyId, Tuning } from '@/game/core/types'

export const DIFFICULTY_KEY = 'asteroids.difficulty.v1'
export const TUNING_KEY = 'asteroids.tuning.v1'

const IDS: readonly string[] = ['easy', 'normal', 'hard', 'custom']

/**
 * Người dùng sửa được hai khoá này bằng devtools — NFR-ROB-01, bất biến #9.
 *
 * Trường sai chỉ mất trường ĐÓ chứ không bỏ cả object: `asteroidSpeed: 99` phải
 * ra 1.6, không phải ra một ván không chơi được, và cũng không được kéo theo ba
 * núm còn lại về mặc định — người chơi mất công kéo chúng.
 */
export function clampTuning(raw: unknown): Tuning {
  const source =
    typeof raw === 'object' && raw !== null && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {}
  const out: Tuning = { ...DIFFICULTY.normal }
  for (const key of Object.keys(out) as (keyof Tuning)[]) {
    const value = source[key]
    if (typeof value !== 'number' || !Number.isFinite(value)) continue
    const { min, max } = TUNING_LIMITS[key]
    out[key] = value < min ? min : value > max ? max : value
  }
  return out
}

function isDifficultyId(value: unknown): value is DifficultyId {
  return typeof value === 'string' && IDS.includes(value)
}

export interface SettingsStore {
  difficulty(): DifficultyId
  setDifficulty(id: DifficultyId): void
  tuning(): Tuning
  setTuning(tuning: Tuning): void
}

/**
 * Cài đặt của người chơi, tách khỏi `ScoreStore` vì nó trả lời câu hỏi khác:
 * "lần trước chọn gì", không phải "ai được bao nhiêu điểm".
 *
 * Mọi lời gọi bọc try/catch vì storage có thể bị chặn hoàn toàn — NFR-ROB-02:
 * mất việc nhớ lựa chọn là chấp nhận được, crash thì không.
 */
export function createSettingsStore(storage?: Storage): SettingsStore {
  const backing = storage ?? safeStorage()

  const read = (key: string): unknown => {
    if (!backing) return undefined
    try {
      const raw = backing.getItem(key)
      return raw === null ? undefined : JSON.parse(raw)
    } catch {
      // Bị chặn, hoặc chuỗi hỏng / bị sửa tay. Cả hai đều rơi về mặc định.
      return undefined
    }
  }

  const write = (key: string, value: unknown): void => {
    if (!backing) return
    try {
      backing.setItem(key, JSON.stringify(value))
    } catch {
      // Hết dung lượng hoặc bị chặn. Lần này không nhớ được, game vẫn chạy tiếp.
    }
  }

  return {
    difficulty: () => {
      const value = read(DIFFICULTY_KEY)
      return isDifficultyId(value) ? value : 'normal'
    },
    setDifficulty: (id) => write(DIFFICULTY_KEY, id),
    // Clamp ở CẢ hai đầu: dữ liệu cũ trong máy có thể đã ngoài biên từ trước khi
    // biên đổi, nên đọc ra cũng phải kéo về, không chỉ lúc ghi vào.
    tuning: () => clampTuning(read(TUNING_KEY)),
    setTuning: (tuning) => write(TUNING_KEY, clampTuning(tuning)),
  }
}

/** Chạm vào `localStorage` cũng có thể ném lỗi, nên phép thử này cũng phải bọc. */
function safeStorage(): Storage | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null
    const probe = '__asteroids_probe__'
    window.localStorage.setItem(probe, '1')
    window.localStorage.removeItem(probe)
    return window.localStorage
  } catch {
    return null
  }
}
