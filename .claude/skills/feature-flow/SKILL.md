---
name: feature-flow
description: Use when building any user-facing feature in this project - the end-to-end loop from reading the scope docs, through brainstorming with a mockup approval gate, spec and plan documents, worktree isolation, TDD build, and looking at the running app. Trigger on "them chuc nang", "them tinh nang", "lam man hinh", "new feature", "build X screen", or any request that adds or changes user-facing behaviour.
---

# Feature flow

One pass per feature. Read down; do not reorder. The gates are the point — every one
of them exists because skipping it costs more than it saves.

## 0. Read before the first question

- `docs/README.md` — the map and the ID conventions
- `docs/01-product/overview.md` §Non-Goals — **a feature that contradicts a Non-Goal
  is a scope conversation, not a design one.** Raise it before designing anything.
- `docs/02-requirements/nfr.md` — thresholds that apply to every feature, so they do
  not have to be rediscovered per feature
- `docs/03-design/invariants.md` — before touching any existing code

A file marked 🔴 in its header is **empty**. Do not reason from it; say it is empty
and ask, or fill it as part of this feature.

## 1. Brainstorm, with the mockup gate inside it

Run `superpowers:brainstorming`. Classify, clarify one question at a time, propose
2-3 approaches. Then, for any UI work, the mockup gate happens **inside** the design
presentation:

1. **ASCII wireframe in chat first.** Sketch the layout and wait for approval. This
   catches layout mistakes in 30 seconds instead of after a finished mockup.
2. **Then the canvas.** Invoke the built-in `design` skill to draft `.dc.html`
   artboards on one pan/zoom canvas, published as an Artifact.
   - **Three artboards per screen: mobile 375, tablet 768, desktop 1440.** Fewer is
     not finished. One row per screen, one column per width.
   - **Design mobile 375 first;** let wider widths follow. Never design desktop and
     shrink it.
   - Every colour, type role and spacing value comes from `MASTER.md`. No new
     colours, no invented tokens. No `MASTER.md` yet → run `design-bootstrap` first.
   - Artboards differ by screen, state and width — never one per colour variant.
   - Realistic sample data. Never "Lorem ipsum" or "Item 1".
3. **Hand over the link and ask for review explicitly.** Do not just post it.
4. **Review loop until approved.** No iteration limit. Iterate inside the Artifact,
   not by re-running the `design` skill — it only creates or re-seeds a canvas.
   Revising one width means re-checking the other two.
5. **Approval is explicit.** Not silence, not "looks nice", not partial feedback,
   not your own judgement that it is good enough. Ask again instead.

**One gate, not two.** The mockup approval and brainstorming's own approval gate are
the same gate. Present the canvas as the design; approving it is the approval
brainstorming waits for. Do not ask twice.

## 2. Write the feature documents

`docs/specs/<feature>/` — one folder per feature.

| File | Written by | Holds |
| --- | --- | --- |
| `design.md` | brainstorming | the design. Opens with `Liên quan: FR-07 · NFR-PERF-01 · ADR-0004` |
| `plan.md` | `superpowers:writing-plans` | tasks **with checkboxes** |

Checkboxes in `plan.md` are the compaction defence: when context is compacted
mid-feature, the next read tells you it is task 7 of 12. Prose cannot do that.

Also update, in the same pass:

- `docs/02-requirements/scope.md` — assign the new `FR-xx`
- `docs/01-product/journeys.md` — add `US-xx` if the user flow is new
- any 🔴 file this feature just gave real content to

## 2b. Test cases before code (only when `CLAUDE.md` holds `Regression tests: <path> (/write-tests)`)

Right after `design.md` is approved, run `/write-tests <module>` **phase A** (its steps
1–4 and 6) inside `<path>`: requirements, decisions and test cases, with the design you
just got approved as the main source — ask only what the design leaves open for testing
(edges, errors, states). ⛔ The user approves the test cases before planning; P0 cases
become acceptance criteria of the plan's tasks.

Phase A writes **documents only**: no page object, locator, e2e spec or API client —
there is no screen, element or response to look at yet. `Automated:` stays
`manual — chờ pha B`.

## 3. Plan, then isolate

`superpowers:writing-plans` → `plan.md`. Then `superpowers:using-git-worktrees`.
**Never commit to `main`** — branch from the freshest `origin/main`.

## 4. Build

`superpowers:executing-plans` or `subagent-driven-development`. TDD per task.

During the build, three things get written **at the moment they happen**, not at the
end — a long session's context can be compacted before it ends, and the reasoning is
what is lost first:

| When | Where |
| --- | --- |
| A technical decision is settled | a new ADR in `docs/decisions/` |
| You take a deliberate shortcut | `docs/04-state/backlog.md` §Nợ kỹ thuật |
| You stop for the day | `docs/04-state/backlog.md` §Đang làm — what, which step, what blocks |

## 5. See it on the running app

Verifies built code, never the mockup. Drive the real app with Playwright or
chrome-devtools MCP: screenshot at 375 / 768 / 1024 / 1440, and exercise hover,
focus, keyboard nav, and open/submit states. **A UI change you have not looked at is
not finished.**

If the implementation diverges from the approved mockup (technical limit, real data
longer than expected), say exactly where **in the conversation**, and update the
canvas. A stale mockup is worse than no mockup. Nothing about the mockup is written to
the repo — if a layout choice matters beyond this feature it belongs in `MASTER.md`;
if a divergence needed a real decision it belongs in an ADR.

## 5b. Automate and run the regression tests (only with the `Regression tests:` line)

After you have looked at the running app yourself, run `/write-tests <module>` **phase B**
(its steps 5 and 7–9): the `playwright-test-planner` observes the app through Playwright
MCP → page objects + specs → **run the suite** → the healer fixes scripts (never
expectations, at most 3 rounds). Observing is never a substitute for a green run.

A bug in the feature you are building is fixed in the code, not marked `test.fail()` —
`test.fail()` is only for bugs in features that already shipped.

## 6. Finish

`requesting-code-review` → `verification-before-completion` →
`finishing-a-development-branch`. This skill adds nothing to those steps.

With the `Regression tests:` line, e2e tests live **only** in `<path>/` — never a
`client/e2e/` folder or an `e2e.md` — and `cd <path> && pnpm test` is green before
finishing.

README `## Features` gets one short English bullet in the same branch as any `feat:`
that changes user-facing behaviour.

## Deliberate deviation from superpowers:brainstorming

That skill says the only skill invoked after brainstorming is writing-plans, "never
frontend-design". Held literally: `frontend-design` is not invoked *after*
brainstorming — it runs at bootstrap (see `design-bootstrap`), and the per-feature
mockup runs *inside* brainstorming as part of presenting the design. It belongs there
because the mockup decides the layout, the layout decides which files each task
touches, and `writing-plans` has to name those files per task. Planning before the
mockup is approved means planning twice.
