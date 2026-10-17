import type { Locator, Page } from "@playwright/test";
import { BasePage } from "./base.page";
import { copy } from "@/data/copy";
import type { Preset } from "@/data/test-data";

const PRESET_NAME: Record<Preset, string> = {
  easy: copy.difficulty.easy,
  normal: copy.difficulty.normal,
  hard: copy.difficulty.hard,
};

export function presetName(preset: Preset): string {
  return PRESET_NAME[preset];
}

/**
 * The game is one screen whose content follows the game phase: menu, custom, help, high scores, and while playing
 * the HUD + canvas with two overlays (pause, game over). Every URL is relative ("./") so the same object works under
 * GitHub Pages' /web-game-duck-drift/ base path.
 */
export class GamePage extends BasePage {
  readonly menu: MenuScreen;
  readonly hud: Hud;
  readonly pause: PauseOverlay;
  readonly gameOver: GameOverOverlay;
  readonly highScores: HighScoresScreen;
  readonly help: HelpScreen;
  readonly custom: CustomScreen;
  readonly touch: TouchControls;
  readonly account: AccountMenu;

  constructor(page: Page) {
    super(page);
    this.menu = new MenuScreen(page);
    this.hud = new Hud(page);
    this.pause = new PauseOverlay(page);
    this.gameOver = new GameOverOverlay(page);
    this.highScores = new HighScoresScreen(page);
    this.help = new HelpScreen(page);
    this.custom = new CustomScreen(page);
    this.touch = new TouchControls(page);
    this.account = new AccountMenu(page);
  }

  // ── navigation ──────────────────────────────────────────────────────────

  /** Opens the game and waits until React has hydrated the menu. */
  async goto(query = ""): Promise<void> {
    await this.page.goto(query ? `./?${query}` : "./");
    await this.waitHydrated();
  }

  /**
   * A click that lands before hydration is lost (no listener yet). The menu's Play button takes focus on mount
   * (autoFocus is applied by React, not by the static HTML), so a focused Play button means the menu answers.
   */
  async waitHydrated(): Promise<void> {
    await this.page.waitForFunction(() => {
      const el = document.activeElement;
      return !!el && el.tagName === "BUTTON" && el.textContent?.trim() === "Chơi";
    });
  }

  async reload(): Promise<void> {
    await this.page.reload();
    await this.waitHydrated();
  }

  /**
   * Writes values into the game's own localStorage keys, then reloads so the app reads them on mount. Once only:
   * whatever the app writes afterwards survives later reloads.
   */
  async seedStorage(values: Record<string, unknown>): Promise<void> {
    await this.page.goto("./");
    await this.page.evaluate((items) => {
      localStorage.clear();
      for (const [key, value] of Object.entries(items)) {
        localStorage.setItem(key, typeof value === "string" && value.startsWith("RAW:") ? value.slice(4) : JSON.stringify(value));
      }
    }, values);
    await this.reload();
  }

  /** Makes every touch of localStorage throw, the way a privacy mode or a blocked-site setting does. */
  async blockStorage(): Promise<void> {
    await this.page.addInitScript(() => {
      Object.defineProperty(window, "localStorage", {
        configurable: true,
        get() {
          throw new DOMException("The operation is insecure.", "SecurityError");
        },
      });
    });
  }

  /** Reads one key of the game's storage as parsed JSON (null when absent). */
  async stored(key: string): Promise<unknown> {
    return this.page.evaluate((k) => {
      const raw = localStorage.getItem(k);
      return raw === null ? null : JSON.parse(raw);
    }, key);
  }

  // ── playing ─────────────────────────────────────────────────────────────

  /** Presses Play on the menu and waits for the HUD. */
  async start(): Promise<void> {
    await this.menu.play().click();
    await this.hud.pauseButton().waitFor();
  }

  /**
   * Lets the simulation run until the game is over. Needs page.clock installed before goto(): the loop reads
   * performance.now and requestAnimationFrame, both faked, so an idle Hard game ends in ~20 fake seconds.
   */
  async runUntilGameOver(maxSeconds = 180): Promise<void> {
    for (let s = 0; s < maxSeconds; s += 2) {
      if (await this.gameOver.heading().isVisible()) return;
      await this.page.clock.runFor(2000);
    }
    await this.gameOver.heading().waitFor({ timeout: 1000 });
  }

