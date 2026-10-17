import { test, expect } from "@/fixtures";
import type { GamePage } from "@/pages/game.page";
import { copy } from "@/data/copy";
import { STORAGE } from "@/data/test-data";

/** From the menu: Hard, Play, nothing until the end, save, then the score table. Needs page.clock installed. */
async function oneRound(gamePage: GamePage): Promise<void> {
  await gamePage.menu.choose("hard");
  await gamePage.start();
  await gamePage.runUntilGameOver();
  await gamePage.gameOver.save().click();
  await expect(gamePage.highScores.heading()).toBeVisible();
  await expect(gamePage.highScores.rows()).toHaveCount(1);
}

test("cả một ván không có request nào ra ngoài origin", { tag: ["@TC-PRIVACY-001", "@smoke"] }, async ({ page, gamePage, baseURL }) => {
  const origin = new URL(baseURL!).origin;
  const outside: string[] = [];
  page.on("request", (r) => {
    if (new URL(r.url()).origin !== origin) outside.push(r.url());
  });
  await page.clock.install();
  await gamePage.goto();
  await oneRound(gamePage);
  expect(outside).toEqual([]);
});

test("mất mạng sau khi tải xong vẫn chơi tới hết lượt và lưu điểm được", { tag: ["@TC-PRIVACY-002"] }, async ({ page, context, gamePage }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.clock.install();
  await gamePage.goto();
  await page.waitForLoadState("networkidle");
  await context.setOffline(true);
  await oneRound(gamePage);
  expect(errors).toEqual([]);
});

test("không cookie, không sessionStorage", { tag: ["@TC-PRIVACY-003"] }, async ({ page, context, gamePage }) => {
  await page.clock.install();
  await gamePage.goto();
  await oneRound(gamePage);
  expect(await context.cookies()).toEqual([]);
  expect(await page.evaluate(() => sessionStorage.length)).toBe(0);
});

test("localStorage chỉ có khoá của game", { tag: ["@TC-PRIVACY-004"] }, async ({ page, gamePage }) => {
  await page.clock.install();
  await gamePage.goto();
  await gamePage.menu.openCustom();
  await gamePage.custom.press(copy.custom.startLives, "ArrowRight");
  await gamePage.custom.back().click();
  await oneRound(gamePage);
  const keys = await page.evaluate(() => Object.keys(localStorage).sort());
  for (const key of keys) expect(key).toMatch(/^asteroids\./);
  expect(keys).toEqual([STORAGE.scores.hard, STORAGE.difficulty, STORAGE.tuning].sort());
});

test("console không có lỗi suốt một vòng chơi đầy đủ", { tag: ["@TC-PRIVACY-005"] }, async ({ page, gamePage }) => {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(e.message));
  await page.clock.install();
  await gamePage.goto();
  await gamePage.menu.openHelp();
  await gamePage.help.back().click();
  await gamePage.menu.openCustom();
  await gamePage.custom.back().click();
  await oneRound(gamePage);
  expect(errors).toEqual([]);
});
