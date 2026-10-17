import { test, expect } from "@/fixtures";
import type { GamePage } from "@/pages/game.page";
import { copy } from "@/data/copy";

const TEN_MINUTES = 10 * 60 * 1000;

/** Opens the game on a fake clock and starts a game on the given preset. */
async function startOnClock(gamePage: GamePage, preset: "normal" | "hard" = "normal"): Promise<void> {
  await gamePage.page.clock.install();
  await gamePage.goto();
  await gamePage.menu.choose(preset);
  await gamePage.start();
}

/** Idles until the asteroid that hits the ship has scored. */
async function playUntilScored(gamePage: GamePage): Promise<void> {
  for (let s = 0; s < 60 && (await gamePage.hud.scoreValue()) === 0; s++) await gamePage.page.clock.runFor(500);
  expect(await gamePage.hud.scoreValue()).toBeGreaterThan(0);
}

async function snapshot(gamePage: GamePage) {
  return {
    score: await gamePage.hud.score().textContent(),
    lives: await gamePage.hud.lives(),
    wave: await gamePage.hud.wave().textContent(),
  };
}

test("Esc mở overlay Tạm dừng, focus ở Tiếp tục", { tag: ["@TC-PAUSE-001", "@smoke"] }, async ({ gamePage }) => {
  await gamePage.goto();
  await gamePage.start();
  await gamePage.press("Escape");
  await expect(gamePage.pause.heading()).toBeVisible();
  await expect(gamePage.pause.resume()).toBeFocused();
  await expect(gamePage.pause.toMenu()).toBeVisible();
});

test("phím P tạm dừng, P lần nữa chơi tiếp", { tag: ["@TC-PAUSE-002"] }, async ({ gamePage }) => {
  await gamePage.goto();
  await gamePage.start();
  await gamePage.press("p");
  await expect(gamePage.pause.heading()).toBeVisible();
  await gamePage.press("p");
  await expect(gamePage.pause.heading()).toHaveCount(0);
  await expect(gamePage.hud.pauseButton()).toBeVisible();
});

test("nút Tạm dừng trên HUD mở overlay", { tag: ["@TC-PAUSE-003"] }, async ({ gamePage }) => {
  await gamePage.goto();
  await gamePage.start();
  await gamePage.hud.pauseButton().click();
  await expect(gamePage.pause.heading()).toBeVisible();
});

test("Tiếp tục và Esc đưa về đúng ván: điểm, mạng, wave giữ nguyên", { tag: ["@TC-PAUSE-004", "@smoke"] }, async ({ gamePage }) => {
  await startOnClock(gamePage);
  await playUntilScored(gamePage);

  await gamePage.press("Escape");
  const before = await snapshot(gamePage);
  await gamePage.pause.resume().click();
  await expect(gamePage.pause.heading()).toHaveCount(0);
  expect(await snapshot(gamePage)).toEqual(before);

  await gamePage.press("Escape");
  await expect(gamePage.pause.heading()).toBeVisible();
  await gamePage.press("Escape");
  await expect(gamePage.pause.heading()).toHaveCount(0);
  expect(await snapshot(gamePage)).toEqual(before);
});

test("đang tạm dừng thì thời gian trôi không đổi gì", { tag: ["@TC-PAUSE-005"] }, async ({ page, gamePage }) => {
  await startOnClock(gamePage, "hard");
  await page.clock.runFor(500);
  await gamePage.press("Escape");
  const before = await snapshot(gamePage);
  await page.clock.runFor(60_000);
  await expect(gamePage.pause.heading()).toBeVisible();
  expect(await snapshot(gamePage)).toEqual(before);
});

test("chuyển sang tab khác thì tự tạm dừng", { tag: ["@TC-PAUSE-006", "@smoke"] }, async ({ gamePage }) => {
  await gamePage.goto();
  await gamePage.start();
  await gamePage.hideTab();
  await expect(gamePage.pause.heading()).toBeVisible();
});

test("cửa sổ mất focus thì tự tạm dừng", { tag: ["@TC-PAUSE-007"] }, async ({ gamePage }) => {
  await gamePage.goto();
  await gamePage.start();
  await gamePage.blurWindow();
  await expect(gamePage.pause.heading()).toBeVisible();
});

test("tab ẩn 10 phút rồi quay lại: không chạy bù, không mất mạng", { tag: ["@TC-PAUSE-008"] }, async ({ page, gamePage }) => {
  await startOnClock(gamePage, "hard");
  await gamePage.hideTab();
  await expect(gamePage.pause.heading()).toBeVisible();
  await page.clock.fastForward(TEN_MINUTES);
  await gamePage.pause.resume().click();
  await page.clock.runFor(500);
  expect(await gamePage.hud.lives()).toBe(2);
  await expect(gamePage.hud.wave()).toHaveText(`${copy.hud.wave} 1`);
  await expect(gamePage.gameOver.heading()).toHaveCount(0);
});

test("đồng hồ nhảy 10 phút giữa hai frame khi không tạm dừng: ván chỉ tiến tối đa 0,25 giây", { tag: ["@TC-PAUSE-009"] }, async ({ page, gamePage }) => {
  await startOnClock(gamePage, "hard");
  await page.clock.fastForward(TEN_MINUTES);
  await page.clock.runFor(100);
  expect(await gamePage.hud.lives()).toBe(2);
  await expect(gamePage.gameOver.heading()).toHaveCount(0);
  await expect(gamePage.hud.pauseButton()).toBeVisible();
});

test("chưa có điểm: cảnh báo chỉ nói bỏ ván, không nhắc điểm", { tag: ["@TC-PAUSE-010"] }, async ({ gamePage }) => {
  await gamePage.goto();
  await gamePage.start();
  await gamePage.press("Escape");
  await expect(gamePage.pause.warning()).toHaveText(copy.pause.toMenuWarning(null));
});

test("có điểm: cảnh báo nêu số điểm sẽ không được ghi, và Về menu bỏ ván không ghi điểm", { tag: ["@TC-PAUSE-011"] }, async ({ gamePage }) => {
  await startOnClock(gamePage);
  await playUntilScored(gamePage);
  await gamePage.press("Escape");
  const score = (await gamePage.hud.score().textContent()) ?? "";
  await expect(gamePage.pause.warning()).toHaveText(copy.pause.toMenuWarning(score));

  await gamePage.pause.toMenu().click();
  await expect(gamePage.menu.heading()).toBeVisible();
  await gamePage.menu.openHighScores();
  await expect(gamePage.highScores.empty("normal")).toBeVisible();
});
