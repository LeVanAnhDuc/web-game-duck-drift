import { test, expect } from "@/fixtures";
import { copy } from "@/data/copy";
import { STORAGE, entry } from "@/data/test-data";

test("gõ chữ và mũi tên đổi được ba ký tự tên", { tag: ["@TC-GAMEOVER-004"] }, async ({ page, gamePage }) => {
  await gamePage.idleToGameOver();
  const { gameOver } = gamePage;
  await expect(gameOver.initials()).toBeFocused();
  await page.keyboard.type("duc");
  expect(await gameOver.initialsValue()).toBe("DUC");
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowUp");
  expect(await gameOver.initialsValue()).toBe("EUC");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  expect(await gameOver.initialsValue()).toBe("CUC");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowDown");
  expect(await gameOver.initialsValue()).toBe("CTC");
});

test("nút ▲/▼ đổi từng ô, chạy vòng A↔Z", { tag: ["@TC-GAMEOVER-005"] }, async ({ gamePage }) => {
  await gamePage.idleToGameOver();
  const { gameOver } = gamePage;
  await gameOver.bump(1, "−").click();
  await gameOver.bump(3, "+").click();
  await gameOver.bump(3, "+").click();
  expect(await gameOver.initialsValue()).toBe("ZAC");
});

test("Lưu điểm mở Bảng điểm đúng mức, dòng mới đúng hạng và được làm nổi, còn sau khi tải lại", { tag: ["@TC-GAMEOVER-006", "@smoke"] }, async ({ page, gamePage }) => {
  await gamePage.idleToGameOver("hard", { [STORAGE.scores.hard]: [entry("TOP", 100_000), entry("LOW", 1)] });
  const score = (await gamePage.gameOver.stat(copy.gameOver.score).textContent()) ?? "";
  await page.keyboard.type("duc");
  await gamePage.gameOver.save().click();

  const { highScores } = gamePage;
  await expect(highScores.heading()).toBeVisible();
  await expect(highScores.tab("hard")).toHaveAttribute("aria-selected", "true");
  expect((await highScores.row(1)).slice(0, 4)).toEqual(["2", "DUC", score, "1"]);
  expect(await highScores.highlightedRows()).toEqual([1]);

  await gamePage.reload();
  await gamePage.menu.openHighScores();
  await expect(highScores.tab("hard")).toHaveAttribute("aria-selected", "true");
  expect((await highScores.row(1)).slice(0, 3)).toEqual(["2", "DUC", score]);
  await highScores.tab("normal").click();
  await expect(highScores.empty("normal")).toBeVisible();
});

test("lưu mà không đổi tên thì tên là AAA", { tag: ["@TC-GAMEOVER-007"] }, async ({ gamePage }) => {
  await gamePage.idleToGameOver();
  await gamePage.gameOver.save().click();
  await expect(gamePage.highScores.heading()).toBeVisible();
  expect((await gamePage.highScores.row(0)).slice(0, 2)).toEqual(["1", "AAA"]);
});
