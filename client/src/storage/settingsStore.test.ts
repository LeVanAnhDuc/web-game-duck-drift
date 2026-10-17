import { describe, expect, it } from 'vitest'
import { DIFFICULTY, TUNING_LIMITS } from '@/game/core/constants'
import { clampTuning, createSettingsStore, DIFFICULTY_KEY, TUNING_KEY } from './settingsStore'

function mapStorage(seed: Record<string, string> = {}): Storage {
  const map = new Map(Object.entries(seed))
  return {
    get length() {
      return map.size
    },
    clear: () => map.clear(),
    key: (i: number) => Array.from(map.keys())[i] ?? null,
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
  } as Storage
}

/** Storage bị chặn hoàn toàn — chế độ riêng tư, hoặc trình duyệt cấu hình chặn. */
function blocked(): Storage {
  return {
    length: 0,
    clear: () => {},
    key: () => null,
    getItem: () => {
      throw new DOMException('bị chặn')
    },
    setItem: () => {
      throw new DOMException('bị chặn')
    },
    removeItem: () => {},
  } as Storage
}

describe('mức đang chọn — FR-20', () => {
  it('chưa chọn gì thì là mức Thường', () => {
    expect(createSettingsStore(mapStorage()).difficulty()).toBe('normal')
  })

  it('nhớ lựa chọn qua một lần đọc lại', () => {
    const storage = mapStorage()
    createSettingsStore(storage).setDifficulty('hard')
    expect(createSettingsStore(storage).difficulty()).toBe('hard')
  })

  it('giá trị lạ trong storage bị bỏ qua, không crash — NFR-ROB-01', () => {
    for (const raw of ['"nightmare"', 'null', '42', '{}', 'không phải json']) {
      expect(createSettingsStore(mapStorage({ [DIFFICULTY_KEY]: raw })).difficulty()).toBe('normal')
    }
  })

  it('storage ném lỗi thì vẫn trả mặc định và ghi không crash — NFR-ROB-02', () => {
    const store = createSettingsStore(blocked())
    expect(store.difficulty()).toBe('normal')
    expect(() => store.setDifficulty('easy')).not.toThrow()
  })
})

describe('bốn số Tuỳ chỉnh — FR-21', () => {
  it('chưa đặt gì thì bằng mức Thường', () => {
    expect(createSettingsStore(mapStorage()).tuning()).toEqual(DIFFICULTY.normal)
  })

  it('clamp về biên chứ không bỏ cả object', () => {
    const t = clampTuning({ startLives: 99, asteroidSpeed: -5, dropChance: 7, ufoFirstWave: 0 })
    expect(t.startLives).toBe(TUNING_LIMITS.startLives.max)
    expect(t.asteroidSpeed).toBe(TUNING_LIMITS.asteroidSpeed.min)
    expect(t.dropChance).toBe(TUNING_LIMITS.dropChance.max)
    expect(t.ufoFirstWave).toBe(TUNING_LIMITS.ufoFirstWave.min)
  })

  it('trường sai kiểu chỉ mất trường đó, ba trường kia giữ nguyên', () => {
    const t = clampTuning({ startLives: 6, asteroidSpeed: 'nhanh', dropChance: null, ufoFirstWave: 4 })
    expect(t.startLives).toBe(6)
    expect(t.ufoFirstWave).toBe(4)
    expect(t.asteroidSpeed).toBe(DIFFICULTY.normal.asteroidSpeed)
    expect(t.dropChance).toBe(DIFFICULTY.normal.dropChance)
  })

  it('NaN và Infinity không lọt qua', () => {
    expect(
      clampTuning({ startLives: NaN, asteroidSpeed: Infinity, dropChance: -Infinity, ufoFirstWave: NaN }),
    ).toEqual(DIFFICULTY.normal)
  })

  it('rác hoàn toàn thì ra mức Thường', () => {
    for (const raw of [null, 'chuỗi', 42, []]) {
      expect(clampTuning(raw)).toEqual(DIFFICULTY.normal)
    }
  })

  it('nhớ bốn số qua một lần đọc lại', () => {
    const storage = mapStorage()
    const mine = { startLives: 6, asteroidSpeed: 0.6, dropChance: 0.3, ufoFirstWave: 10 }
    createSettingsStore(storage).setTuning(mine)
    expect(createSettingsStore(storage).tuning()).toEqual(mine)
  })

  it('bốn số bị sửa tay ngoài biên được kéo về biên lúc đọc', () => {
    const raw = JSON.stringify({ startLives: 999, asteroidSpeed: 99, dropChance: 1, ufoFirstWave: 99 })
    const t = createSettingsStore(mapStorage({ [TUNING_KEY]: raw })).tuning()
    expect(t.startLives).toBe(TUNING_LIMITS.startLives.max)
    expect(t.asteroidSpeed).toBe(TUNING_LIMITS.asteroidSpeed.max)
  })
})
