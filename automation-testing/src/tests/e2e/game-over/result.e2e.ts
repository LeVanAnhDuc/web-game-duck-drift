import { test, expect } from "@/fixtures";
import { copy } from "@/data/copy";
import { PRESET_LIVES, STORAGE, entry, fullTable } from "@/data/test-data";

test("hết mạng thì màn Hết lượt hiện điểm, wave, hạng, và câu đọc lên khớp panel", { tag: ["@TC-GAMEOVER-001", "@smoke"] }, async ({ gamePage }) => {
  await gamePage.idleToGameOver();
  const { gameOver } = gamePage;
  await expect(gameOver.heading()).toBeVisible();
  const panelScore = (await gameOver.stat(copy.gameOver.score).textContent()) ?? "";
  await expect(gamePage.hud.score()).toHaveText(panelScore);
  await expect(gameOver.stat(copy.gameOver.wave)).toHaveText("1");
  await expect(gameOver.stat(copy.gameOver.rank)).not.toBeEmpty();
  await expect(gamePage.announcer()).toHaveText(copy.announce.gameOver(Number(panelScore.replace(/\D/g, ""))));
});

test("ván đầu tiên sau khi tải trang: bảng trống thì có hạng #1 và có form tên", { tag: ["@TC-GAMEOVER-002", "@smoke"] }, async ({ page, gamePage }) => {
  await gamePage.idleToGameOver();
  const { gameOver } = gamePage;
  await expect(gameOver.stat(copy.gameOver.rank)).toHaveText("#1");
  await expect(page.getByText(copy.gameOver.noRank)).toHaveCount(0);
  await expect(gameOver.initialsLabel()).toBeVisible();
  await expect(gameOver.initialsHelp()).toBeVisible();
  expect(await gameOver.initialsValue()).toBe("AAA");
  await expect(gameOver.initials()).toBeFocused();
});

test("hạng là hạng trong bảng của mức vừa chơi", { tag: ["@TC-GAMEOVER-003"] }, async ({ gamePage }) => {
  await gamePage.idleToGameOver("hard", {
    [STORAGE.scores.hard]: [entry("TOP", 100_000), entry("LOW", 1)],
    [STORAGE.scores.normal]: fullTable(),
  });
  await expect(gamePage.gameOver.stat(copy.gameOver.rank)).toHaveText("#2");
});

test("không lọt top 10 thì không hỏi tên, không cảnh báo, focus ở Chơi lại", { tag: ["@TC-GAMEOVER-008"] }, async ({ gamePage }) => {
  await gamePage.idleToGameOver("hard", { [STORAGE.scores.hard]: fullTable() });
  const { gameOver } = gamePage;
  await expect(gameOver.stat(copy.gameOver.rank)).toHaveText(copy.gameOver.noRank);
  await expect(gameOver.initials()).toHaveCount(0);
  await expect(gameOver.save()).toHaveCount(0);
  await expect(gameOver.unsavedWarning()).toHaveCount(0);
  await expect(gameOver.playAgain()).toBeFocused();
});

test("câu \"lọt bảng nhưng chưa lưu\" hiện khi có hạng và chưa lưu, biến mất khi đã lưu", { tag: ["@TC-GAMEOVER-009"] }, async ({ gamePage }) => {
  await gamePage.idleToGameOver();
  const { gameOver } = gamePage;
  await expect(gameOver.unsavedWarning()).toBeVisible();
  // Placed right above "Về menu", where the click that would lose the score happens.
  const warning = (await gameOver.unsavedWarning().boundingBox())!;
  const toMenu = (await gameOver.toMenu().boundingBox())!;
  expect(warning.y + warning.height).toBeLessThanOrEqual(toMenu.y);
  await gameOver.save().click();
  await expect(gamePage.highScores.heading()).toBeVisible();
  await expect(gameOver.unsavedWarning()).toHaveCount(0);
});

test("Chơi lại vào ván mới cùng mức; Về menu về màn hình chính", { tag: ["@TC-GAMEOVER-010"] }, async ({ gamePage }) => {
  await gamePage.idleToGameOver();
  await gamePage.gameOver.playAgain().click();
  await expect(gamePage.gameOver.heading()).toHaveCount(0);
  await expect(gamePage.hud.score()).toHaveText("0");
  await expect(gamePage.hud.livesGroup()).toHaveAttribute("aria-label", `${copy.hud.lives}: ${PRESET_LIVES.hard}`);

  await gamePage.runUntilGameOver();
  await gamePage.gameOver.toMenu().click();
  await expect(gamePage.menu.heading()).toBeVisible();
});

test("localStorage bị chặn: hết lượt không lỗi và không hỏi tên", { tag: ["@TC-GAMEOVER-011"] }, async ({ page, gamePage }) => {
  // BUG: defects/game-over.md#bug-gameover-01
  test.fail();
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await gamePage.blockStorage();
  await gamePage.idleToGameOver();
  await expect(gamePage.gameOver.heading()).toBeVisible();
  expect(errors).toEqual([]);
  await expect(gamePage.gameOver.initials()).toHaveCount(0);
  await expect(gamePage.gameOver.save()).toHaveCount(0);
});
