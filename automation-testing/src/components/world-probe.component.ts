import type { Page } from "@playwright/test";

/** What a test may read of one body in the game world (world units, ms). */
export interface BodyView {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface AsteroidView extends BodyView {
  size: "large" | "medium" | "small";
}

/** A read-only copy of the parts of the live GameState the gameplay specs look at. */
export interface WorldView {
  phase: string;
  score: number;
  lives: number;
  wave: number;
  ship: BodyView & { angle: number; alive: boolean; invulnMs: number; hyperMs: number; shield: boolean; weapon: string | null; weaponMs: number };
  asteroids: AsteroidView[];
  /** Bullets fired by the ship (UFO bullets left out). */
  bullets: BodyView[];
  powerUps: (BodyView & { kind: string })[];
}

/** A body to place: position and velocity in world units; size for an asteroid. */
export interface Placement {
  x: number;
  y: number;
  vx?: number;
  vy?: number;
}

export type PowerUpKind = "shield" | "rapid" | "spread" | "pierce" | "life";
export type AsteroidSize = AsteroidView["size"];

// ../client/src/game/core/constants.ts (ASTEROID_RADIUS, POWERUP.radius, POWERUP.lifeMs).
const RADIUS: Record<AsteroidSize, number> = { large: 76, medium: 40, small: 20 };
const POWERUP_RADIUS = 16;
const POWERUP_LIFE_MS = 10_000;

/**
 * Finds the live GameState of the page. The game draws everything that moves on a canvas, and React only ever gets a
 * HUD snapshot (invariant #8), so the world exists in one place: the ref `useGame` keeps in the Home component. The
 * canvas element carries its React fiber (`__reactFiber$…`, present in the production build too); walking up from it
 * reaches Home, whose hook list holds that ref. Matched by shape (an object with `rng`, `ship` and `asteroids`), not
 * by hook position or component name, both of which a refactor or the minifier may change.
 *
 * Sent to the browser as source text (page.evaluate serialises functions), so it must stay self-contained.
 */
const FIND_STATE = `(() => {
  const canvas = document.querySelector("canvas");
  if (!canvas) throw new Error("world probe: no canvas on the page");
  const key = Object.keys(canvas).find((k) => k.startsWith("__reactFiber$"));
  if (!key) throw new Error("world probe: the canvas has no React fiber");
  for (let fiber = canvas[key]; fiber; fiber = fiber.return) {
    for (let hook = fiber.tag === 0 ? fiber.memoizedState : null; hook; hook = hook.next) {
      const ref = hook.memoizedState;
      const s = ref && typeof ref === "object" && "current" in ref ? ref.current : null;
      if (s && typeof s === "object" && s.rng && s.ship && Array.isArray(s.asteroids)) return s;
    }
  }
  throw new Error("world probe: GameState not found above the canvas");
})()`;

/**
 * Reads, and for test setup arranges, the game world behind the canvas.
 *
 * Reading is how a spec sees what only the canvas shows (where the ship is, how many asteroids of which size). Arranging
 * is test setup, like GamePage.seedStorage: it puts a body where the scenario needs it (an asteroid in the line of fire,
 * a power-up under the ship) between two clock ticks, then the shipped game loop, the real keyboard and the real HUD
 * do everything else. Only call these with page.clock installed: the loop then moves only when the test advances the
 * clock, so nothing runs between an arrange and the next tick.
 */
export class WorldProbe {
  constructor(readonly page: Page) {}

  private run<T, A>(body: string, arg: A): Promise<T> {
    return this.page.evaluate(
      ([find, src, a]) => {
        const state = (0, eval)(find);
        return new Function("state", "arg", src)(state, a);
      },
      [FIND_STATE, body, arg] as const,
    ) as Promise<T>;
  }

  async read(): Promise<WorldView> {
    return this.run<WorldView, null>(
      `const body = (b) => ({ x: b.x, y: b.y, vx: b.vx, vy: b.vy });
       const sh = state.ship;
       return {
         phase: state.phase, score: state.score, lives: state.lives, wave: state.wave,
         ship: { ...body(sh), angle: sh.angle, alive: sh.alive, invulnMs: sh.invulnMs, hyperMs: sh.hyperMs,
                 shield: sh.shield, weapon: sh.weapon, weaponMs: sh.weaponMs },
         asteroids: state.asteroids.map((a) => ({ ...body(a), size: a.size })),
         bullets: state.bullets.filter((b) => !b.fromUfo).map(body),
         powerUps: state.powerUps.map((p) => ({ ...body(p), kind: p.kind })),
       };`,
      null,
    );
  }

  /**
   * Replaces every asteroid on the field with the given ones (still, no spin unless a velocity is given). An empty
   * list clears the field, which starts the 1.5 s countdown to the next wave exactly as shooting the last one does.
   */
  async setAsteroids(list: (Placement & { size: AsteroidSize })[]): Promise<void> {
    await this.run(
      `const template = state.asteroids[0];
       const made = arg.list.map((p) => ({
         x: p.x, y: p.y, vx: p.vx ?? 0, vy: p.vy ?? 0, r: arg.radius[p.size], size: p.size,
         angle: 0, spin: 0, shape: template ? template.shape.slice() : [1, 1, 1, 1, 1, 1, 1, 1, 1],
       }));
       state.asteroids.length = 0;
       for (const a of made) state.asteroids.push(a);`,
      { list, radius: RADIUS },
    );
  }

  /** Drops a power-up of the given kind right under the ship: the next step picks it up. */
  async dropOnShip(kind: PowerUpKind): Promise<void> {
    await this.run(
      `state.powerUps.push({ x: state.ship.x, y: state.ship.y, vx: 0, vy: 0, r: arg.r, kind: arg.kind, lifeMs: arg.life });`,
      { kind, r: POWERUP_RADIUS, life: POWERUP_LIFE_MS },
    );
  }

  /** Moves the ship and sets its velocity (world units, units/s). */
  async placeShip(p: Placement): Promise<void> {
    await this.run(
      `Object.assign(state.ship, { x: arg.x, y: arg.y, vx: arg.vx ?? 0, vy: arg.vy ?? 0 });`,
      p,
    );
  }

  /** Ends the ship's spawn invulnerability now, so the next collision counts. */
  async endInvulnerability(): Promise<void> {
    await this.run(`state.ship.invulnMs = 0;`, null);
  }

  /**
   * Keeps the ship invulnerable for `ms` of game time: it flies through asteroids without breaking them, so a test
   * counting what a wave spawned is not thrown off by a crash it did not ask for.
   */
  async setInvulnerable(ms: number): Promise<void> {
    await this.run(`state.ship.invulnMs = arg;`, ms);
  }

  /** Sets the score (to start a scenario just below a milestone). */
  async setScore(score: number): Promise<void> {
    await this.run(`state.score = arg;`, score);
  }

  /** Sets the wave number the field counts as (the next wave spawned is this + 1). */
  async setWave(wave: number): Promise<void> {
    await this.run(`state.wave = arg;`, wave);
  }
}
