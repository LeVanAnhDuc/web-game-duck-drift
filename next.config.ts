import type { NextConfig } from 'next'

/**
 * GitHub Pages phục vụ site ở `/<tên-repo>`, còn chạy ở máy thì nó nằm ở gốc.
 * `GITHUB_PAGES` chỉ được workflow deploy đặt, nên `pnpm dev` và `pnpm build` ở
 * máy vẫn chạy ở gốc — xem `.env.example`.
 */
const isGithubPages = process.env.GITHUB_PAGES === 'true'
const basePath = '/web-game-duck-drift'

const nextConfig: NextConfig = {
  // Trang tĩnh thuần (ADR-0001): `next build` sinh thẳng ra `out/`, không cần runtime.
  output: 'export',
  basePath: isGithubPages ? basePath : undefined,
  assetPrefix: isGithubPages ? basePath : undefined,
  // Pages phục vụ `/foo/` chứ không phải `/foo`; không bật thì link nội bộ 404.
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
}

export default nextConfig
