import { test, expect } from "@/fixtures";
import { copy } from "@/data/copy";

// A phone: the five hold buttons only render on a coarse pointer. Top level, because a touch/mobile context needs a
// worker of its own.
test.use({ viewport: { width: 393, height: 727 }, deviceScaleFactor: 2.75, isMobile: true, hasTouch: true });

test("nút Dịch chuyển dịch chuyển tàu khi giữ", { tag: ["@TC-HYPERSPACE-006"] }, async ({ page, gamePage }) => {
  await gamePage.startFrozen();
  await gamePage.world.setAsteroids([{ x: 60, y: 60, size: "small" }]);
  const before = (await gamePage.world.read()).ship;
  const release = await gamePage.touch.hold(gamePage.touch.button(copy.a11y.hyperspace));
  await page.clock.runFor(50);
  await release();
  const after = (await gamePage.world.read()).ship;
  expect(Math.hypot(after.x - before.x, after.y - before.y)).toBeGreaterThan(100);
});

test("trong lúc hồi, nút Dịch chuyển cho thấy nó chưa dùng được", { tag: ["@TC-HYPERSPACE-007"] }, async ({ page, gamePage }) => {
  // BUG: defects/hyperspace.md#bug-hyperspace-01
  test.fail();
  await gamePage.startFrozen();
  await gamePage.world.setAsteroids([{ x: 60, y: 60, size: "small" }]);
  const button = gamePage.touch.button(copy.a11y.hyperspace);
  const ready = await gamePage.touch.describe(button);
  const release = await gamePage.touch.hold(button);
  await page.clock.runFor(50);
  await release();
  await page.clock.runFor(1000);
  expect((await gamePage.world.read()).ship.hyperMs, "the jump happened and the cooldown runs").toBeGreaterThan(0);
  expect(await gamePage.touch.describe(button)).not.toEqual(ready);
});