  /**
   * The way a player who freezes reaches the game-over screen: a fresh page on a fake clock, optional stored data,
   * the preset chosen on the menu (Hard by default: fewest lives), Play, then nothing until the last life is gone.
   */
  async idleToGameOver(preset: Preset = "hard", storage?: Record<string, unknown>): Promise<void> {
    await this.page.clock.install();
    if (storage) await this.seedStorage(storage);
    else await this.goto();
    await this.menu.choose(preset);
    await this.start();
    await this.runUntilGameOver();
  }

  /** Sends a key press the game listens for on window (the keyboard handler is not bound to a focused element). */
  async press(key: string): Promise<void> {
    await this.page.keyboard.press(key);
  }

  /**
   * Dispatches a cancelable keydown on window (where the game listens) and reports whether the game claimed it
   * with preventDefault — the same call that stops the browser from scrolling or pressing a focused button.
   */
  async keyIsClaimed(code: string): Promise<boolean> {
    return this.page.evaluate((c) => {
      const down = new KeyboardEvent("keydown", { code: c, bubbles: true, cancelable: true });
      window.dispatchEvent(down);
      window.dispatchEvent(new KeyboardEvent("keyup", { code: c, bubbles: true, cancelable: true }));
      return down.defaultPrevented;
    }, code);
  }

  async scrollY(): Promise<number> {
    return this.page.evaluate(() => window.scrollY);
  }

  canvas(): Locator {
    return this.page.getByRole("img", { name: copy.a11y.canvasLabel });
  }

  /** The polite live region the game announces through (NFR-A11Y-06). */
  announcer(): Locator {
    return this.page.locator('[aria-live="polite"]');
  }

  /** The pinch-zoom factor of the visual viewport (1 = not zoomed). */
  async zoom(): Promise<number> {
    return this.page.evaluate(() => window.visualViewport?.scale ?? 1);
  }

  /** How far the page scrolls sideways; > 0 means content overflows the viewport. */
  async horizontalOverflow(): Promise<number> {
    return this.page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  }

  /** Simulates the tab going to the background (the browser's own signal, visibilitychange). */
  async hideTab(): Promise<void> {
    await this.page.evaluate(() => {
      Object.defineProperty(document, "visibilityState", { value: "hidden", configurable: true });
      document.dispatchEvent(new Event("visibilitychange"));
    });
  }

  /** Simulates the window losing focus (another app, the address bar). */
  async blurWindow(): Promise<void> {
    await this.page.evaluate(() => window.dispatchEvent(new Event("blur")));
  }
}

export class MenuScreen {
  constructor(readonly page: Page) {}

  heading(): Locator {
    return this.page.getByRole("heading", { name: copy.menu.title, exact: true });
  }
  play(): Locator {
    return this.page.getByRole("button", { name: copy.menu.play, exact: true });
  }
  highScoresButton(): Locator {
    return this.page.getByRole("button", { name: copy.menu.highScores, exact: true });
  }
  helpButton(): Locator {
    return this.page.getByRole("button", { name: copy.menu.help, exact: true });
  }
  customButton(): Locator {
    return this.page.getByRole("button", { name: copy.menu.custom, exact: true });
  }
  difficultyGroup(): Locator {
    return this.page.getByRole("group", { name: copy.difficulty.label });
  }
  preset(preset: Preset): Locator {
    return this.difficultyGroup().getByRole("button", { name: presetName(preset), exact: true });
  }
  async choose(preset: Preset): Promise<void> {
    await this.preset(preset).click();
  }
  /** The best-score line under the buttons ("Điểm cao nhất — …" or "Chưa có điểm nào — …"). */
  bestLine(): Locator {
    return this.page.getByText(/^(Điểm cao nhất|Chưa có điểm nào) — /);
  }
  localNote(): Locator {
    return this.page.getByText(copy.menu.localNote, { exact: true });
  }
  /** The column that holds the title, the buttons and the lines under them. */
  column(): Locator {
    return this.heading().locator("xpath=..");
  }
  async openHighScores(): Promise<void> {
    await this.highScoresButton().click();
    await this.page.getByRole("heading", { name: copy.highScores.title, exact: true }).waitFor();
  }
  async openHelp(): Promise<void> {
    await this.helpButton().click();
    await this.page.getByRole("heading", { name: copy.help.title, exact: true }).waitFor();
  }
  async openCustom(): Promise<void> {
    await this.customButton().click();
    await this.page.getByRole("heading", { name: copy.custom.title, exact: true }).waitFor();
  }
}

export class Hud {
  constructor(readonly page: Page) {}

