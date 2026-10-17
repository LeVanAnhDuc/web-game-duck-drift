/**
 * PKCE (RFC 7636) — thay client_secret cho app chạy hoàn toàn trên trình duyệt.
 *
 * Game là public client: không backend nên không có chỗ giữ bí mật dài hạn.
 * `code_verifier` an toàn vì sinh mới mỗi lần đăng nhập, sống vài giây, dùng một
 * lần rồi bỏ — lộ một verifier chỉ hỏng đúng phiên đó.
 */

const VERIFIER_BYTES = 32

function toBase64Url(bytes: ArrayBuffer): string {
  const binary = String.fromCharCode(...new Uint8Array(bytes))
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/** Chuỗi ngẫu nhiên base64url — dùng cho cả code_verifier lẫn state. */
export function randomUrlSafeToken(): string {
  return toBase64Url(crypto.getRandomValues(new Uint8Array(VERIFIER_BYTES)).buffer)
}

/** challenge = BASE64URL(SHA256(ASCII(verifier))) — phương thức S256. */
export async function challengeOf(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))
  return toBase64Url(digest)
}
