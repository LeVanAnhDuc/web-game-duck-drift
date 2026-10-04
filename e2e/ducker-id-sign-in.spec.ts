import { expect, test, type Page } from '@playwright/test'
import { vi } from '../src/i18n/vi'

/**
 * Chỉ chạy ở project `auth-*` (bản build BẬT cờ, issuer giả `http://ducker.test`).
 * Mọi request tới issuer đều bị `page.route` chặn lại — không có mạng thật nào.
 */
const ISSUER = 'http://ducker.test'
const CORS = { 'access-control-allow-origin': '*' }

/**
 * HTML tĩnh đã có nút Đăng nhập trước khi JS nạp (snapshot idle của server), nên một cú
 * bấm quá sớm có thể rơi vào nút chưa hydrate. Thử lại cho tới khi tài khoản hiện ra.
 */
async function signInWhenReady(page: Page) {
  const signIn = page.getByRole('button', { name: vi.account.signIn })
  const account = page.getByRole('button', { name: vi.account.menuLabel })
  await expect(async () => {
    if (await signIn.isVisible()) await signIn.click({ timeout: 2000 })
    await expect(account).toBeVisible({ timeout: 3000 })
  }).toPass({ timeout: 20_000 })
}

test.beforeEach(async ({ page }) => {
  await page.route(`${ISSUER}/oauth/authorize**`, async (route) => {
    const url = new URL(route.request().url())
    const back = new URL(url.searchParams.get('redirect_uri')!)
    back.searchParams.set('code', 'code-1')
    back.searchParams.set('state', url.searchParams.get('state')!)
    await route.fulfill({ status: 302, headers: { location: back.toString() } })
  })
  await page.route(`${ISSUER}/oauth/token`, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: CORS,
      body: JSON.stringify({ access_token: 'at-1', token_type: 'Bearer', expires_in: 900 }),
    }),
  )
  await page.route(`${ISSUER}/oauth/userinfo`, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: CORS,
      body: JSON.stringify({ sub: 'u1', name: 'Lê Văn Anh Đức', email: 'duc@ducker.id' }),
    }),
  )
})

test('đăng nhập, hiện tên, URL sạch, đăng xuất', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  await page.goto('/')
  await signInWhenReady(page)
  const account = page.getByRole('button', { name: vi.account.menuLabel })
  // Next ghi URL hydrate (còn ?code&state) lại vào history; settleCallbackUrl phải dọn lại.
  await expect.poll(() => new URL(page.url()).search).not.toMatch(/code=|state=/)
  expect(await page.evaluate(() => sessionStorage.getItem('ducker.pkce'))).toBeNull()

  await account.click()
  await expect(page.getByText('Lê Văn Anh Đức')).toBeVisible()
  await expect(page.getByRole('menuitem', { name: vi.account.openProfile })).toHaveAttribute(
    'href',
    `${ISSUER}/profile`,
  )
  await page.getByRole('menuitem', { name: vi.account.signOut }).click()
  const signIn = page.getByRole('button', { name: vi.account.signIn })
  await expect(signIn).toBeVisible()
  await expect(signIn).toBeFocused()
  expect(errors.filter((text) => /hydrat/i.test(text))).toEqual([])
})

test('tải lại thì về trạng thái chưa đăng nhập (không lưu gì)', async ({ page }) => {
  await page.goto('/')
  await signInWhenReady(page)
  await page.reload()
  await expect(page.getByRole('button', { name: vi.account.signIn })).toBeVisible()
})

test('huỷ ở Ducker ID (error=access_denied) thì vẫn chưa đăng nhập và URL sạch', async ({ page }) => {
  await page.goto('/?error=access_denied&error_description=no&state=x')
  await expect(page.getByRole('button', { name: vi.account.signIn })).toBeVisible()
  await expect.poll(() => new URL(page.url()).search).toBe('')
})

