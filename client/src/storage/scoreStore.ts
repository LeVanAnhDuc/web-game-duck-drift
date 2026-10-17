import type { ScoreEntry } from '@/game/core/types'

export const TOP_N = 10

/**
 * Cổng duy nhất giữa game và nơi lưu điểm — ADR-0006.
 *
 * Lõi game không biết interface này tồn tại. Bản hiện thực duy nhất lúc này là
 * localStorage; thêm bản online sau này là thêm một file, không sửa gameplay.
 */
export interface ScoreStore {
  top(limit?: number): ScoreEntry[]
  /** Hạng 1-based nếu điểm này lọt bảng, `null` nếu không. */
  rankOf(score: number): number | null
  submit(entry: ScoreEntry): void
  clear(): void
}

/** Đúng ba ký tự A–Z. Thiếu thì đệm, thừa thì cắt, ký tự lạ thành `A`. */
export function normalizeInitials(raw: string): string {
  const cleaned = raw
    .toUpperCase()
    .split('')
    .map((c) => (c >= 'A' && c <= 'Z' ? c : 'A'))
    .join('')
  return (cleaned + 'AAA').slice(0, 3)
}

/**
 * Dữ liệu này người dùng sửa được bằng devtools — NFR-ROB-01. Mọi trường đều
 * phải kiểm, không tin `JSON.parse`.
 */
export function isValidEntry(value: unknown): value is ScoreEntry {
  if (typeof value !== 'object' || value === null) return false
  const e = value as Record<string, unknown>
  return (
    typeof e.initials === 'string' &&
    /^[A-Z]{3}$/.test(e.initials) &&
    typeof e.score === 'number' &&
    Number.isFinite(e.score) &&
    e.score >= 0 &&
    typeof e.wave === 'number' &&
    Number.isFinite(e.wave) &&
    e.wave >= 0 &&
    typeof e.at === 'number' &&
    Number.isFinite(e.at)
  )
}

/** Điểm cao lên trước; bằng điểm thì cái cũ hơn đứng trước — về trước thì hơn. */
export function sortEntries(entries: ScoreEntry[]): ScoreEntry[] {
  return [...entries].sort((a, b) => b.score - a.score || a.at - b.at)
}

/** Bản trong bộ nhớ, dùng cho test và cho trường hợp storage không dùng được. */
export function createMemoryScoreStore(seed: ScoreEntry[] = []): ScoreStore {
  let entries = sortEntries(seed.filter(isValidEntry)).slice(0, TOP_N)

  return {
    top: (limit = TOP_N) => entries.slice(0, limit),
    rankOf: (score) => rankIn(entries, score),
    submit: (entry) => {
      if (!isValidEntry(entry)) return
      entries = sortEntries([...entries, entry]).slice(0, TOP_N)
    },
    clear: () => {
      entries = []
    },
  }
}

export function rankIn(entries: ScoreEntry[], score: number): number | null {
  if (score <= 0) return null
  const better = entries.filter((e) => e.score >= score).length
  const rank = better + 1
  return rank <= TOP_N ? rank : null
}
