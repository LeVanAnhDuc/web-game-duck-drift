import type { Rng } from './types'

/**
 * mulberry32 — PRNG 32-bit, nhỏ và đủ tốt cho game.
 *
 * Lý do không dùng `Math.random`: bất biến #1 và #2. Cùng một seed phải cho cùng
 * một dãy số, nếu không thì `NFR-ROB-04` không kiểm được và bug không tái hiện được.
 */
export function createRng(seed: number): Rng {
  let a = seed >>> 0

  const next = (): number => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  return {
    next,
    range: (min, max) => min + next() * (max - min),
    int: (min, max) => min + Math.floor(next() * (max - min + 1)),
    pick: <T>(items: readonly T[]): T => {
      if (items.length === 0) throw new Error('rng.pick: mảng rỗng')
      return items[Math.floor(next() * items.length)] as T
    },
  }
}
