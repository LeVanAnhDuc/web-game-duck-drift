import type { DifficultyId, ScoreEntry } from '@/game/core/types'
import { isValidEntry, rankIn, sortEntries, TOP_N, type ScoreStore } from './scoreStore'

export const STORAGE_KEY = 'asteroids.highscores.v1'

/**
 * Một khoá cho mỗi mức, top 10 độc lập — ADR-0011.
 *
 * Mức Thường DÙNG LẠI khoá cũ, nên tên khoá không đối xứng: nó không có chữ
 * `normal` trong tên. Đó là cái giá của việc không xoá điểm của ai cả.
 */
export const SCORE_KEYS: Record<Exclude<DifficultyId, 'custom'>, string> = {
  easy: 'asteroids.highscores.easy.v1',
  normal: STORAGE_KEY,
  hard: 'asteroids.highscores.hard.v1',
}

/**
 * Bản localStorage. Mọi lời gọi đều bọc try/catch vì storage có thể bị chặn hoàn
 * toàn (chế độ riêng tư, cấu hình trình duyệt) — NFR-ROB-02: mất tính năng lưu
 * điểm là chấp nhận được, crash thì không.
 */
export function createLocalScoreStore(storage?: Storage, key: string = STORAGE_KEY): ScoreStore {
  const backing = storage ?? safeStorage()

  const read = (): ScoreEntry[] => {
    if (!backing) return []
    let raw: string | null
    try {
      raw = backing.getItem(key)
    } catch {
      return []
    }
    if (!raw) return []

    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch {
      // Chuỗi hỏng hoặc bị sửa tay. Bỏ qua, bắt đầu bảng trống.
      return []
    }
    if (!Array.isArray(parsed)) return []

    // Lọc từng dòng: một dòng hỏng không được làm mất cả bảng.
    return sortEntries(parsed.filter(isValidEntry)).slice(0, TOP_N)
  }

  const write = (entries: ScoreEntry[]): void => {
    if (!backing) return
    try {
      backing.setItem(key, JSON.stringify(entries))
    } catch {
      // Hết dung lượng hoặc bị chặn. Ván này không lưu được, game vẫn chạy tiếp.
    }
  }

  return {
    top: (limit = TOP_N) => read().slice(0, limit),
    rankOf: (score) => rankIn(read(), score),
    submit: (entry) => {
      if (!isValidEntry(entry)) return
      write(sortEntries([...read(), entry]).slice(0, TOP_N))
    },
    clear: () => {
      if (!backing) return
      try {
        backing.removeItem(key)
      } catch {
        // không làm gì được, và cũng không cần
      }
    },
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
