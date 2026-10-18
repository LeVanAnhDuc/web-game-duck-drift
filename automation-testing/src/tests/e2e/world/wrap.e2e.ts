import { test, expect } from "@/fixtures";
import { RULES } from "@/data/test-data";

const { w: W, h: H } = RULES.world;
const PARKED = { x: 60, y: 60, size: "small" as const };

test("tàu bay ra mép phải thì hiện lại ở mép trái, cùng độ cao", { tag: ["@TC-WORLD-001", "@smoke"] }, async ({ page, gamePage }) => {
  await gamePage.startFrozen();
  await gamePage.world.setAsteroids([PARKED]);
  await gamePage.world.placeShip({ x: W - 10, y: 600, vx: 300 });
  await page.clock.runFor(200);
  const { ship } = await gamePage.world.read();
  expect(ship.x).toBeGreaterThanOrEqual(0);
  expect(ship.x).toBeLessThan(100);
  expect(ship.y).toBeCloseTo(600, 5);
});

test("tàu bay ra mép trên thì hiện lại ở mép dưới", { tag: ["@TC-WORLD-002"] }, async ({ page, gamePage }) => {
  await gamePage.startFrozen();
  await gamePage.world.setAsteroids([PARKED]);
  await gamePage.world.placeShip({ x: 800, y: 10, vy: -300 });
  await page.clock.runFor(200);
  const { ship } = await gamePage.world.read();
  expect(ship.y).toBeGreaterThan(H - 100);
  expect(ship.y).toBeLessThan(H);
});

test("thiên thạch trôi ra mép trái thì hiện lại ở mép phải", { tag: ["@TC-WORLD-003"] }, async ({ page, gamePage }) => {
  await gamePage.startFrozen();
  await gamePage.world.setAsteroids([{ x: 10, y: 1000, vx: -100, size: "small" }]);
  await page.clock.runFor(300);
  const [rock] = (await gamePage.world.read()).asteroids;
  expect(rock!.x).toBeGreaterThan(W - 100);
  expect(rock!.y).toBeCloseTo(1000, 5);
});

test("va chạm tính qua mép: thiên thạch ở sát mép đối diện vẫn đâm trúng tàu", { tag: ["@TC-WORLD-004"] }, async ({ page, gamePage }) => {
  await gamePage.startFrozen();
  // Ship 5 units from the left edge, a small asteroid 5 units from the right edge: 10 units apart through the wrap.
  await gamePage.world.placeShip({ x: 5, y: 600 });
  await gamePage.world.setAsteroids([{ x: W - 5, y: 600, size: "small" }, PARKED]);
  await gamePage.world.endInvulnerability();
  await page.clock.runFor(100);
  expect(await gamePage.hud.lives()).toBe(2);
});
