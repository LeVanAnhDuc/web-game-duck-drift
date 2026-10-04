import type { NextConfig } from 'next'

/**
 * GitHub Pages phục vụ site ở `/<tên-repo>`, còn chạy ở máy thì nó nằm ở gốc.
 * `NEXT_PUBLIC_BASE_PATH` do workflow deploy đặt (`/<tên-repo>`); để trống = gốc,
 * nên `pnpm dev` và `pnpm build` ở máy vẫn chạy ở gốc — xem `.env.example`.
 * Đọc đúng tên literal này: cùng biến đó cũng được inline vào bundle để dựng
 * `redirect_uri` (src/auth/config.ts).
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || undefined

// Chỉ e2e (scripts/build-e2e-auth.mjs): export bản bật đăng nhập ra `out-auth/` để không đè `out/`.
const distDir = process.env.E2E_AUTH_BUILD === 'true' ? 'out-auth' : undefined

const nextConfig: NextConfig = {
  distDir,
  // Trang tĩnh thuần (ADR-0001): `next build` sinh thẳng ra `out/`, không cần runtime.
  output: 'export',
  basePath,
  assetPrefix: basePath,
  // Pages phục vụ `/foo/` chứ không phải `/foo`; không bật thì link nội bộ 404.
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
}

export default nextConfig
