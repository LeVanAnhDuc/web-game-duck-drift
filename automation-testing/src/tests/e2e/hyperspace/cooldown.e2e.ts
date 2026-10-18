import { test, expect } from "@/fixtures";
import type { GamePage } from "@/pages/game.page";
import { RULES } from "@/data/test-data";

// One still asteroid parked in a corner: the wave cannot end (no wave change mid-test) and nothing drifts into the
// ship while the test waits out the 5-second cooldown.
async function parkField(gamePage: GamePage): Promise<void> {
  await gamePage.world.setAsteroids([{ x: 60, y: 60, size: "small" }]);
}

/**
 * A short Shift press. 50 ms, not one 16.7 ms step: the fake clock fires animation frames every 16 ms, and the page
 * loads at a varying fake time, so a 20 ms hold can fall between two frames that run no step and the key is never read.
 */
const TAP = 50;

const shipAt = async (gamePage: GamePage) => {
  const { ship } = await gamePage.world.read();
  return { x: ship.x, y: ship.y, vx: ship.vx, vy: ship.vy };
};

test("Shift dịch chuyển tàu tới chỗ khác và tàu đứng yên ở đó", { tag: ["@TC-HYPERSPACE-001", "@smoke"] }, async ({ page, gamePage }) => {
  await gamePage.startFrozen();
  await parkField(gamePage);
  await gamePage.hold("ArrowUp", 500);
  const before = await shipAt(gamePage);
  expect(Math.hypot(before.vx, before.vy), "the thrust got the ship moving").toBeGreaterThan(0);
  await gamePage.hold("Shift", TAP);
  const after = await shipAt(gamePage);
  expect(Math.hypot(after.x - before.x, after.y - before.y)).toBeGreaterThan(100);
  expect([after.vx, after.vy]).toEqual([0, 0]);
  // Still: a second later it has not moved.
  await page.clock.runFor(1000);
  const later = await shipAt(gamePage);
  expect([later.x, later.y]).toEqual([after.x, after.y]);
});

test("Shift phải cũng dịch chuyển như Shift trái", { tag: ["@TC-HYPERSPACE-002"] }, async ({ gamePage }) => {
  await gamePage.startFrozen();
  await parkField(gamePage);
  const before = await shipAt(gamePage);
  await gamePage.hold("ShiftRight", TAP);
  const after = await shipAt(gamePage);
  expect(Math.hypot(after.x - before.x, after.y - before.y)).toBeGreaterThan(100);
});

test("trong 5 giây sau một lần dịch chuyển, bấm Shift không có tác dụng", { tag: ["@TC-HYPERSPACE-003"] }, async ({ page, gamePage }) => {
  await gamePage.startFrozen();
  await parkField(gamePage);
  await gamePage.hold("Shift", TAP);
  const landed = await shipAt(gamePage);
  // Presses at ~0.5 s, ~2.5 s and ~4.8 s after the jump (each wait plus the 50 ms of the previous press).
  for (const wait of [450, 1950, 2250]) {
    await page.clock.runFor(wait);
    const { ship } = await gamePage.world.read();
    expect(ship.hyperMs, "still inside the cooldown").toBeGreaterThan(0);
    await gamePage.hold("Shift", TAP);
    const now = await shipAt(gamePage);
    expect([now.x, now.y], `Shift ${RULES.hyperCooldownMs - ship.hyperMs} ms after the jump`).toEqual([landed.x, landed.y]);
  }
});

test("hết 5 giây hồi thì Shift dịch chuyển được lại", { tag: ["@TC-HYPERSPACE-004"] }, async ({ page, gamePage }) => {
  await gamePage.startFrozen();
  await parkField(gamePage);
  await gamePage.hold("Shift", TAP);
  const first = await shipAt(gamePage);
  await page.clock.runFor(RULES.hyperCooldownMs + 100);
  await gamePage.hold("Shift", TAP);
  const second = await shipAt(gamePage);
  expect(Math.hypot(second.x - first.x, second.y - first.y)).toBeGreaterThan(100);
});

test("mất mạng thì mạng mới dịch chuyển được ngay, không phải chờ hết hồi của mạng trước", { tag: ["@TC-HYPERSPACE-005"] }, async ({ page, gamePage }) => {
  await gamePage.startFrozen();
  await parkField(gamePage);
  await gamePage.hold("Shift", TAP);
  const landed = await shipAt(gamePage);
  // Crash where it landed: an asteroid on the ship, invulnerability over.
  await gamePage.world.endInvulnerability();
  await gamePage.world.setAsteroids([{ x: landed.x, y: landed.y, size: "large" }, { x: 60, y: 60, size: "small" }]);
  await page.clock.runFor(100);
  expect(await gamePage.hud.lives()).toBe(2);
  // Respawn at the centre, well inside the old jump's 5 seconds.
  await page.clock.runFor(RULES.respawnMs + 100);
  const respawned = await shipAt(gamePage);
  expect([respawned.x, respawned.y]).toEqual([RULES.shipStart.x, RULES.shipStart.y]);
  await gamePage.hold("Shift", TAP);
  const jumped = await shipAt(gamePage);
  expect(Math.hypot(jumped.x - respawned.x, jumped.y - respawned.y)).toBeGreaterThan(100);
});
