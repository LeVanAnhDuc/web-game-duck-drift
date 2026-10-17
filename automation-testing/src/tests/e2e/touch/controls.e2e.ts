import { test, expect } from "@/fixtures";
import type { GamePage } from "@/pages/game.page";
import { copy } from "@/data/copy";

const { rotateLeft, rotateRight, hyperspace, thrust, fire } = copy.a11y;

/** A deterministic start: the fake clock is frozen, so only clock.runFor moves the game. */
async function startFrozen(gamePage: GamePage): Promise<void> {
  await gamePage.page.clock.install({ time: new Date("2026-10-17T08:00:00Z") });
  await gamePage.page.clock.pauseAt(new Date("2026-10-17T08:00:01Z"));
  await gamePage.goto();
  await gamePage.start();
}

test("vào ván trên màn cảm ứng: năm nút, không có chữ gợi ý phím", { tag: ["@TC-TOUCH-001", "@smoke"] }, async ({ gamePage }) => {
  await gamePage.goto();
  await gamePage.menu.play().tap();
  await gamePage.hud.pauseButton().waitFor();
  for (const button of gamePage.touch.all()) await expect(button).toBeVisible();
  await expect(gamePage.hud.controlsHint()).toHaveCount(0);
});

test("năm nút và nút Tạm dừng đều không nhỏ hơn 44px", { tag: ["@TC-TOUCH-002", "@smoke"] }, async ({ gamePage }) => {
  await gamePage.goto();
  await gamePage.start();
  for (const button of [...gamePage.touch.all(), gamePage.hud.pauseButton()]) {
    const box = await button.boundingBox();
    expect(box, `${button}`).not.toBeNull();
    expect(box!.width, `${button} width`).toBeGreaterThanOrEqual(44);
    expect(box!.height, `${button} height`).toBeGreaterThanOrEqual(44);
  }
});

test("xoay bên trái, đẩy và bắn bên phải, dịch chuyển ở giữa, tất cả dưới khu vực chơi", { tag: ["@TC-TOUCH-003"] }, async ({ page, gamePage }) => {
  await gamePage.goto();
  await gamePage.start();
  const width = page.viewportSize()!.width;
  const height = page.viewportSize()!.height;
  const box = async (name: string) => (await gamePage.touch.button(name).boundingBox())!;
  const centre = (b: { x: number; width: number }) => b.x + b.width / 2;
  const [left, right, hyper, push, shoot] = await Promise.all([rotateLeft, rotateRight, hyperspace, thrust, fire].map(box));

  expect(centre(left)).toBeLessThan(width / 2);
  expect(centre(right)).toBeLessThan(width / 2);
  expect(centre(push)).toBeGreaterThan(width / 2);
  expect(centre(shoot)).toBeGreaterThan(width / 2);
  expect(hyper.x).toBeGreaterThan(right.x + right.width);
  expect(hyper.x + hyper.width).toBeLessThan(push.x);

  const canvas = (await gamePage.canvas().boundingBox())!;
  for (const b of [left, right, hyper, push, shoot]) {
    expect(b.y).toBeGreaterThanOrEqual(canvas.y + canvas.height);
    expect(b.y).toBeGreaterThan(height / 2);
  }
});

test("chạm và giữ nút không cuộn, không phóng to, không mở menu nhấn-giữ", { tag: ["@TC-TOUCH-004"] }, async ({ page, gamePage }) => {
  await page.clock.install();
  await gamePage.goto();
  await gamePage.start();
  const release = await gamePage.touch.hold(gamePage.touch.button(thrust));
  await page.clock.runFor(1000);
  await release();
  expect(await gamePage.scrollY()).toBe(0);
  expect(await gamePage.horizontalOverflow()).toBeLessThanOrEqual(0);
  expect(await gamePage.zoom()).toBe(1);
  for (const button of gamePage.touch.all()) {
    expect(await gamePage.touch.contextMenuBlocked(button), `${button}`).toBe(true);
  }
});

test("giữ nút Bắn thì tàu bắn suốt lúc giữ", { tag: ["@TC-TOUCH-005"] }, async ({ page, gamePage }) => {
  await startFrozen(gamePage);
  await page.clock.runFor(8000);
  const idle = await gamePage.hud.scoreValue();

  await gamePage.reload();
  await gamePage.start();
  const release = await gamePage.touch.hold(gamePage.touch.button(fire));
  await page.clock.runFor(8000);
  await release();
  expect(await gamePage.hud.scoreValue()).toBeGreaterThan(idle);
});
