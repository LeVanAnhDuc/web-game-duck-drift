import { test, expect } from "@/fixtures";
import type { Page } from "@playwright/test";
import { copy } from "@/data/copy";
import { DUCKER, PRESET_LIVES } from "@/data/test-data";
import type { GamePage } from "@/pages/game.page";

// FR-23 · US-09 · ADR-0021. Runs on the "app-auth" project: the flag-on export built by
// `node scripts/build-e2e.mjs auth` against the fake issuer http://ducker.test, served on :4312.

type Box = { x: number; y: number; width: number; height: number };

const search = (page: Page) => page.evaluate(() => window.location.search);
const inside = (box: Box, page: Page) => {
  const size = page.viewportSize()!;
  return box.x >= 0 && box.y >= 0 && box.x + box.width <= size.width && box.y + box.height <= size.height;
};
const overlaps = (a: Box, b: Box) => a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;

async function signIn(gamePage: GamePage): Promise<void> {
  await gamePage.goto();
  await gamePage.account.signIn().click();
  await expect(gamePage.account.trigger()).toBeVisible();
}

test("đăng nhập: thấy tài khoản, URL sạch, không còn khoá PKCE, không lỗi hydration", { tag: ["@TC-DUCKERID-003", "@smoke"] }, async ({
  page,
  gamePage,
  fakeIssuer,
}) => {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await fakeIssuer();
  await signIn(gamePage);
  // Next writes its hydration URL (still holding ?code&state) back into history; the clean URL has to win and stay.
  await expect.poll(() => search(page)).not.toMatch(/code=|state=/);
  expect(await page.evaluate((key) => sessionStorage.getItem(key), DUCKER.pkceKey)).toBeNull();
  expect(errors.filter((e) => /hydrat/i.test(e))).toEqual([]);
});

test("menu tài khoản: tên, email, hồ sơ, đăng xuất; điều khiển được bằng bàn phím", { tag: ["@TC-DUCKERID-004"] }, async ({ page, gamePage, fakeIssuer }) => {
  await fakeIssuer();
  await signIn(gamePage);
  const { account } = gamePage;
  await account.trigger().click();
  await expect(account.menu()).toContainText(DUCKER.user.name);
  await expect(account.menu()).toContainText(DUCKER.user.email);
  await expect(account.profileLink()).toHaveAttribute("href", `${DUCKER.issuer}${DUCKER.profilePath}`);
  await expect(account.profileLink()).toHaveAttribute("target", "_blank");

  await expect(account.profileLink()).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(account.signOut()).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(account.profileLink()).toBeFocused();
  await page.keyboard.press("ArrowUp");
  await expect(account.signOut()).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(account.menu()).toHaveCount(0);
  await expect(account.trigger()).toBeFocused();
});

test("đăng xuất trả lại nút Đăng nhập và đặt focus vào nó", { tag: ["@TC-DUCKERID-005"] }, async ({ gamePage, fakeIssuer }) => {
  await fakeIssuer();
  await signIn(gamePage);
  await gamePage.account.trigger().click();
  await gamePage.account.signOut().click();
  await expect(gamePage.account.signIn()).toBeVisible();
  await expect(gamePage.account.signIn()).toBeFocused();
});

test("hồ sơ chỉ trong bộ nhớ: storage không giữ gì, tải lại là chưa đăng nhập", { tag: ["@TC-DUCKERID-006", "@smoke"] }, async ({
  page,
  gamePage,
  fakeIssuer,
}) => {
  await fakeIssuer();
  await signIn(gamePage);
  const stored = await page.evaluate(() => JSON.stringify({ ...localStorage }) + JSON.stringify({ ...sessionStorage }));
  expect(stored).not.toContain(DUCKER.user.email);
  expect(stored).not.toContain(DUCKER.user.name);
  await gamePage.reload();
  await expect(gamePage.account.signIn()).toBeVisible();
});

test("huỷ ở Ducker ID thì về chưa đăng nhập, URL sạch", { tag: ["@TC-DUCKERID-007"] }, async ({ page, gamePage, fakeIssuer }) => {
  await fakeIssuer("deny");
  await gamePage.goto();
  await gamePage.account.signIn().click();
  await expect(gamePage.account.signIn()).toBeVisible();
  await expect.poll(() => search(page)).toBe("");
  await expect(gamePage.account.trigger()).toHaveCount(0);

  await gamePage.goto("error=access_denied&error_description=no&state=x");
  await expect(gamePage.account.signIn()).toBeVisible();
  await expect.poll(() => search(page)).toBe("");
});

test("state bị sửa thì về chưa đăng nhập và không gọi token", { tag: ["@TC-DUCKERID-008", "@smoke"] }, async ({ page, gamePage, fakeIssuer }) => {
  const issuer = await fakeIssuer("tamper");
  await gamePage.goto();
  await gamePage.account.signIn().click();
  await expect.poll(() => issuer.authorizeCalls()).toBe(1);
  await expect(gamePage.account.signIn()).toBeVisible();
  await expect.poll(() => search(page)).not.toMatch(/code=|state=/);
  expect(issuer.tokenCalls()).toBe(0);
});

