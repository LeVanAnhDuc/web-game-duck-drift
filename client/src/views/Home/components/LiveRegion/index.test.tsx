import { describe, expect, it } from 'vitest'
import { translateAnnouncement } from './index'
import { vi as strings } from '@/i18n/vi'

describe('translateAnnouncement — NFR-A11Y-06', () => {
  it('dịch khoá của lõi sang chuỗi tiếng Việt', () => {
    expect(translateAnnouncement('wave:3')).toBe(strings.announce.waveStart(3))
    expect(translateAnnouncement('lifeLost:2')).toBe(strings.announce.lifeLost(2))
    expect(translateAnnouncement('extraLife')).toBe(strings.announce.extraLife)
  })

  it('khoá lạ hoặc null trả về chuỗi rỗng, không ném lỗi', () => {
    expect(translateAnnouncement(null)).toBe('')
    expect(translateAnnouncement('không-biết')).toBe('')
  })
})
