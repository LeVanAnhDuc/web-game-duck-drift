import { test, expect } from "@/fixtures";
import type { Locator, Page } from "@playwright/test";
import { copy } from "@/data/copy";
import { STORAGE, entry, fullTable } from "@/data/test-data";

const WIDTHS = [320, 375, 768, 1024, 1440];
const sizeOf = (width: number) => ({ width, height: width === 1440 ? 900 : 720 });

async function insideViewport(page: Page, target: Locator): Promise<boolean> {
  const box = (await target.boundingBox())!;
  const size = page.viewportSize()!;
  return box.x >= 0 && box.y >= 0 && box.x + box.width <= size.width + 0.5 && box.y + box.height <= size.height + 0.5;
}

test("không màn nào cuộn ngang, từ 320 tới 1440px", { tag: ["@TC-RESPONSIVE-001", "@smoke"] }, async ({ page, gamePage }) => {
  await gamePage.seedStorage({ [STORAGE.scores.normal]: fullTable() });
  for (const width of WIDTHS) {
    await page.setViewportSize(sizeOf(width));
    await gamePage.goto();
    expect(await gamePage.horizontalOverflow(), `${width} menu`).toBeLessThanOrEqual(0);
    await gamePage.menu.openHelp();
    expect(await gamePage.horizontalOverflow(), `${width} help`).toBeLessThanOrEqual(0);
    await gamePage.help.back().click();
    await gamePage.menu.openHighScores();
    expect(await gamePage.highScores.rows().count()).toBe(10);
    expect(await gamePage.horizontalOverflow(), `${width} high scores`).toBeLessThanOrEqual(0);
    await gamePage.highScores.back().click();
    await gamePage.menu.openCustom();
    expect(await gamePage.horizontalOverflow(), `${width} custom`).toBeLessThanOrEqual(0);
  }
});

test("trong ván, canvas và HUD nằm trọn trong khung nhìn ở mọi khổ", { tag: ["@TC-RESPONSIVE-002", "@smoke"] }, async ({ page, gamePage }) => {
  for (const width of WIDTHS) {
    await page.setViewportSize(sizeOf(width));
    await gamePage.goto();
    await gamePage.start();
    expect(await gamePage.horizontalOverflow(), `${width} in game`).toBeLessThanOrEqual(0);
    for (const part of [gamePage.canvas(), gamePage.hud.score(), gamePage.hud.wave(), gamePage.hud.pauseButton()]) {
      expect(await insideViewport(page, part), `${width}: ${part}`).toBe(true);
    }
  }
});

test("nút, nút chọn mức và thanh trượt cao ít nhất 44px ở 320 và 1440", { tag: ["@TC-RESPONSIVE-003"] }, async ({ page, gamePage }) => {
  for (const width of [320, 1440]) {
    await page.setViewportSize(sizeOf(width));
    await gamePage.goto();
    const { menu } = gamePage;
    const targets = [menu.play(), menu.highScoresButton(), menu.helpButton(), menu.customButton(), menu.preset("easy"), menu.preset("normal"), menu.preset("hard")];
    for (const target of targets) {
      expect((await target.boundingBox())!.height, `${width}: ${target}`).toBeGreaterThanOrEqual(44);
    }
    await menu.openCustom();
    for (const label of [copy.custom.startLives, copy.custom.asteroidSpeed, copy.custom.dropChance, copy.custom.ufoFirstWave]) {
      expect((await gamePage.custom.slider(label).boundingBox())!.height, `${width}: ${label}`).toBeGreaterThanOrEqual(44);
    }
  }
});

test("cột Ngày của bảng điểm ẩn dưới 640px, hiện từ 640px", { tag: ["@TC-RESPONSIVE-004"] }, async ({ page, gamePage }) => {
  await gamePage.seedStorage({ [STORAGE.scores.normal]: [entry("ANA", 1200)] });
  const [rank, name, score, wave, date] = copy.highScores.columns;
  for (const [width, columns] of [
    [375, [rank, name, score, wave]],
    [639, [rank, name, score, wave]],
    [640, [rank, name, score, wave, date]],
    [1024, [rank, name, score, wave, date]],
  ] as const) {
    await page.setViewportSize({ width, height: 720 });
    await gamePage.goto();
    await gamePage.menu.openHighScores();
    await expect(gamePage.highScores.columnHeaders(), `${width}`).toHaveText([...columns]);
  }
});

test("máy dùng chuột không thấy nút cảm ứng", { tag: ["@TC-RESPONSIVE-005"] }, async ({ page, gamePage }) => {
  for (const width of [375, 1440]) {
    await page.setViewportSize(sizeOf(width));
    await gamePage.goto();
    await gamePage.start();
    for (const button of gamePage.touch.all()) await expect(button, `${width}: ${button}`).toHaveCount(0);
  }
});
