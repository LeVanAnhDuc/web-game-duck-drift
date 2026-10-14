// NFR-SEC-03 (ngoại lệ có giới hạn, ADR-0021): chỉ gọi tới issuer đã cấu hình, và chỉ
// sau khi người chơi bấm đăng nhập (đường đi: duckerSession.startSession).
import { redirectUri } from './duckerAuth'
import type { DuckerConfig, DuckerProfile } from './types'

/** IdP treo thì đừng để nút "Đang đăng nhập…" khoá mãi — hết hạn thì về signed-out. */
const REQUEST_TIMEOUT_MS = 15_000

/** Đổi code lấy token. Public client — không có client_secret. */
export async function exchangeCode(
  config: DuckerConfig,
  code: string,
  verifier: string,
): Promise<{ accessToken: string }> {
  const response = await fetch(new URL('/oauth/token', config.issuer), {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      code_verifier: verifier,
      redirect_uri: redirectUri(),
      client_id: config.clientId,
    }),
  })
  if (!response.ok) throw new Error(`token_exchange_failed_${response.status}`)
  const data = (await response.json()) as { access_token?: unknown }
  if (typeof data.access_token !== 'string' || !data.access_token) throw new Error('token_exchange_invalid')
  return { accessToken: data.access_token }
}

const isOptionalString = (value: unknown) =>
  value === undefined || value === null || typeof value === 'string'

/** userinfo hỏng không được làm sập render: sai hình dạng thì coi như đăng nhập thất bại. */
function isProfile(data: unknown): data is DuckerProfile {
  if (typeof data !== 'object' || data === null) return false
  const profile = data as Record<string, unknown>
  return (
    typeof profile.sub === 'string' &&
    profile.sub !== '' &&
    isOptionalString(profile.name) &&
    isOptionalString(profile.email) &&
    isOptionalString(profile.picture) &&
    (profile.email_verified === undefined || typeof profile.email_verified === 'boolean')
  )
}

export async function fetchProfile(config: DuckerConfig, accessToken: string): Promise<DuckerProfile> {
  const response = await fetch(new URL('/oauth/userinfo', config.issuer), {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!response.ok) throw new Error(`userinfo_failed_${response.status}`)
  const data: unknown = await response.json()
  if (!isProfile(data)) throw new Error('userinfo_invalid')
  return data
}
