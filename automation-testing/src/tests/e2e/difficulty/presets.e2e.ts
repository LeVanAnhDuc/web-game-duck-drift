import { test, expect } from "@/fixtures";
import { copy } from "@/data/copy";
import { PRESET_LIVES, STORAGE, entry, type Preset } from "@/data/test-data";

const PRESETS: Preset[] = ["easy", "normal", "hard"];

test("ba mức ở menu, Thường được chọn sẵn", { tag: ["@TC-DIFFICULTY-001", "@smoke"] }, async ({ gamePage }) => {
  await gamePage.goto();
  const { menu } = gamePage;
  await expect(menu.difficultyGroup().getByRole("button")).toHaveCount(3);
  await expect(menu.preset("easy")).toHaveAttribute("aria-pressed", "false");
  await expect(menu.preset("normal")).toHaveAttribute("aria-pressed", "true");
  await expect(menu.preset("hard")).toHaveAttribute("aria-pressed", "false");
});

test("đổi mức thì chỉ mức đó được chọn và dòng điểm đổi sang bảng của mức đó", { tag: ["@TC-DIFFICULTY-002"] }, async ({ gamePage }) => {
  await gamePage.seedStorage({ [STORAGE.scores.hard]: [entry("KHO", 900)] });
  const { menu } = gamePage;

  await menu.choose("hard");
  for (const p of PRESETS) await expect(menu.preset(p)).toHaveAttribute("aria-pressed", String(p === "hard"));
  await expect(menu.bestLine()).toHaveText(copy.menu.bestOf(copy.difficulty.hard, "900"));

  await menu.choose("easy");
  for (const p of PRESETS) await expect(menu.preset(p)).toHaveAttribute("aria-pressed", String(p === "easy"));
  await expect(menu.bestLine()).toHaveText(copy.menu.noBestOf(copy.difficulty.easy));
});

test("lựa chọn mức sống qua một lần tải lại trang", { tag: ["@TC-DIFFICULTY-003"] }, async ({ gamePage }) => {
  await gamePage.goto();
  await gamePage.menu.choose("hard");
  await expect(gamePage.menu.preset("hard")).toHaveAttribute("aria-pressed", "true");
  await gamePage.reload();
  await expect(gamePage.menu.preset("hard")).toHaveAttribute("aria-pressed", "true");
  await expect(gamePage.menu.preset("normal")).toHaveAttribute("aria-pressed", "false");
});

test("mỗi mức vào ván với đúng số mạng của nó", { tag: ["@TC-DIFFICULTY-004", "@smoke"] }, async ({ gamePage }) => {
  for (const preset of PRESETS) {
    await gamePage.goto();
    await gamePage.menu.choose(preset);
    await gamePage.start();
    // Read right away: the ship is invulnerable for its first 2 seconds, so no life can be lost yet.
    await expect(gamePage.hud.livesGroup(), preset).toHaveAttribute("aria-label", `${copy.hud.lives}: ${PRESET_LIVES[preset]}`);
  }
});

test("giá trị mức lưu không hợp lệ thì menu về Thường", { tag: ["@TC-DIFFICULTY-005"] }, async ({ page, gamePage }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const stored of ["nightmare", "custom", "RAW:{bad"]) {
    await gamePage.seedStorage({ [STORAGE.difficulty]: stored });
    await expect(gamePage.menu.preset("normal"), stored).toHaveAttribute("aria-pressed", "true");
  }
  expect(errors).toEqual([]);
});

test("localStorage bị chặn: vẫn chọn và chơi được mức Khó, tải lại thì không nhớ", { tag: ["@TC-DIFFICULTY-006"] }, async ({ page, gamePage }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await gamePage.blockStorage();
  await gamePage.goto();
  await gamePage.menu.choose("hard");
  await expect(gamePage.menu.preset("hard")).toHaveAttribute("aria-pressed", "true");
  await gamePage.start();
  await expect(gamePage.hud.livesGroup()).toHaveAttribute("aria-label", `${copy.hud.lives}: ${PRESET_LIVES.hard}`);
  await gamePage.reload();
  await expect(gamePage.menu.preset("normal")).toHaveAttribute("aria-pressed", "true");
  expect(errors).toEqual([]);
});
