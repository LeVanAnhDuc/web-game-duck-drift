import { test, expect } from "@/fixtures";
import { copy } from "@/data/copy";
import { PRESET_LIVES, STORAGE, entry, fullTable, type Preset } from "@/data/test-data";

const PRESETS: Preset[] = ["easy", "normal", "hard"];

test("ba tab, mở sẵn tab của mức đang chọn", { tag: ["@TC-HIGHSCORES-001", "@smoke"] }, async ({ gamePage }) => {
  await gamePage.seedStorage({ [STORAGE.difficulty]: "hard" });
  await gamePage.menu.openHighScores();
  const { highScores } = gamePage;
  await expect(highScores.tablist().getByRole("tab")).toHaveCount(3);
  for (const p of PRESETS) await expect(highScores.tab(p)).toHaveAttribute("aria-selected", String(p === "hard"));
});

test("mỗi dòng có hạng, tên, điểm, wave, ngày, điểm cao đứng trước", { tag: ["@TC-HIGHSCORES-002"] }, async ({ gamePage }) => {
  await gamePage.seedStorage({
    [STORAGE.scores.normal]: [entry("BOB", 300, 2), entry("ANA", 12_500, 9), entry("CAT", 4_000, 5)],
  });
  await gamePage.menu.openHighScores();
  const { highScores } = gamePage;
  await expect(highScores.columnHeaders()).toHaveText(copy.highScores.columns);
  expect(await highScores.row(0)).toEqual(["1", "ANA", "12.500", "9", "01/10/2026"]);
  expect(await highScores.row(1)).toEqual(["2", "CAT", "4.000", "5", "01/10/2026"]);
  expect(await highScores.row(2)).toEqual(["3", "BOB", "300", "2", "01/10/2026"]);
});

test("lưu 12 dòng thì chỉ hiện 10 dòng tốt nhất", { tag: ["@TC-HIGHSCORES-003"] }, async ({ gamePage }) => {
  await gamePage.seedStorage({ [STORAGE.scores.normal]: fullTable(12) });
  await gamePage.menu.openHighScores();
  await expect(gamePage.highScores.rows()).toHaveCount(10);
  expect((await gamePage.highScores.row(9)).slice(0, 3)).toEqual(["10", "RJJ", "4.100"]);
});

test("bảng trống nói rõ chưa có điểm ở mức đó và không có nút xoá", { tag: ["@TC-HIGHSCORES-004"] }, async ({ gamePage }) => {
  await gamePage.goto();
  await gamePage.menu.openHighScores();
  const { highScores } = gamePage;
  for (const p of PRESETS) {
    await highScores.tab(p).click();
    await expect(highScores.empty(p)).toBeVisible();
    await expect(highScores.anyClear()).toHaveCount(0);
  }
});

test("xoá bảng Khó chỉ mất bảng Khó, kể cả sau khi tải lại", { tag: ["@TC-HIGHSCORES-005", "@smoke"] }, async ({ gamePage }) => {
  await gamePage.seedStorage({
    [STORAGE.scores.easy]: [entry("EZY", 800)],
    [STORAGE.scores.normal]: [entry("MID", 600), entry("MOD", 500)],
    [STORAGE.scores.hard]: [entry("KHO", 400)],
  });
  const { highScores } = gamePage;
  const expectOthersIntact = async () => {
    await highScores.tab("easy").click();
    await expect(highScores.rows()).toHaveCount(1);
    await highScores.tab("normal").click();
    await expect(highScores.rows()).toHaveCount(2);
    await highScores.tab("hard").click();
    await expect(highScores.empty("hard")).toBeVisible();
  };

  await gamePage.menu.openHighScores();
  await highScores.tab("hard").click();
  await expect(highScores.anyClear()).toHaveText(copy.highScores.clearOf(copy.difficulty.hard));
  await highScores.clear("hard").click();
  await expect(highScores.empty("hard")).toBeVisible();
  await expect(highScores.anyClear()).toHaveCount(0);
  await expectOthersIntact();

  await gamePage.reload();
  await gamePage.menu.openHighScores();
  await expectOthersIntact();
});

test("dữ liệu hỏng bị bỏ qua, không crash", { tag: ["@TC-HIGHSCORES-006"] }, async ({ page, gamePage }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await gamePage.seedStorage({
    [STORAGE.scores.normal]: "RAW:[{oops",
    [STORAGE.scores.hard]: [
      entry("OKK", 700),
      entry("abc", 900),
      { ...entry("STR", 0), score: "999" },
      { initials: "NOA", score: 800, wave: 2 },
    ],
    [STORAGE.scores.easy]: { not: "an array" },
  });
  await gamePage.menu.openHighScores();
  const { highScores } = gamePage;
  await expect(highScores.empty("normal")).toBeVisible();
  await highScores.tab("easy").click();
  await expect(highScores.empty("easy")).toBeVisible();
  await highScores.tab("hard").click();
  await expect(highScores.rows()).toHaveCount(1);
  expect((await highScores.row(0)).slice(0, 3)).toEqual(["1", "OKK", "700"]);
  expect(errors).toEqual([]);
});

test("màn nói bảng chỉ lưu trên máy, Quay lại về màn hình chính", { tag: ["@TC-HIGHSCORES-007"] }, async ({ gamePage }) => {
  await gamePage.goto();
  await gamePage.menu.openHighScores();
  await expect(gamePage.highScores.localOnly()).toBeVisible();
  await gamePage.highScores.back().click();
  await expect(gamePage.menu.heading()).toBeVisible();
});

test("đổi tab không đổi mức sẽ chơi", { tag: ["@TC-HIGHSCORES-008"] }, async ({ gamePage }) => {
  await gamePage.goto();
  await gamePage.menu.openHighScores();
  await gamePage.highScores.tab("hard").click();
  await expect(gamePage.highScores.tab("hard")).toHaveAttribute("aria-selected", "true");
  await gamePage.highScores.back().click();
  await expect(gamePage.menu.preset("normal")).toHaveAttribute("aria-pressed", "true");
  await gamePage.start();
  await expect(gamePage.hud.livesGroup()).toHaveAttribute("aria-label", `${copy.hud.lives}: ${PRESET_LIVES.normal}`);
});
