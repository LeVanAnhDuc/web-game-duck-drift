import { test, expect } from "@/fixtures";
import { copy } from "@/data/copy";

const [, rotateKeys] = copy.help.keyboard[0];
const [, thrustKeys] = copy.help.keyboard[1];

test("chuột/bàn phím: gợi ý điều khiển có mặt lúc vào ván và nêu đúng ba phím", { tag: ["@TC-PLAY-007"] }, async ({ gamePage }) => {
  await gamePage.goto();
  await gamePage.start();
  await expect(gamePage.hud.controlsHint()).toHaveText(`${copy.hud.controlsHint} ${rotateKeys} · ${thrustKeys} · ${copy.help.fireKeys}`);
});

test("gợi ý không biến mất chỉ vì điểm lên", { tag: ["@TC-PLAY-008"] }, async ({ page, gamePage }) => {
  await page.clock.install();
  await gamePage.goto();
  await gamePage.start();
  await expect(gamePage.hud.controlsHint()).toBeVisible();
  // Idle until the asteroid that hits the ship breaks and scores: the player has still done nothing.
  for (let s = 0; s < 60 && (await gamePage.hud.scoreValue()) === 0; s++) await page.clock.runFor(500);
  expect(await gamePage.hud.scoreValue()).toBeGreaterThan(0);
  await expect(gamePage.hud.controlsHint()).toBeVisible();
});