test('state bị sửa thì không đổi code và URL sạch', async ({ page }) => {
  let tokenCalls = 0
  await page.route(`${ISSUER}/oauth/token`, (route) => {
    tokenCalls += 1
    return route.abort()
  })
  await page.goto('/?code=code-1&state=tampered')
  await expect(page.getByRole('button', { name: vi.account.signIn })).toBeVisible()
  await expect.poll(() => new URL(page.url()).search).toBe('')
  expect(tokenCalls).toBe(0)
})

test('nút đăng nhập đủ 44px và không đè lên nút/chữ bên cạnh', async ({ page }) => {
  await page.goto('/')
  const button = await page.getByRole('button', { name: vi.account.signIn }).boundingBox()
  expect(button!.width).toBeGreaterThanOrEqual(44)
  expect(button!.height).toBeGreaterThanOrEqual(44)
  const neighbours = [
    page.getByRole('button', { name: 'Tuỳ chỉnh', exact: true }),
    page.getByText(vi.menu.localNote, { exact: true }),
  ]
  for (const neighbour of neighbours) {
    const box = (await neighbour.boundingBox())!
    const overlaps =
      button!.x < box.x + box.width &&
      box.x < button!.x + button!.width &&
      button!.y < box.y + box.height &&
      box.y < button!.y + button!.height
    expect(overlaps).toBe(false)
  }
})

type Box = { x: number; y: number; width: number; height: number }

const inside = (box: Box, page: Page) => {
  const size = page.viewportSize()!
  return box.x >= 0 && box.y >= 0 && box.x + box.width <= size.width && box.y + box.height <= size.height
}

test('mở menu tài khoản: không đẩy bố cục, menu nằm trọn trong khung nhìn', async ({ page }) => {
  await page.goto('/')
  await signInWhenReady(page)
  const trigger = page.getByRole('button', { name: vi.account.menuLabel })
  const container = trigger.locator('xpath=..')
  const before = (await container.boundingBox())!
  const screenBefore = (await page.getByRole('button', { name: 'Chơi', exact: true }).boundingBox())!

  await trigger.click()
  const menu = page.getByRole('menu')
  await expect(menu).toBeVisible()
  // Kiểm position tính toán, không chỉ danh sách class: `.panel { position: relative }` từng thắng `absolute`.
  expect(await menu.evaluate((el) => getComputedStyle(el).position)).toBe('absolute')
  const after = (await container.boundingBox())!
  const screenAfter = (await page.getByRole('button', { name: 'Chơi', exact: true }).boundingBox())!
  expect(after).toEqual(before)
  expect(screenAfter).toEqual(screenBefore)
  const box = (await menu.boundingBox())!
  expect(inside(box, page)).toBe(true)
  console.log(
    `MEASURED ${JSON.stringify(page.viewportSize())} container=${JSON.stringify(before)} menu=${JSON.stringify(box)}`,
  )
})

test('cột menu: 375x667 không cuộn; ngang 667x375 cuộn được, không cắt tiêu đề và với tới nút tài khoản', async ({
  page,
}) => {
  for (const size of [
    { width: 375, height: 667 },
    { width: 667, height: 375 },
  ]) {
    await page.setViewportSize(size)
    await page.goto('/')
    await signInWhenReady(page)
    const main = page.locator('main')
    const title = (await page.getByRole('heading', { name: 'DUCK DRIFT', exact: true }).boundingBox())!
    const overflow = await main.evaluate((el) => {
      const column = el.querySelector('h1')!.parentElement!
      return column.scrollHeight - column.clientHeight
    })
    console.log(`MEASURED column ${size.width}x${size.height} title.y=${title.y} column overflow=${overflow}`)
    // Tiêu đề không bao giờ bị cắt ở phía trên (trước đây -51.75 ở 667x375).
    expect(title.y).toBeGreaterThanOrEqual(0)
    if (size.height >= 600) expect(overflow).toBeLessThanOrEqual(0)

    const account = page.getByRole('button', { name: vi.account.menuLabel })
    await account.scrollIntoViewIfNeeded()
    const box = (await account.boundingBox())!
    console.log(`MEASURED account after scroll ${JSON.stringify(box)}`)
    expect(inside(box, page)).toBe(true)
  }
})
