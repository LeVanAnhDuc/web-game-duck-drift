import { expect, test } from '@playwright/test'
import { vi } from '../src/i18n/vi'

/**
 * Chạy ở cả năm project của `playwright.config.ts`, nên mỗi assert dưới đây được
 * kiểm lại ở 375 / 768 / 1024 / 1440 và trên một điện thoại cảm ứng thật.
 *
 * Đây là thứ thay cho việc mở tay từng khổ màn hình: bố cục ba khổ hẹp trước đó
 * chưa từng được nhìn thấy chạy thật.
 */

test.describe('màn hình chính', () => {
  test('hiện tên game và bốn lối vào', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'DUCK DRIFT', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Chơi', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Bảng điểm', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Cách chơi', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Tuỳ chỉnh', exact: true })).toBeVisible()
  })

  test('máy chưa chơi bao giờ thì nói rõ là chưa có điểm, VÀ của mức nào', async ({ page }) => {
    await page.goto('/')
    // Nêu cả mức — F-07. Bản cũ chỉ ghi "Chưa có điểm nào", nên đúng lúc người chơi
    // vừa đổi mức thì menu không xác nhận họ vừa đổi bảng điểm nào.
    await expect(page.getByText(vi.menu.noBestOf(vi.difficulty.normal), { exact: true })).toBeVisible()
  })

  test('menu nói điểm chỉ lưu trên máy này, trước khi bấm Bảng điểm — F-08', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText(vi.menu.localNote, { exact: true })).toBeVisible()
  })
})

test.describe('bố cục không bao giờ tràn ngang', () => {
  test('màn hình chính', async ({ page }) => {
    await page.goto('/')
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(0)
  })

  test('màn Cách chơi — màn dài nhất, và là màn dễ tràn nhất', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Cách chơi', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Cách chơi', exact: true })).toBeVisible()

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(0)
  })

  test('bảng điểm', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Bảng điểm', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Bảng điểm', exact: true })).toBeVisible()

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(0)
  })
})

test.describe('canvas', () => {
  test('nằm gọn trong khung nhìn ở mọi khổ', async ({ page }) => {
    await page.goto('/')
    const canvas = page.locator('canvas')
    await expect(canvas).toHaveCount(1)

    const box = await canvas.boundingBox()
    const viewport = page.viewportSize()
    expect(box).not.toBeNull()
    expect(viewport).not.toBeNull()
    expect(box!.width).toBeLessThanOrEqual(viewport!.width + 1)
    expect(box!.x).toBeGreaterThanOrEqual(0)
  })

  test('có nhãn thay thế cho người dùng trình đọc màn hình — NFR-A11Y-06', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('img', { name: /Khu vực chơi/ })).toHaveCount(1)
  })
})

test.describe('màn Cách chơi liệt kê đủ năm vật phẩm — NFR-A11Y-04', () => {
  test('mỗi loại có tên bằng chữ, không chỉ có màu', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Cách chơi', exact: true }).click()

    for (const name of ['Khiên', 'Bắn nhanh', 'Bắn toả', 'Đạn xuyên', 'Thêm mạng']) {
      await expect(page.getByText(name, { exact: true })).toBeVisible()
    }
  })

  test('quay lại được về menu', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Cách chơi', exact: true }).click()
    await page.getByRole('button', { name: 'Quay lại', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'DUCK DRIFT', exact: true })).toBeVisible()
  })
})
