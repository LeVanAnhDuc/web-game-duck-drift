import { describe, expect, it } from 'vitest'
import { challengeOf, randomUrlSafeToken } from './pkce'

describe('pkce', () => {
  it('matches the RFC 7636 appendix B vector', async () => {
    expect(await challengeOf('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk')).toBe(
      'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM',
    )
  })

  it('produces base64url challenges without padding', async () => {
    expect(await challengeOf(randomUrlSafeToken())).toMatch(/^[A-Za-z0-9_-]{43}$/)
  })

  it('makes verifiers long enough (RFC 7636 §4.1) and different every time', () => {
    const tokens = new Set(Array.from({ length: 20 }, () => randomUrlSafeToken()))
    expect(tokens.size).toBe(20)
    for (const token of tokens) expect(token.length).toBeGreaterThanOrEqual(43)
  })
})
