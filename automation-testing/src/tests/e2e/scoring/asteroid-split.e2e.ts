import { test, expect } from "@/fixtures";
import { RULES } from "@/data/test-data";

// The ship starts at the centre, nose up; an asteroid placed straight above it is in the line of fire. One short
// Space hold fires exactly one bullet (the next is 280 ms away), which reaches the target well inside 300 ms.
const AHEAD = { x: RULES.shipStart.x, y: RULES.shipStart.y - 150 };

for (const [size, child] of [
  ["large", "medium"],
  ["medium", "small"],
] as const) {
  const tc = size === "large" ? "@TC-SCORING-001" : "@TC-SCORING-002";
  test(`bắn vỡ thiên thạch ${size === "large" ? "to" : "vừa"} được ${RULES.asteroidScore[size]} điểm và tách thành hai mảnh ${child === "medium" ? "vừa" : "nhỏ"}`, { tag: [tc, ...(size === "large" ? ["@smoke"] : [])] }, async ({ page, gamePage }) => {
    await gamePage.startFrozen();
    await gamePage.world.setAsteroids([{ ...AHEAD, size }]);
    await gamePage.hold("Space", 100);
    await page.clock.runFor(300);
    await expect(gamePage.hud.score()).toHaveText(String(RULES.asteroidScore[size]));
    const { asteroids } = await gamePage.world.read();
    expect(asteroids.map((a) => a.size)).toEqual([child, child]);
  });
}

test("bắn vỡ thiên thạch nhỏ được 100 điểm và nó biến mất, không sinh mảnh", { tag: ["@TC-SCORING-003"] }, async ({ page, gamePage }) => {
  await gamePage.startFrozen();
  await gamePage.world.setAsteroids([{ ...AHEAD, size: "small" }]);
  await gamePage.hold("Space", 100);
  await page.clock.runFor(300);
  await expect(gamePage.hud.score()).toHaveText(String(RULES.asteroidScore.small));
  expect((await gamePage.world.read()).asteroids).toEqual([]);
});

test("cả chuỗi một thiên thạch to cộng đúng 20 + 2×50 + 4×100 = 520 điểm", { tag: ["@TC-SCORING-004"] }, async ({ page, gamePage }) => {
  await gamePage.startFrozen();
  // One generation at a time: whatever pieces the last hit left, line them up ahead again (still), shoot each.
  await gamePage.world.setAsteroids([{ ...AHEAD, size: "large" }]);
  for (let shots = 0; shots < 7; shots++) {
    const { asteroids } = await gamePage.world.read();
    await gamePage.world.setAsteroids(asteroids.map((a, i) => (i === 0 ? { ...AHEAD, size: a.size } : { x: 100 + i * 60, y: 1100, size: a.size })));
    await gamePage.hold("Space", 100);
    await page.clock.runFor(300);
  }
  // 1 large + 2 medium + 4 small = 7 hits; the field is then empty.
  expect((await gamePage.world.read()).asteroids).toEqual([]);
  expect(await gamePage.hud.scoreValue()).toBe(RULES.asteroidScore.large + 2 * RULES.asteroidScore.medium + 4 * RULES.asteroidScore.small);
});
