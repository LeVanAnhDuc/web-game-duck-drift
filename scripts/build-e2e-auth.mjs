import { spawnSync } from 'node:child_process'

/**
 * Build bản export có BẬT đăng nhập Ducker ID, dùng issuer giả `http://ducker.test`
 * (không bao giờ phân giải — e2e chặn mọi request tới nó), ra thư mục riêng `out-auth/`
 * để không đè bản `out/` (cờ tắt) mà các e2e khác đang phục vụ.
 */
const result = spawnSync('pnpm', ['exec', 'next', 'build'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    E2E_AUTH_BUILD: 'true',
    NEXT_PUBLIC_BASE_PATH: '',
    NEXT_PUBLIC_FEATURE_DUCKER_SIGN_IN: 'true',
    NEXT_PUBLIC_DUCKER_ISSUER: 'http://ducker.test',
    NEXT_PUBLIC_DUCKER_CLIENT_ID: 'e2e-client',
    NEXT_PUBLIC_DUCKER_SCOPE: 'openid profile email',
    NEXT_PUBLIC_DUCKER_PROFILE_PATH: '/profile',
  },
})
process.exit(result.status ?? 1)
