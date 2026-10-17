import { test, expect } from "@/fixtures";
import { copy } from "@/data/copy";

test("canvas có nhãn thay thế", { tag: ["@TC-ACCESSIBILITY-005"] }, async ({ page, gamePage }) => {
  await gamePage.goto();
  await expect(page.getByRole("img")).toHaveCount(1);
  await expect(gamePage.canvas()).toHaveCount(1);
  await gamePage.start();
  await expect(gamePage.canvas()).toBeVisible();
});

test("đúng một vùng thông báo polite, có sẵn từ menu", { tag: ["@TC-ACCESSIBILITY-006"] }, async ({ page, gamePage }) => {
  // Polite regions only: Next.js adds its own empty, assertive route announcer (inside a shadow root) to every page.
  const polite = page.locator('[aria-live="polite"]');
  await gamePage.goto();
  await expect(polite).toHaveCount(1);
  await expect(gamePage.announcer()).toHaveAttribute("aria-atomic", "true");
  await gamePage.start();
  await expect(polite).toHaveCount(1);
  await expect(gamePage.announcer()).toHaveText(copy.announce.waveStart(1));
});

test("mức đang chọn không chỉ khác màu", { tag: ["@TC-ACCESSIBILITY-007"] }, async ({ gamePage }) => {
  await gamePage.goto();
  const look = (preset: "easy" | "normal") =>
    gamePage.menu.preset(preset).evaluate((el) => ({
      weight: Number(getComputedStyle(el).fontWeight),
      dots: el.querySelectorAll('span[aria-hidden="true"]').length,
    }));
  const chosen = await look("normal");
  const other = await look("easy");
  await expect(gamePage.menu.preset("normal")).toHaveAttribute("aria-pressed", "true");
  expect(chosen.weight).toBeGreaterThan(other.weight);
  expect(chosen.dots).toBe(1);
  expect(other.dots).toBe(0);
});

test("trang khai báo tiếng Việt", { tag: ["@TC-ACCESSIBILITY-010"] }, async ({ page, gamePage }) => {
  await gamePage.goto();
  await expect(page.locator("html")).toHaveAttribute("lang", "vi");
});
