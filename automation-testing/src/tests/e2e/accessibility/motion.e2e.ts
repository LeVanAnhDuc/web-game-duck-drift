import { test, expect } from "@/fixtures";
import type { GamePage } from "@/pages/game.page";

async function transitionMs(gamePage: GamePage): Promise<number> {
  return gamePage.menu.highScoresButton().evaluate((el) => {
    const raw = getComputedStyle(el).transitionDuration.split(",")[0].trim();
    return raw.endsWith("ms") ? parseFloat(raw) : parseFloat(raw) * 1000;
  });
}

/** Ten seconds of an idle game from a fresh load; returns what the HUD shows. The fake clock is frozen, so only these
 * ten seconds move the game and two runs are step-for-step the same game. */
async function tenSeconds(gamePage: GamePage): Promise<{ score: number; lives: number }> {
  await gamePage.reload();
  await gamePage.start();
  await gamePage.page.clock.runFor(10_000);
  return { score: await gamePage.hud.scoreValue(), lives: await gamePage.hud.lives() };
}

test("giảm chuyển động thì transition của DOM tắt", { tag: ["@TC-ACCESSIBILITY-008"] }, async ({ page, gamePage }) => {
  await gamePage.goto();
  expect(await transitionMs(gamePage)).toBeGreaterThan(0.01);
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(await transitionMs(gamePage)).toBeLessThanOrEqual(0.01);
});

test("giảm chuyển động không đổi gameplay", { tag: ["@TC-ACCESSIBILITY-009"] }, async ({ page, gamePage }) => {
  // Two runs of 10 s drawn frame by frame (reduced motion changes what is drawn, so frames are not skipped):
  // ~16 s alone, too close to the 30 s default under parallel load.
  test.slow();
  await page.clock.install({ time: new Date("2026-10-17T08:00:00Z") });
  await page.clock.pauseAt(new Date("2026-10-17T08:00:01Z"));
  await gamePage.goto();
  const normal = await tenSeconds(gamePage);
  await page.emulateMedia({ reducedMotion: "reduce" });
  const reduced = await tenSeconds(gamePage);
  expect(normal.score).toBeGreaterThan(0);
  expect(reduced).toEqual(normal);
});
