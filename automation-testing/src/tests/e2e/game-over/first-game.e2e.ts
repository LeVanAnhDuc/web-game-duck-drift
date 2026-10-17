import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

/**
 * Ba lỗi của UX review 2026-09-11, kiểm ở đúng chỗ mà test đơn vị không tới được.
 *
 * - **F-01** cần trình duyệt thật vì lỗi nằm ở vòng đời render của React: hạng được
 *   giữ trong `useRef` rồi đọc lúc render nên ván ĐẦU TIÊN sau khi tải trang luôn
 *   hiện "Không lọt bảng". Test đơn vị trên ghost không bắt được — ghost vẫn đúng.
 * - **F-09 / F-06** cần trình duyệt thật vì `preventDefault` từ listener ở `window`
 *   chỉ huỷ được hành vi mặc định khi có một phần tử thật đang giữ tiêu điểm.
 * - **NFR-A11Y-02** (`Space` bấm nút) cùng lý do.
 *
 * Mọi test dưới đây tự xoá `localStorage` trước khi chạy. Chính việc KHÔNG xoá nó
 * giữa các phiên đã làm hỏng một phần lần chạy persona sinh ra các phát hiện này.
 */

/**
 * Chỉ chạy ở MỘT project. Đây là test hành vi, không phải test bố cục — `layout.spec.ts`
 * mới là chỗ sở hữu các khổ 375/768/1024/1440. Hai test "hết lượt" dưới đây phải chờ
 * ~22 giây mô phỏng thật mỗi cái; nhân năm project thì chúng chiếm hết worker và làm
 * `game.spec.ts` hết giờ ở `toPass` — đo được: cùng spec đó chạy `--workers=1` thì
 * 10/10 xanh trong 22 giây, chạy chung cả suite thì đỏ ngẫu nhiên một test.
 */
test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== 'app', 'test hành vi, chạy một khổ là đủ')
})

/** Vào trang với storage sạch, đã hydrate. */
async function freshPage(page: Page) {
  await page.goto('./')
  await page.evaluate(() => {
    try {
      localStorage.clear()
    } catch {
      // Chế độ riêng tư chặn storage — NFR-ROB-02 nói game vẫn phải chạy.
    }
  })
  await page.reload()
  // Bấm được nghĩa là đã hydrate; trước đó cú bấm mất hẳn.
  await expect(async () => {
    await page.getByRole('button', { name: 'Cách chơi' }).focus({ timeout: 2000 })
  }).toPass({ timeout: 15_000 })
}

test.describe('bàn phím không chiếm phím ngoài pha chơi — ADR-0015', () => {
  test('Space bấm được nút đang có tiêu điểm — NFR-A11Y-02', async ({ page }) => {
    await freshPage(page)

    await page.getByRole('button', { name: 'Cách chơi' }).focus()
    await page.keyboard.press('Space')

    // Space phải kích hoạt nút, tức màn Cách chơi mở ra.
    await expect(page.getByRole('button', { name: 'Quay lại' })).toBeVisible()
  })

  test('mũi tên đổi được giá trị cả bốn thanh trượt ở màn Tuỳ chỉnh', async ({ page }) => {
    await freshPage(page)
    await page.getByRole('button', { name: 'Tuỳ chỉnh' }).click()

    const ids = ['tuning-startLives', 'tuning-asteroidSpeed', 'tuning-dropChance', 'tuning-ufoFirstWave']
    for (const id of ids) {
      const slider = page.locator(`#${id}`)
      await slider.focus()
      const before = await slider.inputValue()
      // Đi về min trước để chắc chắn còn chỗ tăng, rồi mới thử mũi tên.
      await page.keyboard.press('Home')
      const atMin = await slider.inputValue()
      await page.keyboard.press('ArrowRight')
      const afterArrow = await slider.inputValue()

      expect(afterArrow, `${id}: mũi tên phải đổi được giá trị (trước: ${before})`).not.toBe(atMin)
    }
  })

  test('kéo UFO từ wave tới mốc "tắt" chỉ bằng bàn phím — phần thật của F-06', async ({ page }) => {
    await freshPage(page)
    await page.getByRole('button', { name: 'Tuỳ chỉnh' }).click()

    const slider = page.locator('#tuning-ufoFirstWave')
    await slider.focus()
    await page.keyboard.press('End')

    await expect(slider).toHaveAttribute('aria-valuetext', 'tắt')
    await expect(page.getByText('tắt', { exact: true })).toBeVisible()
  })

  test('trong lúc chơi thì mũi tên và Space vẫn của tàu, và không cuộn trang', async ({ page }) => {
    await freshPage(page)
    await page.getByRole('button', { name: 'Chơi', exact: true }).click()
    await expect(page.getByRole('button', { name: 'Tạm dừng' })).toBeVisible()

    const scrollBefore = await page.evaluate(() => window.scrollY)
    const prevented = await page.evaluate(() => {
      const ev = new KeyboardEvent('keydown', { code: 'Space', bubbles: true, cancelable: true })
      window.dispatchEvent(ev)
      return ev.defaultPrevented
    })

    expect(prevented, 'ở pha chơi, Space vẫn phải thuộc về game').toBe(true)
    expect(await page.evaluate(() => window.scrollY)).toBe(scrollBefore)
  })
})

