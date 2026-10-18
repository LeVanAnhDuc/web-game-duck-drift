import { test, expect } from "@/fixtures";
import { copy } from "@/data/copy";
import { RULES } from "@/data/test-data";

const AHEAD = { x: RULES.shipStart.x, y: RULES.shipStart.y - 150 };

test("wave 1 có 3 thiên thạch to, không viên nào sát tàu", { tag: ["@TC-WORLD-005"] }, async ({ gamePage }) => {
  await gamePage.startFrozen();
  const { asteroids, ship } = await gamePage.world.read();
  expect(asteroids.map((a) => a.size)).toEqual(Array(RULES.waveCount(1)).fill("large"));
  for (const a of asteroids) {
    // A tenth of a second of drift at most 13 units: still clear of the 260-unit spawn ring.
    expect(Math.hypot(a.x - ship.x, a.y - ship.y)).toBeGreaterThan(RULES.waveSafeRadius - 15);
  }
});

test("bắn hết thiên thạch thì nghỉ 1,5 giây rồi sang wave 2 với 4 thiên thạch to", { tag: ["@TC-WORLD-006", "@smoke"] }, async ({ page, gamePage }) => {
  await gamePage.startFrozen();
  await gamePage.world.setAsteroids([{ ...AHEAD, size: "small" }]);
  await gamePage.hold("Space", 100);
  // The last asteroid breaks ~70 ms into the hold; from then the field is empty.
  await page.clock.runFor(RULES.waveClearDelayMs - 300);
  await expect(gamePage.hud.wave()).toHaveText(`${copy.hud.wave} 1`);
  expect((await gamePage.world.read()).asteroids).toEqual([]);
  await page.clock.runFor(400);
  await expect(gamePage.hud.wave()).toHaveText(`${copy.hud.wave} 2`);
  await expect(gamePage.announcer()).toHaveText(copy.announce.waveStart(2));
  const { asteroids } = await gamePage.world.read();
  expect(asteroids.map((a) => a.size)).toEqual(Array(RULES.waveCount(2)).fill("large"));
});

test("số thiên thạch mỗi wave là 2 + n, dừng ở trần 11", { tag: ["@TC-WORLD-007"] }, async ({ page, gamePage }) => {
  await gamePage.startFrozen();
  // From wave 2 asteroids may spawn on the ship; a crash would break one and change the count.
  await gamePage.world.setInvulnerable(60_000);
  // Wave 8 → 9 is the last step that grows (2 + 9 = 11); 9 → 10 and 10 → 11 stay at the cap.
  for (const next of [3, 9, 10, 11]) {
    await gamePage.world.setWave(next - 1);
    await gamePage.world.setAsteroids([]);
    await page.clock.runFor(RULES.waveClearDelayMs + 100);
    await expect(gamePage.hud.wave()).toHaveText(`${copy.hud.wave} ${next}`);
    expect((await gamePage.world.read()).asteroids, `wave ${next}`).toHaveLength(RULES.waveCount(next));
  }
});

test("wave sau thiên thạch nhanh hơn: tốc độ nằm trong khoảng của wave đó", { tag: ["@TC-WORLD-008"] }, async ({ page, gamePage }) => {
  await gamePage.startFrozen();
  const speeds = async () => (await gamePage.world.read()).asteroids.map((a) => Math.hypot(a.vx, a.vy));
  for (const s of await speeds()) {
    expect(s).toBeGreaterThanOrEqual(RULES.asteroidSpeed.min - 1e-6);
    expect(s).toBeLessThanOrEqual(RULES.asteroidSpeed.max + 1e-6);
  }
  await gamePage.world.setInvulnerable(60_000);
  await gamePage.world.setWave(9);
  await gamePage.world.setAsteroids([]);
  await page.clock.runFor(RULES.waveClearDelayMs + 100);
  await expect(gamePage.hud.wave()).toHaveText(`${copy.hud.wave} 10`);
  const factor = RULES.waveSpeedFactor(10);
  const wave10 = await speeds();
  for (const s of wave10) {
    expect(s).toBeGreaterThanOrEqual(RULES.asteroidSpeed.min * factor - 1e-6);
    expect(s).toBeLessThanOrEqual(RULES.asteroidSpeed.max * factor + 1e-6);
  }
  // The slowest wave-10 asteroid is faster than the slowest a wave 1 could ever have.
  expect(Math.min(...wave10)).toBeGreaterThan(RULES.asteroidSpeed.min);
});
