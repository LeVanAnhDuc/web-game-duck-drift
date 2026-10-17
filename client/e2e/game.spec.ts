import { expect, test, type Page } from '@playwright/test'

/**
 * Luật chơi đã được 151 test đơn vị phủ bằng cách gọi thẳng `step()`. Ở đây chỉ
 * kiểm phần chỉ có nghĩa trong trình duyệt thật: đấu nối giữa React và vòng lặp,
 * bàn phím, và nút cảm ứng.
 *
 * Không assert vào con số điểm hay vị trí vật thể — đó là mô phỏng thời gian thực
 * chạy trên máy CI chia sẻ, và một test phụ thuộc vào nó sẽ đỏ vì máy bận chứ
 * không phải vì game sai.
 */

/** Một cú bấm rơi vào lúc React chưa hydrate thì mất hẳn — không có listener nào. */
async function startGame(page: Page) {
  await expect(async () => {
    await page.getByRole('button', { name: 'Chơi', exact: true }).click({ timeout: 2000 })
    await expect(page.getByRole('button', { name: 'Tạm dừng', exact: true })).toBeVisible({ timeout: 2000 })
  }).toPass({ timeout: 15_000 })
}

test.describe('bắt đầu một ván', () => {
  test('bấm Chơi thì vào thẳng ván, không có màn chờ', async ({ page }) => {
    await page.goto('/')
    await startGame(page)

    await expect(page.getByRole('heading', { name: 'DUCK DRIFT', exact: true })).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Tạm dừng', exact: true })).toBeVisible()
  })

  test('HUD hiện wave và điểm ngay từ đầu', async ({ page }) => {
    await page.goto('/')
    await startGame(page)

    await expect(page.getByTestId('hud-wave')).toBeVisible()
    await expect(page.getByTestId('hud-score')).toBeVisible()
  })

  test('vòng lặp thật sự chạy — wave 1 được sinh ra', async ({ page }) => {
    await page.goto('/')
    await startGame(page)

    // `wave` chỉ nhảy lên 1 khi `step()` đã chạy ít nhất một lần và sinh wave.
    await expect(page.getByTestId('hud-wave')).toHaveText('Wave 1', { timeout: 5000 })
  })
})

test.describe('tạm dừng — US-04', () => {
  test('Esc mở overlay, Tiếp tục đóng nó', async ({ page }) => {
    await page.goto('/')
    await startGame(page)

    await page.keyboard.press('Escape')
    await expect(page.getByText('TẠM DỪNG')).toBeVisible()

    await page.getByRole('button', { name: 'Tiếp tục', exact: true }).click()
    await expect(page.getByText('TẠM DỪNG')).toHaveCount(0)
  })

  test('nút tạm dừng trên HUD làm đúng việc đó', async ({ page }) => {
    await page.goto('/')
    await startGame(page)

    await page.getByRole('button', { name: 'Tạm dừng', exact: true }).click()
    await expect(page.getByText('TẠM DỪNG')).toBeVisible()
  })

  test('Về menu bỏ ván đang chơi', async ({ page }) => {
    await page.goto('/')
    await startGame(page)

    await page.keyboard.press('Escape')
    await page.getByRole('button', { name: 'Về menu', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'DUCK DRIFT', exact: true })).toBeVisible()
  })

  test('chuyển sang tab khác thì tự tạm dừng — FR-15', async ({ page }) => {
    await page.goto('/')
    await startGame(page)

    // Cách duy nhất bắt chước được việc tab bị ẩn mà không đóng trang.
    await page.evaluate(() => {
      Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true })
      document.dispatchEvent(new Event('visibilitychange'))
    })

    await expect(page.getByText('TẠM DỪNG')).toBeVisible()
  })
})

test.describe('bàn phím — FR-14', () => {
  test('phím game không cuộn trang', async ({ page }) => {
    await page.goto('/')
    await startGame(page)

    for (const key of ['ArrowUp', 'ArrowDown', 'Space']) {
      await page.keyboard.press(key)
    }
    expect(await page.evaluate(() => window.scrollY)).toBe(0)
  })

  test('vùng aria-live tồn tại để công bố diễn biến — NFR-A11Y-06', async ({ page }) => {
    await page.goto('/')
    await startGame(page)

    await expect(page.locator('[aria-live="polite"]')).toHaveCount(1)
  })
})

test.describe('nút cảm ứng — US-03', () => {
  test('chỉ xuất hiện trên thiết bị cảm ứng', async ({ page }, testInfo) => {
    await page.goto('/')
    await startGame(page)

    const fire = page.getByRole('button', { name: 'Bắn', exact: true })
    if (testInfo.project.name === 'touch-phone') {
      await expect(fire).toBeVisible()
    } else {
      await expect(fire).toHaveCount(0)
    }
  })

  test('năm nút, không nút nào nhỏ hơn 44px — NFR-A11Y-03', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'touch-phone', 'chỉ có nghĩa trên màn cảm ứng')

    await page.goto('/')
    await startGame(page)

    for (const name of ['Xoay trái', 'Xoay phải', 'Đẩy', 'Bắn', 'Dịch chuyển']) {
      const box = await page.getByRole('button', { name, exact: true }).boundingBox()
      expect(box, `thiếu nút ${name}`).not.toBeNull()
      expect(box!.width, `${name} quá hẹp`).toBeGreaterThanOrEqual(44)
      expect(box!.height, `${name} quá thấp`).toBeGreaterThanOrEqual(44)
    }
  })

  test('nút cảm ứng không làm trang cuộn hay phóng to khi chạm', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'touch-phone', 'chỉ có nghĩa trên màn cảm ứng')

    await page.goto('/')
    await startGame(page)

    const thrust = page.getByRole('button', { name: 'Đẩy', exact: true })
    await thrust.dispatchEvent('pointerdown', { pointerId: 1, isPrimary: true })
    await thrust.dispatchEvent('pointerup', { pointerId: 1, isPrimary: true })

    expect(await page.evaluate(() => window.scrollY)).toBe(0)
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(0)
  })
})
