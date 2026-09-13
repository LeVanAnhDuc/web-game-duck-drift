# Project instructions — `web-game-asteroids`

This file is **always loaded**, so it holds only what must be true every turn:
constraints, routing, and where things live. Procedures live in skills.

## Where the procedures are

| Doing this | Use | Runs |
| --- | --- | --- |
| Building a user-facing feature | skill `feature-flow` | per feature |
| First UI work, no `MASTER.md` yet | skill `design-bootstrap` | once per project |
| Scaffolding a **new** project in this workspace | workspace skill `scaffold-webapp-project` | once |

Do not re-derive those flows from this file — they are not here. Invoke the skill.

## Document layout

Two tiers. **Tier 1 is permanent** — created at project init, answers questions that
outlive any feature. **Tier 2 is per-feature** — created by the flow. Never mix them:
a feature's design doc does not restate a permanent doc, it references it by ID.

```
.env.example                       env vars — mirrors CODE, not the spec. Committed.
docs/
  README.md                        the map + ID conventions. The only file that
                                   talks about other files.
  01-product/
    overview.md                    positioning · Non-Goals · model · cost ceiling
    journeys.md                    end-to-end user flows            US-01…
    glossary.md                    term ↔ code name ↔ UI name (locks naming)
  02-requirements/
    scope.md                       function inventory + status      FR-01…
    nfr.md                         measurable thresholds for EVERY feature
                                                                    NFR-PERF-01…
  03-design/
    architecture.md                C4 L1-L2 · module boundaries · main data flow
    invariants.md                  what breaks SILENTLY. Read before editing code.
  04-state/
    backlog.md                     ## Đang làm · next up · deliberate tech debt
  decisions/                       one ADR per decision, append-only    ADR-0001…
  design-system/asteroids/MASTER.md   design-bootstrap output, committed
  specs/<feature>/                 NOT pre-created — the flow creates it
    design.md · plan.md
```

One folder per feature under `docs/specs/<feature>/` — not the superpowers defaults.
Their `docs/superpowers/specs/` + `docs/superpowers/plans/` split scatters one
feature's documents across two date-named trees.

**No UI mock is stored in the repo.** The canvas is an Artifact living on claude.ai,
so there is no `docs/ui-designs/<feature>/` and no `ui.md` either. The approved mockup
leaves no trace in a PR — deliberately. What the implementation does is in the code;
why it does it is in `design.md` and the ADRs.

## The docs contract

- **One question per file.** Every tier-1 file opens with a 4-line header stating what
  it answers, its fill state (🔴 chưa điền · 🟡 một phần · 🟢 đủ · ⚪ chưa áp dụng),
  when it was last touched, and what triggers an update. Read the header before the
  body — it tells you whether the file is worth reading at all.
- **🔴 means empty.** Do not reason from it, do not infer that its subject does not
  exist. Say it is empty.
- **Respect the KHÔNG-chứa boundaries** stated in each file's `<!-- CÁCH ĐIỀN -->`
  block. Two files covering the same ground is the only reason docs drift.
- **A missing file beats a stale one.** Leave a file ⚪ rather than filling it with
  guesses; never write a number you did not just produce.
- **IDs are the traceability layer.** `US-xx` journeys · `FR-xx` functions ·
  `NFR-<AREA>-xx` thresholds · `ADR-NNNN` decisions. IDs are never reused and never
  deleted — retire them in place. Feature docs, commit bodies and tests reference IDs
  instead of copying content, so `grep -rn "NFR-PERF-01" .` is the whole traceability
  mechanism.
- **`.env.example` mirrors the code.** If code reads a var that is missing there, that
  is a bug, not a docs gap.
- **Write at the moment, not at the end.** A settled technical decision → an ADR now.
  A deliberate shortcut → `backlog.md` §Nợ kỹ thuật now. Stopping → `backlog.md`
  §Đang làm now. Context can be compacted before a session ends, and the reasoning is
  what is lost first.

## Git

The repo exists from project init — `scaffold-webapp-project` runs `git init`, the
first commit and branch `main` as part of scaffolding, so there is no phase of this
project without history. If this folder somehow has no `.git`, stop and say so rather
than working without it.

Never commit to `main`; branch from the freshest `origin/main` into a worktree.
Conventional Commits, English subject, feature/area scope. Bodies explain reasoning,
not the diff. User-facing conversation in Vietnamese; code, identifiers and commit
messages in English.

## Docs automation

Four hooks in `.claude/settings.local.json` back the contract above. They are plain
bash scripts under `.claude/scripts/` — not AI, so they match strings and nothing
more. Know what each reminder means, so you answer it instead of guessing:

| Hook | Script | What it does |
| --- | --- | --- |
| `SessionStart` (`startup|clear|compact`) | `docs-brief.sh` | Injects the docs brief: which files are 🔴, what `backlog.md` §Đang làm holds, which doc each kind of task needs. On `source=compact` it also warns that context was just compacted. |
| `UserPromptSubmit` | `docs-route.sh` | Fires only on strong intent signals, then names the docs that task needs. Silent otherwise. If it misfires, ignore it silently — do not relay it to the user. |
| `PreCompact` | `doc-precompact.sh` | Snapshots measurable state to disk before compaction. It cannot read what you are doing — that has to be in `backlog.md` §Đang làm, and only you can put it there. |
| `Stop` | `doc-flush.sh` | Regenerates the derivable blocks, then blocks the stop **once** if there is a concrete, measured reason. |

`docs-regen.sh` rewrites only what a machine derives with certainty, and only between
`<!-- BEGIN:auto -->` and `<!-- END:auto -->`: the status table in `docs/README.md`
and the ADR index in `docs/decisions/README.md`. It also reports env vars the code
reads that `.env.example` lacks, and IDs referenced with no entry in their source
file. Never hand-edit inside those markers — change the file's own `**Trạng thái:**`
header and let the script pick it up.

Every reminder offers two exits: update the doc, **or** say in one sentence why this
change needs no doc update. Take the second exit whenever it is true. Filling a 🔴
file with plausible guesses to silence a hook is the one outcome worse than leaving
it empty.

## Design skill routing

`ui-ux-pro-max` ships 7 skills whose descriptions all match "design UI"; firing
several at once costs ~18k tokens and produces conflicting guidance.

- **Product UI** → `ui-ux-pro-max` + `frontend-design` for tokens, the built-in
  `design` skill for the step 3 mockup. Nothing else.
- **Name collision:** the built-in `design` skill (Claude Design canvas, used in
  step 3) is NOT `ui-ux-pro-max:design`. Step 3 always means the built-in one.
- `ui-ux-pro-max:design`, `banner-design`, `slides`, `brand` → only for actual
  logo, banner, slide, or brand-asset work.
- **`ui-styling` only applies if this project turns out to use React + Tailwind +
  shadcn/ui.** That skill hard-codes shadcn/Radix/Tailwind, down to
  `pnpm dlx shadcn@latest init`. Detect the stack from `package.json` first; if it is
  anything else (Ant Design, Vuetify, MUI, plain CSS), ignore this skill even
  when it fires on its own.

Cannot be turned off selectively: `claude plugin disable` removes all 7 skills
including `ui-ux-pro-max` itself, breaking step 1. Routing only works via this file.
