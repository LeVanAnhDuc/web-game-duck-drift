import { test, expect } from "@/fixtures";
import { copy } from "@/data/copy";

test("bấm Chơi thì vào thẳng ván, không có màn chờ", { tag: ["@TC-PLAY-001", "@smoke"] }, async ({ gamePage }) => {
  await gamePage.goto();
  await gamePage.menu.play().click();
  await expect(gamePage.hud.pauseButton()).toBeVisible();
  await expect(gamePage.menu.heading()).toHaveCount(0);
});

test("HUD lúc vào ván: điểm 0, Wave 1, đủ mạng, nút Tạm dừng", { tag: ["@TC-PLAY-002", "@smoke"] }, async ({ page, gamePage }) => {
  // Frozen clock, then a tenth of a second of play: wave 1 is spawned by the first step, and nothing can reach the
  // ship that early (it is invulnerable for 2 seconds anyway).
  await page.clock.install({ time: new Date("2026-10-17T08:00:00Z") });
  await page.clock.pauseAt(new Date("2026-10-17T08:00:01Z"));
  await gamePage.goto();
  await gamePage.start();
  await page.clock.runFor(100);
  const { hud } = gamePage;
  await expect(hud.score()).toHaveText("0");
  await expect(hud.wave()).toHaveText(`${copy.hud.wave} 1`);
  await expect(hud.livesGroup()).toHaveAttribute("aria-label", `${copy.hud.lives}: 3`);
  await expect(hud.pauseButton()).toBeVisible();
});

test("vòng lặp chạy: vùng thông báo nói Wave 1", { tag: ["@TC-PLAY-003"] }, async ({ gamePage }) => {
  await gamePage.goto();
  await gamePage.start();
  await expect(gamePage.announcer()).toHaveText(copy.announce.waveStart(1));
});

test("đứng yên 2 giây đầu ván không mất mạng", { tag: ["@TC-PLAY-004"] }, async ({ page, gamePage }) => {
  await page.clock.install();
  await gamePage.goto();
  await gamePage.menu.choose("hard");
  await gamePage.start();
  await page.clock.runFor(1900);
  expect(await gamePage.hud.lives()).toBe(2);
});

test("va thiên thạch thì mất đúng một mạng, có thông báo, và viên đá vỡ cho điểm", { tag: ["@TC-PLAY-005", "@smoke"] }, async ({ page, gamePage }) => {
  await page.clock.install();
  await gamePage.goto();
  await gamePage.start();
  for (let s = 0; s < 60 && (await gamePage.hud.lives()) === 3; s++) await page.clock.runFor(500);
  expect(await gamePage.hud.lives()).toBe(2);
  await expect(gamePage.announcer()).toHaveText(copy.announce.lifeLost(2));
  expect(await gamePage.hud.scoreValue()).toBeGreaterThan(0);
});

test("trong lúc chơi, phím điều khiển không cuộn trang", { tag: ["@TC-PLAY-006"] }, async ({ page, gamePage }) => {
  await gamePage.goto();
  await gamePage.start();
  for (const code of ["ArrowLeft", "ArrowRight", "ArrowUp", "KeyA", "KeyD", "KeyW", "Space", "ShiftLeft"]) {
    expect(await gamePage.keyIsClaimed(code), code).toBe(true);
  }
  for (const key of ["ArrowUp", "ArrowDown", "Space"]) await page.keyboard.press(key);
  expect(await gamePage.scrollY()).toBe(0);
  await expect(gamePage.hud.pauseButton()).toBeVisible();
});
