# 🪨 Duck Drift — the 1979 Asteroids flight model, power-ups, and controls that work with a thumb

[![CI](https://github.com/LeVanAnhDuc/web-game-duck-drift/actions/workflows/ci.yml/badge.svg)](https://github.com/LeVanAnhDuc/web-game-duck-drift/actions/workflows/ci.yml)
[![Deploy](https://github.com/LeVanAnhDuc/web-game-duck-drift/actions/workflows/deploy.yml/badge.svg)](https://github.com/LeVanAnhDuc/web-game-duck-drift/actions/workflows/deploy.yml)
[![Release](https://img.shields.io/github/v/release/LeVanAnhDuc/web-game-duck-drift?sort=semver)](https://github.com/LeVanAnhDuc/web-game-duck-drift/releases)

An Asteroids clone built with Next.js and Canvas 2D. No account, no server, no
analytics: it exports to static HTML and the whole game runs on the player's machine.
Scores live in `localStorage`.

**Play**: https://levananhduc.github.io/web-game-duck-drift/

![Duck Drift gameplay](docs/assets/screenshot.png)

Part of the `web-game/` folder in the `web-app-ecosystem` workspace.

## Features

- Classic Asteroids flight model: rotation, inertial thrust, friction and screen wrap on a fixed 1600×1200 world.
- Asteroids split large → medium → small, scoring 20 / 50 / 100 per hit.
- Endless waves that grow in size and speed, with two UFO types appearing from wave 3 on the default difficulty.
- Five power-ups — shield, rapid fire, spread shot, piercing rounds and an extra life — where the three weapons share one slot.
- Hyperspace on a 5-second cooldown, with no random self-destruct.
- Keyboard controls on desktop and real hold-to-act touch controls on phones and tablets.
- Three difficulty presets — easy, normal, hard — chosen on the menu, plus a custom mode with four sliders for lives, asteroid speed, power-up drop rate and the wave UFOs start on.
- Local top-10 high scores with arcade-style three-letter initials, kept in the browser, one table per difficulty.
- Respects `prefers-reduced-motion`, announces game events to screen readers, and encodes every power-up with a shape as well as a colour.

## Controls

| Action     | Keys               |
| ---------- | ------------------ |
| Rotate     | `←` `→` or `A` `D` |
| Thrust     | `↑` or `W`         |
| Fire       | `Space`            |
| Hyperspace | `Shift`            |
| Pause      | `Esc` or `P`       |

On a touch screen the buttons appear across the lower half: rotate under the left
thumb, thrust and fire under the right, hyperspace in the middle because it is the
one you reach for least.

## Commands

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm test         # unit + component tests
pnpm test:e2e     # Playwright, against the static export in out/
pnpm typecheck
pnpm lint
pnpm build        # writes out/
```

`pnpm test:e2e` needs a build first (`pnpm build`) and a Chromium install
(`pnpm exec playwright install chromium`). No environment variables are needed to
run locally — see [`.env.example`](.env.example).

Two checks enforce thresholds that would otherwise only be written down:

```bash
pnpm check:bundle   # NFR-PERF-04: first-load JS, measured from the exported HTML
pnpm check:audit    # NFR-SEC-02: reads pnpm audit, and fails if the audit did not run
```

`pnpm check:audit` used to fail on principle: under Yarn classic the audit endpoint
answered with an empty summary — `0 dependencies`, `0 devDependencies` — and exit
code 0, so any gate built on it passed forever, and the script reported "could not
be checked" rather than a meaningless green tick. `pnpm audit` reaches an endpoint
that answers, so the check now scans the real tree and can genuinely go red. The
refusal to report an unjustified pass is still in there, because that failure mode
is a silent one. `NFR-SEC-02` is gated in CI by the `dependency-review` job on every
pull request, plus Dependabot alerts.

## How it is put together

```
src/
  game/core/     the rules — plain TypeScript, no React, no DOM
  game/render/   Canvas 2D drawing, reads state and never writes it
  game/loop.ts   fixed 60 Hz timestep
  input/         keyboard and touch, both producing one InputState
  storage/       high scores behind a ScoreStore interface
  components/    the React UI outside the canvas
e2e/             Playwright, against the static export
scripts/         bundle budget, audit gate, static server, two release scripts
```

The rules are pure functions over a `GameState`, entered through a single
`step(state, input, dt)`. They cannot reach `Math.random`, `Date.now`, `window` or
React — an ESLint override enforces that, because one stray `Math.random` silently
ends determinism and surfaces months later as a flaky test.

Logic runs at a fixed 60 steps per second while rendering follows
`requestAnimationFrame`. With a variable `dt`, the same keystrokes produce different
results on a 60 Hz and a 144 Hz screen, and no test can reproduce a bug.

React never holds `GameState`. It receives a small `HudSnapshot`, compared before each
emit, so a score that did not change costs no render.

## What runs on GitHub

| Workflow                                       | When                                  | What it does                                                                                                                                                                                                                                                       |
| ---------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [`ci.yml`](.github/workflows/ci.yml)           | every pull request and push to `main` | Parallel jobs: lint + typecheck + unit tests; and build + first-load-JS budget + the end-to-end suite at five configurations. A third job, dependency review, runs on pull requests only — the action compares base against head, so a push has nothing to compare |
| [`deploy.yml`](.github/workflows/deploy.yml)   | push to `main`                        | Rebuilds with `GITHUB_PAGES=true` and publishes `out/` to Pages. It re-runs the tests rather than trusting a green run it cannot see                                                                                                                               |
| [`release.yml`](.github/workflows/release.yml) | push to `main`                        | Works out the next version, composes the notes, and publishes a GitHub release                                                                                                                                                                                     |

The end-to-end suite runs against the **static export** — the artifact Pages actually
serves — at `375 / 768 / 1024 / 1440` and on a Pixel 5 with a real touch screen. That
is the only automated check of the narrow layouts and of the 44px touch-target
threshold. It deliberately does not assert on scores or entity positions: that is a
real-time simulation on a shared runner, and a test depending on it goes red because
the machine was busy, not because the game broke. The rules belong to the unit suite,
which calls `step()` directly.

Pages has to be switched on **once per repository**, with a token that has admin
rights — the workflow's own `GITHUB_TOKEN` can deploy to an existing Pages site but
cannot create one:

```bash
gh api -X POST repos/LeVanAnhDuc/web-game-duck-drift/pages -f build_type=workflow
```

If `configure-pages` fails with "Get Pages site failed", that command is the fix, not
a change to the workflow. `enablement: true` was tried and fails with "Resource not
accessible by integration". See
[ADR-0008](docs/decisions/0008-ci-and-github-pages-deploy.md).

## Releases and versioning

Version numbers and release notes are **derived from the commit history**, so neither
depends on anyone remembering to do something. Both live in scripts you can run
locally — a release process you can only exercise by pushing to `main` is one nobody
exercises:

```bash
pnpm release:next            # which tag the next release would get, and why
pnpm release:notes v1.1.0    # what its notes would say
```

**How the version is decided**, against the previous `v*` tag:

| Since the last tag                                                 | Bump  |
| ------------------------------------------------------------------ | ----- |
| a commit marked `feat!:` / `fix!:` …, or a `BREAKING CHANGE:` body | major |
| any `feat:` commit                                                 | minor |
| anything else                                                      | patch |

The head commit's **subject** can override it: `[release major]`, `[release minor]`,
or `[skip release]` to publish nothing. Only the subject counts — a body that merely
mentions the marker (this README, for one) must not trigger a release.

**How the notes are composed:** commit subjects since the previous tag, grouped by
their Conventional Commit prefix — breaking changes first, then What's new (`feat`),
Fixes (`fix`), Performance, Internals, Tests, Documentation, Build and tooling.
Scopes are kept as labels, so `feat(game): …` reads as **game**: …

Commits that are not Conventional Commits land under "Other" rather than being
dropped. A release note that swallows commits is a release note that has started
lying. It is also why pull requests here are **rebased, not squashed**: a squash
collapses every subject into one line and the notes lose their content.

GitHub's own `--generate-notes` is not used: it groups by pull-request label, and this
repository does not label its PRs. What it does have is a conventional subject on
every commit. See [ADR-0009](docs/decisions/0009-releases-derived-from-commits.md).

## Keeping this README honest

`## Features` is the user-facing contract, so it changes in the **same branch** as the
code that changes behaviour — never in a catch-up pass afterwards:

- a `feat:` that a player would notice gets **one short bullet**, in English, in the
  existing voice: what the player can now do, not which component was added
- a bullet describes behaviour that exists **today**. Nothing here is aspirational —
  if it is in this list, it works
- a change that only a developer would notice (refactor, tooling, tests) does **not**
  belong in `## Features`
- a README-only change is a `docs:` commit and, on its own, releases a patch

## Documentation

`docs/README.md` is the map. In short:

| Question                                   | File                             |
| ------------------------------------------ | -------------------------------- |
| What is this, and what will it never do?   | `docs/01-product/overview.md`    |
| What can the player do?                    | `docs/02-requirements/scope.md`  |
| What thresholds apply everywhere?          | `docs/02-requirements/nfr.md`    |
| What breaks silently if I change it?       | `docs/03-design/invariants.md`   |
| How do the pieces fit together?            | `docs/03-design/architecture.md` |
| Why is it built this way?                  | `docs/decisions/`                |
| What is being worked on, and what is owed? | `docs/04-state/backlog.md`       |
