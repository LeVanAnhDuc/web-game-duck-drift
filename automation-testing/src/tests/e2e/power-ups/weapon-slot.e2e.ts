import { test, expect } from "@/fixtures";
import type { GamePage } from "@/pages/game.page";
import { copy } from "@/data/copy";
import { RULES } from "@/data/test-data";

// One still asteroid parked in a corner: the wave never ends and nothing reaches the ship at the centre while the
// weapon clocks run for several seconds.
async function ready(gamePage: GamePage): Promise<void> {
  await gamePage.startFrozen();
  await gamePage.world.setAsteroids([{ x: 60, y: 60, size: "small" }]);
}

async function pick(gamePage: GamePage, kind: "rapid" | "spread" | "pierce" | "shield"): Promise<void> {
  await gamePage.world.dropOnShip(kind);
  await gamePage.page.clock.runFor(50);
}

test("nhặt vũ khí khác loại thì thay hẳn vũ khí cũ và đếm lại từ 12 giây", { tag: ["@TC-POWERUPS-006", "@smoke"] }, async ({ page, gamePage }) => {
  await ready(gamePage);
  await pick(gamePage, "rapid");
  await page.clock.runFor(5000);
  await expect(gamePage.hud.weaponSeconds()).toHaveText("7s");
  await pick(gamePage, "spread");
  await expect(gamePage.hud.weaponName(copy.powerUpName.spread)).toBeVisible();
  await expect(gamePage.hud.weaponName(copy.powerUpName.rapid)).toHaveCount(0);
  await expect(gamePage.hud.weaponSeconds()).toHaveText(`${RULES.weaponMs / 1000}s`);
});

test("nhặt trùng loại thì cộng dồn thời gian", { tag: ["@TC-POWERUPS-007"] }, async ({ page, gamePage }) => {
  await ready(gamePage);
  await pick(gamePage, "pierce");
  await page.clock.runFor(5000); // 7 s left
  await pick(gamePage, "pierce");
  // 7 + 12 = 19 s, under the 20 s cap.
  await expect(gamePage.hud.weaponSeconds()).toHaveText("19s");
  await expect(gamePage.hud.weaponName(copy.powerUpName.pierce)).toBeVisible();
});

test("cộng dồn không vượt trần 20 giây", { tag: ["@TC-POWERUPS-008"] }, async ({ page, gamePage }) => {
  await ready(gamePage);
  await pick(gamePage, "rapid");
  await page.clock.runFor(2000); // 10 s left; 10 + 12 = 22 → capped
  await pick(gamePage, "rapid");
  await expect(gamePage.hud.weaponSeconds()).toHaveText(`${RULES.weaponMaxMs / 1000}s`);
});

test("hết 12 giây thì vũ khí hết và thanh vũ khí biến mất", { tag: ["@TC-POWERUPS-009"] }, async ({ page, gamePage }) => {
  await ready(gamePage);
  await pick(gamePage, "spread");
  await page.clock.runFor(RULES.weaponMs - 300);
  await expect(gamePage.hud.weaponSeconds()).toHaveText("1s");
  await page.clock.runFor(500);
  await expect(gamePage.hud.weaponSeconds()).toHaveCount(0);
  expect((await gamePage.world.read()).ship.weapon).toBeNull();
});

test("Khiên không chiếm khe vũ khí: nhặt Khiên khi đang có vũ khí thì giữ cả hai", { tag: ["@TC-POWERUPS-010"] }, async ({ gamePage }) => {
  await ready(gamePage);
  await pick(gamePage, "rapid");
  await pick(gamePage, "shield");
  await expect(gamePage.hud.weaponName(copy.powerUpName.rapid)).toBeVisible();
  await expect(gamePage.hud.pips()).toHaveCount(4);
});

test("mất mạng thì mất cả vũ khí lẫn khiên đang có", { tag: ["@TC-POWERUPS-011"] }, async ({ page, gamePage }) => {
  await ready(gamePage);
  await pick(gamePage, "rapid");
  await pick(gamePage, "shield");
  const { ship } = await gamePage.world.read();
  const onShip = [
    { x: ship.x, y: ship.y, size: "large" as const },
    { x: 60, y: 60, size: "small" as const },
  ];
  // Two hits in a row: the shield takes the first, the second (its grace time cut short) takes the life.
  await gamePage.world.endInvulnerability();
  await gamePage.world.setAsteroids(onShip);
  await page.clock.runFor(100);
  expect(await gamePage.hud.lives()).toBe(3);
  await expect(gamePage.hud.weaponName(copy.powerUpName.rapid)).toBeVisible();
  await gamePage.world.endInvulnerability();
  await gamePage.world.setAsteroids(onShip);
  await page.clock.runFor(100);
  expect(await gamePage.hud.lives()).toBe(2);
  await expect(gamePage.hud.weaponSeconds()).toHaveCount(0);
  await expect(gamePage.hud.pips()).toHaveCount(2);
});
