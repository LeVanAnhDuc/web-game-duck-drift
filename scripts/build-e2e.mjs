import { spawnSync } from 'node:child_process'

/**
 * Build bản export cho e2e. Cấu hình ghi RÕ từng biến, nên một `.env` ở máy không thể rò vào:
 *
 *   off   (mặc định)  cờ = false, như GitHub Pages. Ra `out/`.
 *   auth              cờ = true, issuer giả `http://ducker.test` (không bao giờ phân giải — e2e chặn
 *                     mọi request tới nó). Ra `out-auth/` để không đè `out/`.
 */
const mode = process.argv[2] === 'auth' ? 'auth' : 'off'

const env = { ...process.env, NEXT_PUBLIC_BASE_PATH: '' }
if (mode === 'auth') {
  Object.assign(env, {
    E2E_AUTH_BUILD: 'true',
    NEXT_PUBLIC_FEATURE_DUCKER_SIGN_IN: 'true',
    NEXT_PUBLIC_DUCKER_ISSUER: 'http://ducker.test',
    NEXT_PUBLIC_DUCKER_CLIENT_ID: 'e2e-client',
    NEXT_PUBLIC_DUCKER_SCOPE: 'openid profile email',
    NEXT_PUBLIC_DUCKER_PROFILE_PATH: '/profile',
  })
} else {
  Object.assign(env, {
    E2E_AUTH_BUILD: 'false',
    NEXT_PUBLIC_FEATURE_DUCKER_SIGN_IN: 'false',
    NEXT_PUBLIC_DUCKER_ISSUER: '',
    NEXT_PUBLIC_DUCKER_CLIENT_ID: '',
    NEXT_PUBLIC_DUCKER_SCOPE: '',
    NEXT_PUBLIC_DUCKER_PROFILE_PATH: '',
  })
}

const result = spawnSync('pnpm', ['exec', 'next', 'build'], { stdio: 'inherit', shell: true, env })
process.exit(result.status ?? 1)
