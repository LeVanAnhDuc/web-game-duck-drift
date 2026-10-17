import { test, expect } from "@/fixtures";
import type { Locator } from "@playwright/test";
import { copy } from "@/data/copy";

async function outlineOf(target: Locator): Promise<{ style: string; width: number }> {
  return target.evaluate((el) => {
    const s = getComputedStyle(el);
    return { style: s.outlineStyle, width: parseFloat(s.outlineWidth) };
  });
}

test("Tab đi qua các nút của menu theo thứ tự đọc", { tag: ["@TC-ACCESSIBILITY-001"] }, async ({ page, gamePage }) => {
  await gamePage.goto();
  const { menu } = gamePage;
  await expect(menu.play()).toBeFocused();
  for (const next of [menu.highScoresButton(), menu.helpButton(), menu.customButton()]) {
    await page.keyboard.press("Tab");
    await expect(next).toBeFocused();
  }
  for (const previous of [menu.helpButton(), menu.highScoresButton(), menu.play(), menu.preset("hard"), menu.preset("normal"), menu.preset("easy")]) {
    await page.keyboard.press("Shift+Tab");
    await expect(previous).toBeFocused();
  }
});

test("Space bấm nút đang có focus ở menu", { tag: ["@TC-ACCESSIBILITY-002", "@smoke"] }, async ({ page, gamePage }) => {
  await gamePage.goto();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await expect(gamePage.menu.helpButton()).toBeFocused();
  await page.keyboard.press("Space");
  await expect(gamePage.help.heading()).toBeVisible();
  await expect(gamePage.help.back()).toBeVisible();
});

test("Enter bấm nút đang có focus, kể cả để quay lại", { tag: ["@TC-ACCESSIBILITY-003"] }, async ({ page, gamePage }) => {
  await gamePage.goto();
  await page.keyboard.press("Tab");
  await expect(gamePage.menu.highScoresButton()).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(gamePage.highScores.heading()).toBeVisible();
  await expect(gamePage.highScores.back()).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(gamePage.menu.heading()).toBeVisible();
});

test("phần tử vừa Tab tới có viền focus nhìn thấy được", { tag: ["@TC-ACCESSIBILITY-004"] }, async ({ page, gamePage }) => {
  await gamePage.goto();
  await page.keyboard.press("Tab");
  const button = await outlineOf(gamePage.menu.highScoresButton());
  expect(button.style).not.toBe("none");
  expect(button.width).toBeGreaterThanOrEqual(2);

  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  await expect(gamePage.custom.heading()).toBeVisible();
  // The custom screen focuses Play on arrival; Shift+Tab walks back to the last slider.
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Shift+Tab");
  await expect(gamePage.custom.slider(copy.custom.ufoFirstWave)).toBeFocused();
  const slider = await outlineOf(gamePage.custom.slider(copy.custom.ufoFirstWave));
  expect(slider.style).not.toBe("none");
  expect(slider.width).toBeGreaterThanOrEqual(2);
});
