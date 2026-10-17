import { describe, expect, it } from 'vitest'
import { WORLD_H, WORLD_W } from './constants'
import {
  angleBetween,
  angleToVecX,
  angleToVecY,
  distSq,
  limitSpeed,
  overlaps,
  shortestDeltaX,
  shortestDeltaY,
  wrapX,
  wrapY,
} from './vector'
import { createRng } from './rng'

const body = (x: number, y: number, r = 10) => ({ x, y, vx: 0, vy: 0, r })

describe('wrap', () => {
  it('đưa toạ độ âm về phía mép đối diện', () => {
    expect(wrapX(-1)).toBe(WORLD_W - 1)
    expect(wrapY(-1)).toBe(WORLD_H - 1)
  })

  it('đưa toạ độ vượt mép về đầu', () => {
    expect(wrapX(WORLD_W + 5)).toBe(5)
    expect(wrapY(WORLD_H + 5)).toBe(5)
  })

  it('giữ nguyên toạ độ đã nằm trong thế giới', () => {
    expect(wrapX(123)).toBe(123)
    expect(wrapY(456)).toBe(456)
  })

  it('xử lý được toạ độ âm rất lớn, không lặp vô hạn', () => {
    expect(wrapX(-WORLD_W * 3 - 7)).toBeCloseTo(WORLD_W - 7)
  })
})

describe('khoảng cách ngắn nhất trên hình xuyến — bất biến #5', () => {
  it('hai điểm sát hai mép đối diện thì gần nhau, không xa nhau', () => {
    expect(shortestDeltaX(5, WORLD_W - 5)).toBe(-10)
    expect(shortestDeltaY(5, WORLD_H - 5)).toBe(-10)
  })

  it('trong cùng một vùng thì bằng hiệu thẳng', () => {
    expect(shortestDeltaX(100, 140)).toBe(40)
    expect(shortestDeltaY(100, 140)).toBe(40)
  })

  it('va chạm nhận được khi hai vật ở hai bên mép', () => {
    const a = body(WORLD_W - 4, 300, 10)
    const b = body(4, 300, 10)
    expect(overlaps(a, b)).toBe(true)
    expect(distSq(a, b)).toBe(64)
  })

  it('không nhận va chạm khi thật sự cách xa', () => {
    expect(overlaps(body(100, 100, 10), body(400, 400, 10))).toBe(false)
  })
})

describe('quy ước góc — bất biến #6', () => {
  it('góc 0 là hướng lên', () => {
    expect(angleToVecX(0)).toBeCloseTo(0)
    expect(angleToVecY(0)).toBeCloseTo(-1)
  })

  it('góc π/2 là hướng sang phải', () => {
    expect(angleToVecX(Math.PI / 2)).toBeCloseTo(1)
    expect(angleToVecY(Math.PI / 2)).toBeCloseTo(0)
  })

  it('angleBetween trả về góc theo đúng quy ước đó', () => {
    // b nằm ngay bên phải a
    expect(angleBetween(body(100, 100), body(200, 100))).toBeCloseTo(Math.PI / 2)
    // b nằm ngay phía trên a
    expect(angleBetween(body(100, 200), body(100, 100))).toBeCloseTo(0)
  })
})

describe('limitSpeed', () => {
  it('không đụng vào vận tốc đã dưới trần', () => {
    const b = { ...body(0, 0), vx: 3, vy: 4 }
    limitSpeed(b, 10)
    expect(b.vx).toBe(3)
    expect(b.vy).toBe(4)
  })

  it('co vector về đúng trần, giữ nguyên hướng', () => {
    const b = { ...body(0, 0), vx: 30, vy: 40 }
    limitSpeed(b, 10)
    expect(Math.hypot(b.vx, b.vy)).toBeCloseTo(10)
    expect(b.vx / b.vy).toBeCloseTo(30 / 40)
  })
})

describe('rng — bất biến #2', () => {
  it('cùng seed cho cùng dãy số', () => {
    const a = createRng(1234)
    const b = createRng(1234)
    const seqA = Array.from({ length: 50 }, () => a.next())
    const seqB = Array.from({ length: 50 }, () => b.next())
    expect(seqA).toEqual(seqB)
  })

  it('seed khác cho dãy khác', () => {
    expect(createRng(1).next()).not.toBe(createRng(2).next())
  })

  it('next() luôn nằm trong [0, 1)', () => {
    const r = createRng(99)
    for (let i = 0; i < 500; i++) {
      const v = r.next()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })

  it('int() bao gồm cả hai đầu mút', () => {
    const r = createRng(7)
    const seen = new Set<number>()
    for (let i = 0; i < 500; i++) seen.add(r.int(1, 3))
    expect([...seen].sort()).toEqual([1, 2, 3])
  })
})
