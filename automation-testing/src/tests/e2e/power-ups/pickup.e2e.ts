import { test, expect } from "@/fixtures";
import type { GamePage } from "@/pages/game.page";
import { copy } from "@/data/copy";
import { RULES } from "@/data/test-data";

// A still asteroid in a corner keeps the wave from ending; the power-up is dropped right under the ship, so the next
// step picks it up. What is tested is what the pickup does, not the 8 % roll that drops one.
async function ready(gamePage: GamePage): Promise<void> {
  await gamePage.startFrozen();
  await gamePage.world.setAsteroids([{ x: 60, y: 60, size: "small" }]);
}

/** A crash: the ship's invulnerability is cut short and an asteroid is put on it. */
async function crash(gamePage: GamePage): Promise<void> {
  const { ship } = await gamePage.world.read();
  await gamePage.world.endInvulnerability();
  await gamePage.world.setAsteroids([
    { x: ship.x, y: ship.y, size: "large" },
    { x: 60, y: 60, size: "small" },
  ]);
  await gamePage.page.clock.runFor(100);
}

test("nhặt Khiên: HUD có thêm dấu khiên cạnh số mạng, không có thanh vũ khí", { tag: ["@TC-POWERUPS-001"] }, async ({ page, gamePage }) => {
  await ready(gamePage);
  await expect(gamePage.hud.pips()).toHaveCount(3);
  await gamePage.world.dropOnShip("shield");
  await page.clock.runFor(50);
  await expect(gamePage.hud.pips()).toHaveCount(4);
  expect(await gamePage.hud.lives()).toBe(3);
  await expect(gamePage.hud.weaponSeconds()).toHaveCount(0);
});

test("Khiên chặn đúng một lần va chạm: không mất mạng, dấu khiên mất", { tag: ["@TC-POWERUPS-002", "@smoke"] }, async ({ page, gamePage }) => {
  await ready(gamePage);
  await gamePage.world.dropOnShip("shield");
  await page.clock.runFor(50);
  await crash(gamePage);
  expect(await gamePage.hud.lives()).toBe(3);
  await expect(gamePage.hud.pips()).toHaveCount(3);
  // The asteroid it blocked still breaks and scores.
  expect(await gamePage.hud.scoreValue()).toBe(RULES.asteroidScore.large);
  // The next hit, once the shield's grace time is cut short too, costs a life.
  await crash(gamePage);
  expect(await gamePage.hud.lives()).toBe(2);
});

test("Khiên không hết hạn theo thời gian", { tag: ["@TC-POWERUPS-003"] }, async ({ page, gamePage }) => {
  await ready(gamePage);
  await gamePage.world.dropOnShip("shield");
  await page.clock.runFor(50);
  await page.clock.runFor(RULES.weaponMaxMs + 5000);
  await expect(gamePage.hud.pips()).toHaveCount(4);
});

test("nhặt Thêm mạng: số mạng tăng một ngay, không chiếm khe nào", { tag: ["@TC-POWERUPS-004", "@smoke"] }, async ({ page, gamePage }) => {
  await ready(gamePage);
  await gamePage.world.dropOnShip("life");
  await page.clock.runFor(50);
  expect(await gamePage.hud.lives()).toBe(4);
  await expect(gamePage.hud.pips()).toHaveCount(4);
  await expect(gamePage.hud.weaponSeconds()).toHaveCount(0);
});

for (const kind of ["rapid", "spread", "pierce"] as const) {
  test(`nhặt vũ khí: thanh vũ khí hiện tên và 12 giây — ${copy.powerUpName[kind]}`, { tag: ["@TC-POWERUPS-005"] }, async ({ page, gamePage }) => {
    await ready(gamePage);
    await gamePage.world.dropOnShip(kind);
    await page.clock.runFor(50);
    await expect(gamePage.hud.weaponName(copy.powerUpName[kind])).toBeVisible();
    await expect(gamePage.hud.weaponSeconds()).toHaveText(`${RULES.weaponMs / 1000}s`);
  });
}
