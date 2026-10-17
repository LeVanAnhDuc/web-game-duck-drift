import { GamePage } from "@/pages/game.page";
import { test as core } from "./core.fixture";

// One fixture per page object, named like the class in camelCase. The game is a single screen: GamePage carries its
// screens and overlays (menu, HUD, pause, game over, high scores, help, custom, touch, account) as properties.
export const test = core.extend<{ gamePage: GamePage }>({
  gamePage: async ({ page }, use) => use(new GamePage(page)),
});