  score(): Locator {
    return this.page.getByTestId("hud-score");
  }
  wave(): Locator {
    return this.page.getByTestId("hud-wave");
  }
  /** The ship pips; the group is labelled "Mạng: N". */
  livesGroup(): Locator {
    return this.page.getByLabel(new RegExp(`^${copy.hud.lives}: \\d+$`));
  }
  async lives(): Promise<number> {
    const label = (await this.livesGroup().getAttribute("aria-label")) ?? "";
    return Number(label.split(":")[1]);
  }
  async scoreValue(): Promise<number> {
    return Number(((await this.score().textContent()) ?? "").replace(/\D/g, ""));
  }
  pauseButton(): Locator {
    return this.page.getByRole("button", { name: copy.hud.pause, exact: true });
  }
  /** The keyboard hint under the canvas (mouse/keyboard devices only). */
  controlsHint(): Locator {
    return this.page.getByText(new RegExp(`^${copy.hud.controlsHint} `));
  }
}

export class PauseOverlay {
  constructor(readonly page: Page) {}

  heading(): Locator {
    return this.page.getByRole("heading", { name: copy.pause.title, exact: true });
  }
  resume(): Locator {
    return this.page.getByRole("button", { name: copy.pause.resume, exact: true });
  }
  toMenu(): Locator {
    return this.page.getByRole("button", { name: copy.pause.toMenu, exact: true });
  }
  warning(): Locator {
    return this.page.getByText(/^Về menu là bỏ ván này\./);
  }
}

export class GameOverOverlay {
  constructor(readonly page: Page) {}

  heading(): Locator {
    return this.page.getByRole("heading", { name: copy.gameOver.title, exact: true });
  }
  panel(): Locator {
    return this.heading().locator("xpath=..");
  }
  /** The value next to a stat label ("Điểm", "Wave", "Hạng"). */
  stat(label: string): Locator {
    return this.panel().getByText(label, { exact: true }).locator("xpath=following-sibling::span[1]");
  }
  customNoSave(): Locator {
    return this.page.getByText(copy.gameOver.customNoSave, { exact: true });
  }
  initials(): Locator {
    return this.page.getByRole("group", { name: copy.gameOver.enterName });
  }
  /** The visible label above the initials (not the group's aria-label). */
  initialsLabel(): Locator {
    return this.panel().getByText(copy.gameOver.enterName, { exact: true });
  }
  initialsHelp(): Locator {
    return this.page.getByText(copy.gameOver.initialsHelp, { exact: true });
  }
  async initialsValue(): Promise<string> {
    return ((await this.initials().innerText()) ?? "").replace(/[^A-Z]/g, "");
  }
  /** The ▲ / ▼ button of the n-th letter (1-based). */
  bump(n: 1 | 2 | 3, direction: "+" | "−"): Locator {
    return this.page.getByRole("button", { name: `${copy.gameOver.enterName} ${n} ${direction}`, exact: true });
  }
  save(): Locator {
    return this.page.getByRole("button", { name: copy.gameOver.save, exact: true });
  }
  playAgain(): Locator {
    return this.page.getByRole("button", { name: copy.gameOver.playAgain, exact: true });
  }
  toMenu(): Locator {
    return this.panel().getByRole("button", { name: copy.gameOver.toMenu, exact: true });
  }
  unsavedWarning(): Locator {
    return this.page.getByText(copy.gameOver.unsavedWarning, { exact: true });
  }
}

export class HighScoresScreen {
  constructor(readonly page: Page) {}

  heading(): Locator {
    return this.page.getByRole("heading", { name: copy.highScores.title, exact: true });
  }
  tablist(): Locator {
    return this.page.getByRole("tablist", { name: copy.highScores.tabsLabel });
  }
  tab(preset: Preset): Locator {
    return this.tablist().getByRole("tab", { name: presetName(preset), exact: true });
  }
  panel(): Locator {
    return this.page.getByRole("tabpanel");
  }
  /** Body rows of the table. */
  rows(): Locator {
    return this.panel().locator("tbody tr");
  }
  /** One row as its visible cells: [rank, initials, score, wave, (date)]. */
  async row(index: number): Promise<string[]> {
    return (await this.rows().nth(index).locator("td:visible").allInnerTexts()).map((t) => t.trim());
  }
  /** Indexes of the rows drawn with a background (the row just saved is highlighted, the others are not). */
  async highlightedRows(): Promise<number[]> {
    return this.rows().evaluateAll((rows) =>
      rows.flatMap((row, i) => {
        const bg = getComputedStyle(row).backgroundColor;
        return bg === "rgba(0, 0, 0, 0)" || bg === "transparent" ? [] : [i];
      }),
    );
  }
  columnHeaders(): Locator {
    return this.panel().locator("thead th:visible");
  }
  empty(preset: Preset): Locator {
    return this.page.getByText(copy.highScores.emptyOf(presetName(preset)), { exact: true });
  }
  clear(preset: Preset): Locator {
    return this.page.getByRole("button", { name: copy.highScores.clearOf(presetName(preset)), exact: true });
  }
  anyClear(): Locator {
    return this.page.getByRole("button", { name: /^Xoá bảng / });
  }
  localOnly(): Locator {
    return this.page.getByText(copy.highScores.localOnly, { exact: true });
  }
  back(): Locator {
    return this.page.getByRole("button", { name: copy.highScores.back, exact: true });
  }
}

