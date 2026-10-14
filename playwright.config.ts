import { defineConfig, devices } from '@playwright/test'

// Cổng cố định riêng cho repo này (không dùng 4173 mặc định của vite preview, và tránh
// 3000/5000 của Ducker ID) để không bắt nhầm server của repo game khác chạy song song.
const PORT = 4311
const BASE_URL = `http://127.0.0.1:${PORT}`
// Bản build BẬT đăng nhập (issuer giả) — scripts/build-e2e.mjs, xuất ra out-auth/.
const AUTH_PORT = 4312
const AUTH_URL = `http://127.0.0.1:${AUTH_PORT}`
const AUTH_SPEC = /ducker-id-sign-in\.spec\.ts/

/**
 * Chạy trên BẢN EXPORT TĨNH, không phải dev server: đó mới là thứ GitHub Pages
 * phục vụ, nên đó là thứ đáng kiểm. `next start` không phục vụ được bản export,
 * nên dùng `scripts/serve.mjs` trên `out/`.
 *
 * Năm project ứng với đúng những khổ mà thiết kế cam kết (design.md §5, wireframe
 * đã duyệt). Đây là chỗ duy nhất kiểm được bố cục ở 375 / 768 / 1024 một cách tự
 * động — `backlog.md` có một mục riêng cho việc này vì trước đó chưa ai nhìn thấy
 * ba khổ đó chạy thật.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'mobile-375',
      testIgnore: AUTH_SPEC,
      use: { ...devices['Desktop Chrome'], viewport: { width: 375, height: 720 } },
    },
    {
      name: 'tablet-768',
      testIgnore: AUTH_SPEC,
      use: { ...devices['Desktop Chrome'], viewport: { width: 768, height: 900 } },
    },
    {
      name: 'laptop-1024',
      testIgnore: AUTH_SPEC,
      use: { ...devices['Desktop Chrome'], viewport: { width: 1024, height: 768 } },
    },
    {
      name: 'desktop-1440',
      testIgnore: AUTH_SPEC,
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    // Màn hình cảm ứng thật: nút giữ-được rẽ nhánh theo pointer capture và theo
    // `pointer: coarse`, hai thứ không dựng lại được bằng chuột (US-03).
    { name: 'touch-phone', testIgnore: AUTH_SPEC, use: { ...devices['Pixel 5'] } },
    // Bản BẬT đăng nhập: chỉ chạy spec đăng nhập, ở khổ hẹp nhất và khổ rộng.
    {
      name: 'auth-375',
      testMatch: AUTH_SPEC,
      use: { ...devices['Desktop Chrome'], baseURL: AUTH_URL, viewport: { width: 375, height: 720 } },
    },
    {
      name: 'auth-320',
      testMatch: AUTH_SPEC,
      use: { ...devices['Desktop Chrome'], baseURL: AUTH_URL, viewport: { width: 320, height: 640 } },
    },
    {
      name: 'auth-1440',
      testMatch: AUTH_SPEC,
      use: { ...devices['Desktop Chrome'], baseURL: AUTH_URL, viewport: { width: 1440, height: 900 } },
    },
  ],
  webServer: [
    {
      command: `node scripts/build-e2e.mjs off && node scripts/serve.mjs ${PORT} out`,
      url: BASE_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 600_000,
    },
    {
      command: `node scripts/build-e2e.mjs auth && node scripts/serve.mjs ${AUTH_PORT} out-auth`,
      url: AUTH_URL,
      // Luôn dựng lại: một server cũ có thể đang phục vụ bản build với cấu hình khác.
      reuseExistingServer: false,
      timeout: 600_000,
    },
  ],
})
