import { expect, test } from '@playwright/test'

/**
 * Luật của bốn núm đã được test đơn vị phủ bằng cách gọi thẳng `step()`. Ở đây
 * chỉ kiểm phần chỉ có nghĩa trong trình duyệt thật: dãy mức có mặt ở menu, lựa
 * chọn sống qua một lần tải lại trang, và màn Tuỳ chỉnh vào ván được.
 */

test.describe('chọn độ khó — US-07', () => {
  test('ba mức ở menu, Thường được chọn sẵn', async ({ page }) => {
    await page.goto('/')

    const group = page.getByRole('group', { name: 'Độ khó' })
    await expect(group.getByRole('button')).toHaveCount(3)
    await expect(group.getByRole('button', { name: 'Thường', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  test('lựa chọn mức sống qua một lần tải lại trang', async ({ page }) => {
    await page.goto('/')

    // Bấm được nghĩa là React đã hydrate; nếu chưa thì cú bấm mất hẳn.
    await expect(async () => {
      await page.getByRole('button', { name: 'Khó', exact: true }).click({ timeout: 2000 })
      await expect(page.getByRole('button', { name: 'Khó', exact: true })).toHaveAttribute(
        'aria-pressed',
        'true',
        { timeout: 2000 },
      )
    }).toPass({ timeout: 15_000 })

    await page.reload()
    await expect(page.getByRole('button', { name: 'Khó', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
      { timeout: 15_000 },
    )
  })

  test('bảng điểm có ba tab', async ({ page }) => {
    await page.goto('/')

    await expect(async () => {
      await page.getByRole('button', { name: 'Bảng điểm', exact: true }).click({ timeout: 2000 })
      await expect(page.getByRole('tab')).toHaveCount(3, { timeout: 2000 })
    }).toPass({ timeout: 15_000 })
  })
})

test.describe('chế độ Tuỳ chỉnh — US-08', () => {
  test('bốn thanh trượt, vùng bấm không nhỏ hơn 44px — NFR-A11Y-03', async ({ page }) => {
    await page.goto('/')

    await expect(async () => {
      await page.getByRole('button', { name: 'Tuỳ chỉnh', exact: true }).click({ timeout: 2000 })
      await expect(page.getByRole('slider')).toHaveCount(4, { timeout: 2000 })
    }).toPass({ timeout: 15_000 })

    const sliders = page.getByRole('slider')
    for (let i = 0; i < 4; i++) {
      const box = await sliders.nth(i).boundingBox()
      expect(box, `thiếu thanh trượt thứ ${i + 1}`).not.toBeNull()
      expect(box!.height, 'thanh trượt quá thấp — NFR-A11Y-03').toBeGreaterThanOrEqual(44)
    }
  })

  test('vào ván từ màn Tuỳ chỉnh được', async ({ page }) => {
    await page.goto('/')

    await expect(async () => {
      await page.getByRole('button', { name: 'Tuỳ chỉnh', exact: true }).click({ timeout: 2000 })
      await expect(page.getByRole('slider')).toHaveCount(4, { timeout: 2000 })
    }).toPass({ timeout: 15_000 })

    await page.getByRole('button', { name: 'Chơi', exact: true }).click()
    await expect(page.getByRole('button', { name: 'Tạm dừng', exact: true })).toBeVisible({
      timeout: 5000,
    })
  })
})
