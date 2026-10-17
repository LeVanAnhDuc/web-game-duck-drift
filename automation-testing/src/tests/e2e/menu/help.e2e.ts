import { test, expect } from "@/fixtures";
import { copy } from "@/data/copy";

test.beforeEach(async ({ gamePage }) => {
  await gamePage.goto();
  await gamePage.menu.openHelp();
});

test("Cách chơi liệt kê phím của năm hành động", { tag: ["@TC-MENU-006"] }, async ({ gamePage }) => {
  for (const [action, keys] of copy.help.keyboard) {
    await expect(gamePage.help.definition(action)).toHaveText(keys);
  }
});

test("Cách chơi nêu cách tính điểm và năm vật phẩm có tên, mô tả, hình", { tag: ["@TC-MENU-007"] }, async ({ page, gamePage }) => {
  for (const [what, points] of copy.help.scoring) {
    await expect(gamePage.help.definition(what)).toHaveText(points);
  }
  await expect(page.getByText(copy.help.extraLife, { exact: true })).toBeVisible();
  for (const [name, desc] of copy.powerUps) {
    const item = gamePage.help.powerUp(name);
    await expect(item.getByText(name, { exact: true })).toBeVisible();
    await expect(item.getByText(desc, { exact: true })).toBeVisible();
    await expect(item.locator("svg")).toHaveCount(1);
  }
});

test("Quay lại từ Cách chơi về màn hình chính", { tag: ["@TC-MENU-008"] }, async ({ gamePage }) => {
  await gamePage.help.back().click();
  await expect(gamePage.menu.heading()).toBeVisible();
  await expect(gamePage.menu.play()).toBeFocused();
});
