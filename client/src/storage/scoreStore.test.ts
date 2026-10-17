import { describe, expect, it } from 'vitest'
import type { ScoreEntry } from '@/game/core/types'
import { createLocalScoreStore, SCORE_KEYS, STORAGE_KEY } from './localScoreStore'
import { createMemoryScoreStore, isValidEntry, normalizeInitials, TOP_N } from './scoreStore'

const entry = (score: number, at = 1_000_000, initials = 'ABC'): ScoreEntry => ({
  initials,
  score,
  wave: 3,
  at,
})

/** Storage giả NHIỀU khoá — `fakeStorage` chỉ giữ một giá trị nên không dùng
 *  được cho ba bảng độc lập. */
function mapStorage(): Storage {
  const map = new Map<string, string>()
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

/** Storage giả trong bộ nhớ; `failOn` cho phép bắt chước storage bị chặn. */
function fakeStorage(initial?: string, failOn: 'none' | 'get' | 'set' | 'all' = 'none'): Storage {
  let value = initial ?? null
  return {
    get length() {
      return value === null ? 0 : 1
    },
    clear: () => {
      value = null
    },
    key: () => null,
    getItem: () => {
      if (failOn === 'get' || failOn === 'all') throw new DOMException('bị chặn')
      return value
    },
    setItem: (_k: string, v: string) => {
      if (failOn === 'set' || failOn === 'all') throw new DOMException('hết dung lượng')
      value = v
    },
    removeItem: () => {
      if (failOn === 'all') throw new DOMException('bị chặn')
      value = null
    },
  } as Storage
}

describe('normalizeInitials', () => {
  it('luôn trả về đúng ba ký tự in hoa', () => {
    expect(normalizeInitials('ab')).toBe('ABA')
    expect(normalizeInitials('abcd')).toBe('ABC')
    expect(normalizeInitials('')).toBe('AAA')
    expect(normalizeInitials('a1!')).toBe('AAA')
  })
})

describe('isValidEntry — NFR-ROB-01', () => {
  it('nhận bản ghi hợp lệ', () => {
    expect(isValidEntry(entry(100))).toBe(true)
  })

  it('từ chối tên sai định dạng, điểm âm, số không hữu hạn, thiếu trường', () => {
    expect(isValidEntry({ ...entry(100), initials: 'abcd' })).toBe(false)
    expect(isValidEntry({ ...entry(100), score: -1 })).toBe(false)
    expect(isValidEntry({ ...entry(100), score: Number.NaN })).toBe(false)
    expect(isValidEntry({ initials: 'ABC', score: 10 })).toBe(false)
    expect(isValidEntry(null)).toBe(false)
    expect(isValidEntry('ABC')).toBe(false)
  })
})

describe('thứ hạng và giới hạn 10 dòng', () => {
  it('sắp xếp giảm dần theo điểm, bằng điểm thì cái cũ hơn đứng trước', () => {
    const store = createMemoryScoreStore([entry(100, 2), entry(300, 1), entry(100, 1)])
    expect(store.top().map((e) => [e.score, e.at])).toEqual([
      [300, 1],
      [100, 1],
      [100, 2],
    ])
  })

  it('chỉ giữ 10 dòng', () => {
    const store = createMemoryScoreStore()
    for (let i = 1; i <= 15; i++) store.submit(entry(i * 10, i))
    expect(store.top()).toHaveLength(TOP_N)
    expect(store.top()[0]?.score).toBe(150)
  })

  it('rankOf trả null khi không lọt bảng', () => {
    const store = createMemoryScoreStore()
    for (let i = 1; i <= 10; i++) store.submit(entry(1000 + i * 10, i))
    expect(store.rankOf(500)).toBeNull()
    expect(store.rankOf(9999)).toBe(1)
  })

  it('rankOf trả null cho điểm 0 — không hỏi tên khi chưa ghi được điểm nào', () => {
    expect(createMemoryScoreStore().rankOf(0)).toBeNull()
  })

  it('bảng chưa đầy thì điểm nào cũng có hạng', () => {
    const store = createMemoryScoreStore([entry(500)])
    expect(store.rankOf(10)).toBe(2)
  })
})

describe('localScoreStore — NFR-ROB-02', () => {
  it('đọc và ghi được qua storage', () => {
    const store = createLocalScoreStore(fakeStorage())
    store.submit(entry(120))
    expect(store.top()).toHaveLength(1)
    expect(store.top()[0]?.score).toBe(120)
  })

  it('JSON hỏng thì trả bảng trống, không ném lỗi', () => {
    const store = createLocalScoreStore(fakeStorage('{không phải json'))
    expect(store.top()).toEqual([])
  })

  it('dữ liệu không phải mảng thì trả bảng trống', () => {
    const store = createLocalScoreStore(fakeStorage('{"a":1}'))
    expect(store.top()).toEqual([])
  })

  it('một dòng hỏng không làm mất cả bảng', () => {
    const raw = JSON.stringify([entry(100), { initials: 'xx' }, entry(300)])
    const store = createLocalScoreStore(fakeStorage(raw))
    expect(store.top().map((e) => e.score)).toEqual([300, 100])
  })

  it('storage ném lỗi khi đọc thì vẫn chơi được', () => {
    const store = createLocalScoreStore(fakeStorage(undefined, 'get'))
    expect(store.top()).toEqual([])
    expect(store.rankOf(100)).toBe(1)
  })

  it('storage ném lỗi khi ghi thì submit im lặng bỏ qua', () => {
    const store = createLocalScoreStore(fakeStorage(undefined, 'set'))
    expect(() => store.submit(entry(100))).not.toThrow()
    expect(store.top()).toEqual([])
  })

  it('clear xoá sạch', () => {
    const s = fakeStorage()
    const store = createLocalScoreStore(s)
    store.submit(entry(100))
    store.clear()
    expect(store.top()).toEqual([])
    expect(s.getItem(STORAGE_KEY)).toBeNull()
  })

  it('bỏ qua bản ghi không hợp lệ khi submit', () => {
    const store = createLocalScoreStore(fakeStorage())
    store.submit({ initials: 'zz', score: -5, wave: 1, at: 1 } as ScoreEntry)
    expect(store.top()).toEqual([])
  })
})

describe('ba bảng độc lập — ADR-0011', () => {
  it('khoá mức Thường vẫn là khoá cũ, không đổi', () => {
    // Đổi khoá này là xoá bảng điểm của người đang chơi.
    expect(SCORE_KEYS.normal).toBe('asteroids.highscores.v1')
    expect(SCORE_KEYS.normal).toBe(STORAGE_KEY)
  })

  it('ba mức ba khoá khác nhau', () => {
    expect(new Set([SCORE_KEYS.easy, SCORE_KEYS.normal, SCORE_KEYS.hard]).size).toBe(3)
  })

  it('ghi điểm ở một mức không đụng bảng của mức khác', () => {
    const storage = mapStorage()
    const easy = createLocalScoreStore(storage, SCORE_KEYS.easy)
    const normal = createLocalScoreStore(storage, SCORE_KEYS.normal)

    normal.submit(entry(9000))
    easy.submit(entry(100))

    expect(normal.top()).toHaveLength(1)
    expect(normal.top()[0]!.score).toBe(9000)
    expect(easy.top()).toHaveLength(1)
    expect(easy.top()[0]!.score).toBe(100)
  })

  it('điểm thấp ở mức Khó vẫn là hạng 1 của bảng Khó', () => {
    const storage = mapStorage()
    createLocalScoreStore(storage, SCORE_KEYS.normal).submit(entry(50_000))
    expect(createLocalScoreStore(storage, SCORE_KEYS.hard).rankOf(10)).toBe(1)
  })

  it('xoá một bảng không đụng hai bảng kia', () => {
    const storage = mapStorage()
    const easy = createLocalScoreStore(storage, SCORE_KEYS.easy)
    const hard = createLocalScoreStore(storage, SCORE_KEYS.hard)
    easy.submit(entry(100))
    hard.submit(entry(200))

    hard.clear()
    expect(hard.top()).toHaveLength(0)
    expect(easy.top()).toHaveLength(1)
  })
})
