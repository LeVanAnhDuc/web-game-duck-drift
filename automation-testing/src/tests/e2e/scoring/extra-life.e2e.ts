import { test, expect } from "@/fixtures";
import { copy } from "@/data/copy";
import { RULES } from "@/data/test-data";

const AHEAD = { x: RULES.shipStart.x, y: RULES.shipStart.y - 150 };
const LARGE = RULES.asteroidScore.large;

test("chạm đúng mốc 10.000 điểm thì được thêm một mạng và có thông báo", { tag: ["@TC-SCORING-005", "@smoke"] }, async ({ page, gamePage }) => {
  await gamePage.startFrozen();
  await gamePage.world.setScore(RULES.extraLifeEvery - LARGE);
  await gamePage.world.setAsteroids([{ ...AHEAD, size: "large" }]);
  await gamePage.hold("Space", 100);
  await page.clock.runFor(300);
  expect(await gamePage.hud.scoreValue()).toBe(RULES.extraLifeEvery);
  expect(await gamePage.hud.lives()).toBe(4);
  await expect(gamePage.announcer()).toHaveText(copy.announce.extraLife);
});

test("dưới mốc 10.000 điểm thì chưa được thêm mạng", { tag: ["@TC-SCORING-006"] }, async ({ page, gamePage }) => {
  await gamePage.startFrozen();
  await gamePage.world.setScore(RULES.extraLifeEvery - 2 * LARGE);
  await gamePage.world.setAsteroids([{ ...AHEAD, size: "large" }]);
  await gamePage.hold("Space", 100);
  await page.clock.runFor(300);
  expect(await gamePage.hud.scoreValue()).toBe(RULES.extraLifeEvery - LARGE);
  expect(await gamePage.hud.lives()).toBe(3);
  await expect(gamePage.announcer()).not.toHaveText(copy.announce.extraLife);
});

test("mỗi mốc chỉ thưởng một lần: điểm tiếp theo sau mốc không cộng thêm mạng", { tag: ["@TC-SCORING-007"] }, async ({ page, gamePage }) => {
  await gamePage.startFrozen();
  await gamePage.world.setScore(RULES.extraLifeEvery - LARGE);
  await gamePage.world.setAsteroids([{ ...AHEAD, size: "large" }]);
  await gamePage.hold("Space", 100);
  await page.clock.runFor(300);
  expect(await gamePage.hud.lives()).toBe(4);
  await gamePage.world.setAsteroids([{ ...AHEAD, size: "medium" }]);
  await gamePage.hold("Space", 100);
  await page.clock.runFor(300);
  expect(await gamePage.hud.scoreValue()).toBe(RULES.extraLifeEvery + RULES.asteroidScore.medium);
  expect(await gamePage.hud.lives()).toBe(4);
});