test.describe('màn Hết lượt báo đúng số — ADR-0016 · ADR-0017', () => {
  // MỘT test cho cả hai điều phải kiểm, cố ý. Tới được màn Hết lượt tốn ~22 giây mô
  // phỏng thật và không rút ngắn được (nhịp game là cố định — ADR-0003). Tách thành
  // hai test là trả cái giá đó hai lần, và đo được là nó làm `game.spec.ts` đỏ ngẫu
  // nhiên vì các worker khác bị đói CPU. Hai `expect` dưới đây nói hai chuyện khác
  // nhau, nên nếu đỏ thì thông báo vẫn chỉ đúng một chỗ.
  test('ván ĐẦU TIÊN sau khi tải trang: có hạng, có form, và câu đọc lên khớp panel', async ({ page }) => {
    await freshPage(page)

    // Mức Khó: ít mạng nhất nên tới màn Hết lượt nhanh nhất. Ngồi yên không bấm gì —
    // đúng cách persona tới được đó, và cũng là điều người mới hoảng hốt hay làm.
    await page.getByRole('button', { name: 'Khó', exact: true }).click()
    await page.getByRole('button', { name: 'Chơi', exact: true }).click()

    await expect(page.getByRole('heading', { name: 'HẾT LƯỢT' })).toBeVisible({ timeout: 60_000 })

    // F-01 — bảng mức Khó đang trống và điểm là số dương, nên phải lọt bảng. Trước khi
    // sửa, ván đầu tiên sau khi tải trang luôn hiện "Không lọt bảng".
    await expect(page.getByText('Không lọt bảng')).toHaveCount(0)
    await expect(page.getByRole('group', { name: 'Tên của bạn' })).toBeVisible()

    // NFR-A11Y-06 — câu đọc lên và số nhìn thấy phải là cùng một số. Trước khi sửa:
    // vùng aria-live nói 20, panel nói 40.
    const announced = (await page.locator('[aria-live]').first().textContent()) ?? ''
    const match = announced.match(/Tổng điểm (\d+)/)
    expect(match, `vùng aria-live phải công bố hết lượt, đọc được: "${announced}"`).not.toBeNull()

    // Số trên panel Hết lượt, lấy từ ô ngay dưới nhãn "Điểm".
    const panelScore = await page
      .locator('text=HẾT LƯỢT')
      .locator('..')
      .getByText(/^\d+$/)
      .first()
      .textContent()

    expect(match?.[1], 'câu đọc lên phải khớp số trên panel').toBe(panelScore?.trim())
  })
})
