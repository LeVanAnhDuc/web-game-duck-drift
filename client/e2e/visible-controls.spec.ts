import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'
import { vi } from '../src/i18n/vi'

/**
 * F-02 · F-03 của UX review 2026-09-11.
 *
 * Chỉ chạy ở hai project, không phải cả năm: `desktop-1440` cho đường chuột/bàn phím,
 * và `touch-phone` cho đường cảm ứng — hai đường này rẽ nhánh theo `pointer: coarse`,
 * nên đó là hai thứ thật sự khác nhau. Ba khổ còn lại chỉ là bố cục và `layout.spec.ts`
 * đã sở hữu chúng; chạy thêm chỉ làm các worker đói CPU (xem nợ kỹ thuật ở backlog).
 */
const RUN_ON = ['desktop-1440', 'touch-phone']

test.beforeEach(({}, testInfo) => {
  test.skip(!RUN_ON.includes(testInfo.project.name), 'chỉ hai đường pointer là khác nhau thật')
})

async function startGame(page: Page) {
  await page.goto('/')
  await page.evaluate(() => {
    try {
      localStorage.clear()
    } catch {}
  })
  await page.reload()
  // Chờ hydrate bằng một tín hiệu thật thay vì thử-lại-click với hạn 2 giây: hạn ngắn
  // là nguồn của cái flake đang ghi ở backlog §Nợ kỹ thuật, và nó đỏ vì máy đói CPU
  // chứ không vì sản phẩm sai.
  const play = page.getByRole('button', { name: 'Chơi', exact: true })
  await play.waitFor({ state: 'visible', timeout: 30_000 })
  await expect(async () => {
    await play.click({ timeout: 10_000 })
    await expect(page.getByRole('button', { name: 'Tạm dừng', exact: true })).toBeVisible({
      timeout: 10_000,
    })
  }).toPass({ timeout: 45_000 })
}

test.describe('người vào ván biết mình bấm gì — F-02', () => {
  test('chuột/bàn phím: gợi ý có mặt lúc vào ván, và nêu đúng ba phím', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-1440', 'đường không cảm ứng')
    await startGame(page)

    const hint = page.getByText(new RegExp(vi.hud.controlsHint))
    await expect(hint).toBeVisible()
    await expect(hint).toContainText(vi.help.keyboard.fireKeys)
  })

  test('gợi ý KHÔNG biến mất chỉ vì điểm lên', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-1440', 'đường không cảm ứng')
    await startGame(page)

    const hint = page.getByText(new RegExp(vi.hud.controlsHint))
    await expect(hint).toBeVisible()

    // Ngồi yên tới khi điểm lên: viên đá giết tàu cũng vỡ, và vỡ thì được điểm —
    // người chơi chưa làm gì cả. Gợi ý phải còn đó, vì họ vẫn chưa biết bấm gì.
    await expect(page.getByText(/^20$/).first()).toBeVisible({ timeout: 30_000 })
    await expect(hint).toBeVisible()
  })

  test('cảm ứng: KHÔNG hiện chữ, vì đã có năm nút thật', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'touch-phone', 'đường cảm ứng')
    await startGame(page)

    // Chống hồi quy cho §0 của design.md: nửa F-02 nói "ở 375px không có nút nào"
    // là đo trên con trỏ `fine`. Trên thiết bị cảm ứng thật thì nút có đủ.
    await expect(page.getByText(new RegExp(vi.hud.controlsHint))).toHaveCount(0)
    await expect(page.getByRole('button', { name: vi.a11y.thrust })).toBeVisible()
  })
})
