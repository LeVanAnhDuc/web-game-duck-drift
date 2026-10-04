import { expect, test } from '@playwright/test'
import { vi } from '../src/i18n/vi'

/** Bản build mặc định (cờ tắt, như GitHub Pages): không nút, không request ra ngoài. */
test('cờ tắt: không có nút đăng nhập và không có request ra ngoài origin', async ({ page, baseURL }) => {
  const outside: string[] = []
  page.on('request', (request) => {
    if (new URL(request.url()).origin !== new URL(baseURL!).origin) outside.push(request.url())
  })
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Chơi', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: vi.account.signIn })).toHaveCount(0)
  expect(await page.evaluate(() => sessionStorage.length)).toBe(0)
  expect(outside).toEqual([])
})