export class HelpScreen {
  constructor(readonly page: Page) {}

  heading(): Locator {
    return this.page.getByRole("heading", { name: copy.help.title, exact: true });
  }
  /** The value (<dd>) of a term (<dt>) in the controls or scoring list. */
  definition(term: string): Locator {
    return this.page.locator("dt", { hasText: new RegExp(`^${term}$`) }).locator("xpath=following-sibling::dd[1]");
  }
  /** A power-up's list item: its name, its description and its shape (an svg mark). */
  powerUp(name: string): Locator {
    return this.page.getByRole("listitem").filter({ hasText: name });
  }
  back(): Locator {
    return this.page.getByRole("button", { name: copy.help.back, exact: true });
  }
}

export class CustomScreen {
  constructor(readonly page: Page) {}

  heading(): Locator {
    return this.page.getByRole("heading", { name: copy.custom.title, exact: true });
  }
  sliders(): Locator {
    return this.page.getByRole("slider");
  }
  slider(label: string): Locator {
    return this.page.getByLabel(label, { exact: true });
  }
  /** The number shown next to a slider's label. */
  shown(label: string): Locator {
    return this.page.locator("label", { hasText: new RegExp(`^${label}$`) }).locator("xpath=following-sibling::span[1]");
  }
  notSaved(): Locator {
    return this.page.getByText(copy.custom.notSaved, { exact: true });
  }
  play(): Locator {
    return this.page.getByRole("button", { name: copy.custom.play, exact: true });
  }
  back(): Locator {
    return this.page.getByRole("button", { name: copy.custom.back, exact: true });
  }
  /** Moves a slider with the keyboard: focus it, then press keys (Home/End/arrows). */
  async press(label: string, ...keys: string[]): Promise<void> {
    await this.slider(label).focus();
    for (const key of keys) await this.page.keyboard.press(key);
  }
}

export class TouchControls {
  constructor(readonly page: Page) {}

  /**
   * Puts a real finger on a button through CDP and keeps it there until the returned release is called. A synthetic
   * pointerdown is not enough: the hold button captures the pointer, and setPointerCapture rejects a pointer id the
   * browser never saw go down.
   */
  async hold(target: Locator): Promise<() => Promise<void>> {
    const box = (await target.boundingBox())!;
    const cdp = await this.page.context().newCDPSession(this.page);
    const point = { x: box.x + box.width / 2, y: box.y + box.height / 2, id: 1 };
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [point] });
    return async () => {
      await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
      await cdp.detach();
    };
  }

  /** Whether a long-press menu would open: dispatches contextmenu on the button and reports if it was cancelled. */
  async contextMenuBlocked(target: Locator): Promise<boolean> {
    return target.evaluate((el) => {
      const ev = new MouseEvent("contextmenu", { bubbles: true, cancelable: true });
      el.dispatchEvent(ev);
      return ev.defaultPrevented;
    });
  }

  button(name: string): Locator {
    return this.page.getByRole("button", { name, exact: true });
  }
  all(): Locator[] {
    const a = copy.a11y;
    return [a.rotateLeft, a.rotateRight, a.hyperspace, a.thrust, a.fire].map((n) => this.button(n));
  }
}

export class AccountMenu {
  constructor(readonly page: Page) {}

  /** The idle-state button, matched exactly: the in-flight label "Đang đăng nhập…" is a different name. */
  signIn(): Locator {
    return this.page.getByRole("button", { name: copy.account.signIn, exact: true });
  }
  signingIn(): Locator {
    return this.page.getByRole("button", { name: copy.account.signingIn, exact: true });
  }
  trigger(): Locator {
    return this.page.getByRole("button", { name: copy.account.menuLabel, exact: true });
  }
  menu(): Locator {
    return this.page.getByRole("menu", { name: copy.account.menuLabel });
  }
  profileLink(): Locator {
    return this.page.getByRole("menuitem", { name: copy.account.openProfile });
  }
  signOut(): Locator {
    return this.page.getByRole("menuitem", { name: copy.account.signOut });
  }
}
