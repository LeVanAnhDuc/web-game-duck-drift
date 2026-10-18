import { test, expect } from "@/fixtures";
import type { GamePage } from "@/pages/game.page";
import { RULES } from "@/data/test-data";

const ASIDE = { x: 200, y: RULES.shipStart.y, size: "small" as const };
const AHEAD = { x: RULES.shipStart.x, y: RULES.shipStart.y - 150, size: "small" as const };

// Nothing in the line of fire unless the test puts it there (one asteroid parked off to the side keeps the wave
// going, out of the column the bullets fly and wrap through), so every bullet fired lives its full 1.2 s.
async function armed(gamePage: GamePage, kind: "rapid" | "spread" | "pierce" | null): Promise<void> {
  await gamePage.startFrozen();
  await gamePage.world.setAsteroids([ASIDE]);
  if (kind) {
    await gamePage.world.dropOnShip(kind);
    await gamePage.page.clock.runFor(50);
  }
}

test("không có vũ khí: giữ Space một giây bắn tối đa 4 viên", { tag: ["@TC-POWERUPS-012"] }, async ({ gamePage }) => {
  await armed(gamePage, null);
  await gamePage.hold("Space", 1000);
  expect((await gamePage.world.read()).bullets).toHaveLength(RULES.bullet.maxOnScreen);
});

test("Bắn nhanh: giữ Space thì nhịp bắn nhanh gấp đôi", { tag: ["@TC-POWERUPS-013"] }, async ({ gamePage }) => {
  await armed(gamePage, "rapid");
  await gamePage.hold("Space", 1000);
  const { bullets } = await gamePage.world.read();
  // More than the 4 an unarmed ship can have out, and fired 140 ms apart instead of 280 ms: the gap between two
  // bullets in the same column is their distance over the bullet speed. A cooldown ends on a 1/60 s step, so a gap
  // may run up to one step long.
  expect(bullets.length).toBeGreaterThan(RULES.bullet.maxOnScreen);
  const step = 1000 / 60;
  for (let i = 1; i < bullets.length; i++) {
    const gapMs = ((((bullets[i]!.y - bullets[i - 1]!.y) % RULES.world.h) + RULES.world.h) % RULES.world.h) / RULES.bullet.speed * 1000;
    expect(gapMs, `gap ${i}`).toBeGreaterThanOrEqual(RULES.bullet.cooldownMs / 2 - 1);
    expect(gapMs, `gap ${i}`).toBeLessThanOrEqual(RULES.bullet.cooldownMs / 2 + step + 1);
  }
});

test("Bắn toả: một lần bóp cò ra ba viên", { tag: ["@TC-POWERUPS-014"] }, async ({ gamePage }) => {
  await armed(gamePage, "spread");
  await gamePage.hold("Space", 100);
  expect((await gamePage.world.read()).bullets).toHaveLength(3);
});

test("Đạn xuyên: viên đạn bắn vỡ thiên thạch rồi bay tiếp", { tag: ["@TC-POWERUPS-015"] }, async ({ page, gamePage }) => {
  await armed(gamePage, "pierce");
  await gamePage.world.setAsteroids([AHEAD, ASIDE]);
  await gamePage.hold("Space", 100);
  await page.clock.runFor(200);
  expect(await gamePage.hud.scoreValue()).toBe(RULES.asteroidScore.small);
  expect((await gamePage.world.read()).bullets).toHaveLength(1);
});

test("đạn thường thì mất khi trúng thiên thạch", { tag: ["@TC-POWERUPS-016"] }, async ({ page, gamePage }) => {
  await armed(gamePage, null);
  await gamePage.world.setAsteroids([AHEAD, ASIDE]);
  await gamePage.hold("Space", 100);
  await page.clock.runFor(200);
  expect(await gamePage.hud.scoreValue()).toBe(RULES.asteroidScore.small);
  expect((await gamePage.world.read()).bullets).toHaveLength(0);
});
