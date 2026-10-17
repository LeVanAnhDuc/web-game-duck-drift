import { test, expect } from "@/fixtures";
import { copy } from "@/data/copy";
import { STORAGE, entry } from "@/data/test-data";

const { startLives, asteroidSpeed, dropChance, ufoFirstWave } = copy.custom;
const KNOBS = [startLives, asteroidSpeed, dropChance, ufoFirstWave];

test("bốn thanh trượt có nhãn, lần đầu bằng mức Thường", { tag: ["@TC-CUSTOM-001", "@smoke"] }, async ({ gamePage }) => {
  await gamePage.goto();
  await gamePage.menu.openCustom();
  const { custom } = gamePage;
  await expect(custom.sliders()).toHaveCount(4);
  const expected = ["3", "1.0×", "8%", "3"];
  for (const [i, label] of KNOBS.entries()) {
    await expect(custom.slider(label)).toBeVisible();
    await expect(custom.shown(label)).toHaveText(expected[i]);
  }
});

test("Home và End đưa bốn thanh về đúng hai biên", { tag: ["@TC-CUSTOM-002"] }, async ({ gamePage }) => {
  await gamePage.goto();
  await gamePage.menu.openCustom();
  const { custom } = gamePage;
  const lows = ["1", "0.6×", "0%", "1"];
  const highs = ["6", "1.6×", "30%", copy.custom.ufoOff];
  for (const [i, label] of KNOBS.entries()) {
    await custom.press(label, "Home");
    await expect(custom.shown(label)).toHaveText(lows[i]);
    await expect(custom.slider(label)).toHaveAttribute("aria-valuetext", lows[i]);
    await custom.press(label, "End");
    await expect(custom.shown(label)).toHaveText(highs[i]);
    await expect(custom.slider(label)).toHaveAttribute("aria-valuetext", highs[i]);
  }
});

test("mũi tên đổi đúng một bước trên cả bốn thanh", { tag: ["@TC-CUSTOM-003"] }, async ({ gamePage }) => {
  await gamePage.goto();
  await gamePage.menu.openCustom();
  const { custom } = gamePage;
  const oneUp = ["2", "0.7×", "1%", "2"];
  for (const [i, label] of KNOBS.entries()) {
    await custom.press(label, "Home", "ArrowRight");
    await expect(custom.shown(label)).toHaveText(oneUp[i]);
  }
});

test("mốc cuối của thanh UFO ghi \"tắt\", ngay dưới đó là wave 9", { tag: ["@TC-CUSTOM-004"] }, async ({ gamePage }) => {
  await gamePage.goto();
  await gamePage.menu.openCustom();
  const { custom } = gamePage;
  await custom.press(ufoFirstWave, "End");
  await expect(custom.shown(ufoFirstWave)).toHaveText(copy.custom.ufoOff);
  await expect(custom.slider(ufoFirstWave)).toHaveAttribute("aria-valuetext", copy.custom.ufoOff);
  await custom.press(ufoFirstWave, "ArrowLeft");
  await expect(custom.shown(ufoFirstWave)).toHaveText("9");
});

test("dòng \"không được ghi vào bảng điểm\" nằm trên nút Chơi", { tag: ["@TC-CUSTOM-005"] }, async ({ gamePage }) => {
  await gamePage.goto();
  await gamePage.menu.openCustom();
  await expect(gamePage.custom.notSaved()).toBeVisible();
  const note = (await gamePage.custom.notSaved().boundingBox())!;
  const play = (await gamePage.custom.play().boundingBox())!;
  expect(note.y + note.height).toBeLessThanOrEqual(play.y);
});

test("Chơi vào ván với số mạng đã đặt", { tag: ["@TC-CUSTOM-006", "@smoke"] }, async ({ gamePage }) => {
  await gamePage.goto();
  await gamePage.menu.openCustom();
  await gamePage.custom.press(startLives, "End");
  await gamePage.custom.play().click();
  await expect(gamePage.hud.livesGroup()).toHaveAttribute("aria-label", `${copy.hud.lives}: 6`);
});

test("hết lượt ván tuỳ chỉnh: không hạng, không hỏi tên, bảng điểm không đổi", { tag: ["@TC-CUSTOM-007", "@smoke"] }, async ({ page, gamePage }) => {
  await page.clock.install();
  await gamePage.seedStorage({ [STORAGE.scores.normal]: [entry("OLD", 50)] });
  const scoreKeys = Object.values(STORAGE.scores);
  const before = await Promise.all(scoreKeys.map((k) => gamePage.stored(k)));

  await gamePage.menu.openCustom();
  await gamePage.custom.press(startLives, "Home");
  await gamePage.custom.press(asteroidSpeed, "End");
  await gamePage.custom.play().click();
  await gamePage.runUntilGameOver();

  const { gameOver } = gamePage;
  await expect(gameOver.stat(copy.gameOver.score)).not.toBeEmpty();
  await expect(gameOver.stat(copy.gameOver.wave)).not.toBeEmpty();
  await expect(gameOver.panel().getByText(copy.gameOver.rank, { exact: true })).toHaveCount(0);
  await expect(gameOver.customNoSave()).toBeVisible();
  await expect(gameOver.initials()).toHaveCount(0);
  await expect(gameOver.save()).toHaveCount(0);
  expect(await Promise.all(scoreKeys.map((k) => gamePage.stored(k)))).toEqual(before);
});

test("bốn số được nhớ sau khi tải lại", { tag: ["@TC-CUSTOM-008"] }, async ({ gamePage }) => {
  await gamePage.goto();
  await gamePage.menu.openCustom();
  const { custom } = gamePage;
  await custom.press(startLives, "End", "ArrowLeft");
  await custom.press(asteroidSpeed, "Home", ...Array(6).fill("ArrowRight"));
  await custom.press(dropChance, "Home", ...Array(15).fill("ArrowRight"));
  await custom.press(ufoFirstWave, "End");
  const expected = ["5", "1.2×", "15%", copy.custom.ufoOff];
  for (const [i, label] of KNOBS.entries()) await expect(custom.shown(label)).toHaveText(expected[i]);

  await gamePage.reload();
  await gamePage.menu.openCustom();
  for (const [i, label] of KNOBS.entries()) await expect(custom.shown(label)).toHaveText(expected[i]);
});

test("số lưu ngoài biên kéo về biên, trường hỏng chỉ trường đó về mặc định", { tag: ["@TC-CUSTOM-009"] }, async ({ page, gamePage }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await gamePage.seedStorage({ [STORAGE.tuning]: { startLives: 99, asteroidSpeed: 0.1, dropChance: "x", ufoFirstWave: 4 } });
  await gamePage.menu.openCustom();
  const expected = ["6", "0.6×", "8%", "4"];
  for (const [i, label] of KNOBS.entries()) await expect(gamePage.custom.shown(label)).toHaveText(expected[i]);
  await gamePage.custom.play().click();
  await expect(gamePage.hud.livesGroup()).toHaveAttribute("aria-label", `${copy.hud.lives}: 6`);
  expect(errors).toEqual([]);
});

test("Về menu về màn hình chính, mức ở menu không đổi", { tag: ["@TC-CUSTOM-010"] }, async ({ gamePage }) => {
  await gamePage.seedStorage({ [STORAGE.difficulty]: "hard" });
  await gamePage.menu.openCustom();
  await gamePage.custom.back().click();
  await expect(gamePage.menu.heading()).toBeVisible();
  await expect(gamePage.menu.preset("hard")).toHaveAttribute("aria-pressed", "true");
});
