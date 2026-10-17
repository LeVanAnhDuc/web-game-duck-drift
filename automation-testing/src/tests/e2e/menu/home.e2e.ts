import { test, expect } from "@/fixtures";
import { copy } from "@/data/copy";
import { STORAGE, entry } from "@/data/test-data";

test("mở trang thấy tên game, dãy độ khó và bốn lối vào", { tag: ["@TC-MENU-001", "@smoke"] }, async ({ page, gamePage }) => {
  await gamePage.goto();
  const { menu } = gamePage;
  await expect(menu.heading()).toBeVisible();
  await expect(menu.difficultyGroup()).toBeVisible();
  for (const button of [menu.play(), menu.highScoresButton(), menu.helpButton(), menu.customButton()]) {
    await expect(button).toBeVisible();
  }
  await expect(page).toHaveTitle(copy.appName);
});

test("nút Chơi có focus sẵn, Enter vào ván", { tag: ["@TC-MENU-002"] }, async ({ page, gamePage }) => {
  await gamePage.goto();
  await expect(gamePage.menu.play()).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(gamePage.hud.pauseButton()).toBeVisible();
  await expect(gamePage.menu.heading()).toHaveCount(0);
});

test("máy chưa chơi bao giờ: dòng điểm nói chưa có điểm, và của mức nào", { tag: ["@TC-MENU-003"] }, async ({ gamePage }) => {
  await gamePage.goto();
  await expect(gamePage.menu.bestLine()).toHaveText(copy.menu.noBestOf(copy.difficulty.normal));
});

test("có điểm: dòng điểm nêu mức và điểm cao nhất của bảng mức đó", { tag: ["@TC-MENU-004"] }, async ({ gamePage }) => {
  await gamePage.seedStorage({ [STORAGE.scores.normal]: [entry("BOB", 300), entry("ANA", 1250)] });
  await expect(gamePage.menu.bestLine()).toHaveText(copy.menu.bestOf(copy.difficulty.normal, "1.250"));
});

test("menu nói điểm chỉ lưu trên máy này", { tag: ["@TC-MENU-005"] }, async ({ gamePage }) => {
  await gamePage.goto();
  await expect(gamePage.menu.localNote()).toBeVisible();
});
