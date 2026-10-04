import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { exchangeCode, fetchProfile } from './requests'

const config = {
  issuer: 'http://localhost:3000',
  clientId: 'game-client',
  scope: 'openid',
  profileUrl: 'http://localhost:3000/profile',
}

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status })

describe('requests', () => {
  const fetchMock = vi.fn()
  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })
  afterEach(() => vi.unstubAllGlobals())

  it('posts the PKCE token exchange as a public client, with a timeout signal', async () => {
    fetchMock.mockResolvedValue(json({ access_token: 'at-1' }))
    await expect(exchangeCode(config, 'c1', 'v1')).resolves.toEqual({ accessToken: 'at-1' })
    const [url, init] = fetchMock.mock.calls[0]!
    expect(String(url)).toBe('http://localhost:3000/oauth/token')
    expect(init.method).toBe('POST')
    expect(init.signal).toBeInstanceOf(AbortSignal)
    const body = new URLSearchParams(init.body)
    expect(Object.fromEntries(body)).toEqual({
      grant_type: 'authorization_code',
      code: 'c1',
      code_verifier: 'v1',
      redirect_uri: `${window.location.origin}/`,
      client_id: 'game-client',
    })
    expect(body.has('client_secret')).toBe(false)
  })

  it('throws on a non-ok token response', async () => {
    fetchMock.mockResolvedValue(json({}, 400))
    await expect(exchangeCode(config, 'c1', 'v1')).rejects.toThrow('token_exchange_failed_400')
  })

  it.each([{}, { access_token: 42 }, { access_token: '' }])(
    'throws when access_token is %o',
    async (body) => {
      fetchMock.mockResolvedValue(json(body))
      await expect(exchangeCode(config, 'c1', 'v1')).rejects.toThrow('token_exchange_invalid')
    },
  )

  it('fetches userinfo with the bearer and a timeout signal', async () => {
    fetchMock.mockResolvedValue(json({ sub: 'u1' }))
    await expect(fetchProfile(config, 'at-1')).resolves.toEqual({ sub: 'u1' })
    const [url, init] = fetchMock.mock.calls[0]!
    expect(String(url)).toBe('http://localhost:3000/oauth/userinfo')
    expect(init.headers).toEqual({ Authorization: 'Bearer at-1' })
    expect(init.signal).toBeInstanceOf(AbortSignal)
  })

  it('throws on a non-ok userinfo response', async () => {
    fetchMock.mockResolvedValue(json({}, 401))
    await expect(fetchProfile(config, 'at-1')).rejects.toThrow('userinfo_failed_401')
  })
})