test("Ducker ID không trả lời thì sau tối đa 15 giây về chưa đăng nhập", { tag: ["@TC-DUCKERID-009"] }, async ({ page, gamePage, fakeIssuer }) => {
  // AbortSignal.timeout(15s) is a native timer that page.clock cannot fast-forward: this one waits for real.
  test.setTimeout(45_000);
  const issuer = await fakeIssuer("hang");
  await gamePage.goto();
  await gamePage.account.signIn().click();
  await expect.poll(() => issuer.tokenCalls()).toBe(1);
  await expect(gamePage.account.signIn()).toBeVisible({ timeout: 20_000 });
  await expect.poll(() => search(page)).not.toMatch(/code=|state=/);
});

test("bấm Đăng nhập hai lần liên tiếp chỉ chuyển trang một lần", { tag: ["@TC-DUCKERID-010"] }, async ({ gamePage, fakeIssuer }) => {
  const issuer = await fakeIssuer();
  await gamePage.goto();
  await gamePage.account.signIn().dblclick();
  await expect(gamePage.account.trigger()).toBeVisible();
  expect(issuer.authorizeCalls()).toBe(1);
});

test("sessionStorage bị chặn thì bấm Đăng nhập không đưa đi đâu cả", { tag: ["@TC-DUCKERID-011"] }, async ({ page, gamePage, fakeIssuer }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "sessionStorage", {
      configurable: true,
      get() {
        throw new DOMException("The operation is insecure.", "SecurityError");
      },
    });
  });
  const issuer = await fakeIssuer();
  await gamePage.goto();
  await gamePage.account.signIn().click();
  await expect(gamePage.account.signIn()).toBeEnabled();
  await expect(gamePage.account.signIn()).toHaveAccessibleName(copy.account.signIn);
  await expect(gamePage.menu.heading()).toBeVisible();
  expect(issuer.authorizeCalls()).toBe(0);
});

test("nút Đăng nhập dưới dòng \"chỉ lưu trên máy\", ≥ 44px, không đè thứ bên cạnh", { tag: ["@TC-DUCKERID-012"] }, async ({ gamePage, fakeIssuer }) => {
  await fakeIssuer();
  await gamePage.goto();
  const button = (await gamePage.account.signIn().boundingBox())!;
  expect(button.width).toBeGreaterThanOrEqual(44);
  expect(button.height).toBeGreaterThanOrEqual(44);
  const note = (await gamePage.menu.localNote().boundingBox())!;
  expect(button.y).toBeGreaterThanOrEqual(note.y + note.height);
  for (const neighbour of [note, (await gamePage.menu.customButton().boundingBox())!]) {
    expect(overlaps(button, neighbour)).toBe(false);
  }
});

test("menu tài khoản không đẩy bố cục và nằm trọn trong khung nhìn ở 320, 375, 1440", { tag: ["@TC-DUCKERID-013"] }, async ({ page, gamePage, fakeIssuer }) => {
  await fakeIssuer();
  for (const size of [
    { width: 320, height: 640 },
    { width: 375, height: 720 },
    { width: 1440, height: 900 },
  ]) {
    await page.setViewportSize(size);
    await signIn(gamePage);
    const { account } = gamePage;
    const holder = account.trigger().locator("xpath=..");
    const before = (await holder.boundingBox())!;
    const playBefore = (await gamePage.menu.play().boundingBox())!;
    await account.trigger().click();
    await expect(account.menu()).toBeVisible();
    // Computed position, not the class list: `.panel { position: relative }` once won over `absolute`.
    expect(await account.menu().evaluate((el) => getComputedStyle(el).position), `${size.width}`).toBe("absolute");
    expect(await holder.boundingBox(), `${size.width}`).toEqual(before);
    expect(await gamePage.menu.play().boundingBox(), `${size.width}`).toEqual(playBefore);
    expect(inside((await account.menu().boundingBox())!, page), `${size.width}`).toBe(true);
  }
});

test("điện thoại: dọc không cuộn, ngang cuộn được mà không cắt tiêu đề", { tag: ["@TC-DUCKERID-014"] }, async ({ page, gamePage, fakeIssuer }) => {
  await fakeIssuer();
  for (const size of [
    { width: 375, height: 667 },
    { width: 667, height: 375 },
  ]) {
    await page.setViewportSize(size);
    await signIn(gamePage);
    const column = gamePage.menu.column();
    const overflow = await column.evaluate((el) => el.scrollHeight - el.clientHeight);
    if (size.height >= 600) expect(overflow, "portrait column fits").toBeLessThanOrEqual(0);
    expect((await gamePage.menu.heading().boundingBox())!.y, `${size.width}x${size.height} title`).toBeGreaterThanOrEqual(0);
    await gamePage.account.trigger().scrollIntoViewIfNeeded();
    expect(inside((await gamePage.account.trigger().boundingBox())!, page), `${size.width}x${size.height} account`).toBe(true);
  }
});

test("đã đăng nhập vẫn vào ván như thường", { tag: ["@TC-DUCKERID-015"] }, async ({ gamePage, fakeIssuer }) => {
  await fakeIssuer();
  await signIn(gamePage);
  await gamePage.start();
  await expect(gamePage.hud.livesGroup()).toHaveAttribute("aria-label", `${copy.hud.lives}: ${PRESET_LIVES.normal}`);
});
