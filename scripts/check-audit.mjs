import { readFileSync } from "node:fs";

/**
 * Enforces NFR-SEC-02 - "no vulnerability at high or above" - exactly as written.
 *
 *   pnpm audit --json | node scripts/check-audit.mjs
 *
 * `pnpm audit` cannot express the threshold on its own in a way this project can
 * keep. `--audit-level=high` exits non-zero at high and above, but it then says
 * nothing about the advisories BELOW the line, and it cannot tell "clean" apart
 * from "the audit did not really run". Both of those are the point of this file.
 *
 * The second one matters because of what this repo used to run. Under yarn 1 the
 * audit endpoint answered with a summary that described NOTHING - all-zero counts
 * and `devDependencies: 0` on a project that declares 22 of them - while still
 * exiting 0. A checker that only counts advisories then prints a green tick
 * forever, and a security gate that cannot fail is worse than no gate, because
 * people trust it. `pnpm audit` queries an endpoint that actually answers (504
 * dependencies scanned on this repo, not 0), so the gate can finally go red on a
 * real advisory - but the refusal to report an unjustified pass stays, because
 * the failure mode it guards against is a silent one.
 *
 * Shape note: pnpm emits ONE JSON object, the npm v6 audit report, not yarn 1's
 * stream of newline-delimited events. It also counts every package under
 * `dependencies` and leaves `devDependencies` at 0, so the sanity check below
 * reads the total and never the dev split.
 */
const BLOCKING = new Set(["high", "critical"]);

let raw = "";
process.stdin.setEncoding("utf8");
for await (const chunk of process.stdin) raw += chunk;

let report;
try {
  report = JSON.parse(raw);
} catch {
  console.error("NFR-SEC-02 could not be checked - `pnpm audit --json` produced no JSON.");
  console.error("");
  console.error("What arrived on stdin, first 400 characters:");
  console.error(raw.slice(0, 400) || "  (nothing at all)");
  process.exit(1);
}

const metadata = report.metadata ?? null;
const counts = metadata?.vulnerabilities ?? {};
const advisories = Object.values(report.advisories ?? {}).map((a) => ({
  severity: a.severity,
  module: a.module_name,
  vulnerable: a.vulnerable_versions,
  patched: a.patched_versions,
  title: a.title,
  path: a.findings?.[0]?.paths?.[0] ?? "",
}));

// Sanity check BEFORE reporting anything. "No advisories" is only evidence of a
// clean tree if the audit actually looked at the tree.
const scanned = metadata?.totalDependencies ?? metadata?.dependencies ?? 0;
const declaredDev = Object.keys(
  JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")).devDependencies ??
    {},
).length;

const reasons = [];
if (!metadata) reasons.push("the report carried no `metadata` block at all");
if (scanned === 0) reasons.push("the report counted 0 dependencies scanned");
if (declaredDev > 0 && scanned < declaredDev) {
  reasons.push(
    `only ${scanned} dependencies were scanned while package.json alone declares ${declaredDev} devDependencies`,
  );
}
// The two halves of the report have to agree with each other. A severity count
// with no advisory behind it means one of them is lying, and a gate cannot pick.
const countedBlocking = [...BLOCKING].reduce((n, s) => n + (counts[s] ?? 0), 0);
const listedBlocking = advisories.filter((a) => BLOCKING.has(a.severity));
if (countedBlocking > 0 && listedBlocking.length === 0) {
  reasons.push(
    `metadata counts ${countedBlocking} high/critical vulnerability(ies) but no advisory was listed`,
  );
}

if (reasons.length > 0) {
  console.error("NFR-SEC-02 could not be checked - the audit did not really run.");
  console.error("");
  for (const reason of reasons) console.error(`  - ${reason}`);
  console.error("");
  console.error("Treat this as UNKNOWN, not clean. Pull requests are covered separately by the");
  console.error("dependency-review job in ci.yml, which reads GitHub's advisory database and");
  console.error("does not depend on a registry endpoint answering.");
  process.exit(1);
}

const rest = advisories.filter((a) => !BLOCKING.has(a.severity));

if (rest.length > 0) {
  console.log(`${rest.length} advisory(ies) below high, not blocking:`);
  for (const a of rest) console.log(`  ${a.severity.padEnd(8)} ${a.module}  ${a.title}`);
  console.log("");
}

if (listedBlocking.length === 0) {
  console.log(
    `NFR-SEC-02: no high or critical advisory (${advisories.length} total, ` +
      `${scanned} dependencies scanned).`,
  );
  process.exit(0);
}

console.error(`NFR-SEC-02 violated: ${listedBlocking.length} advisory(ies) at high or above\n`);
for (const a of listedBlocking) {
  console.error(`  ${a.severity.toUpperCase()}  ${a.module} ${a.vulnerable}`);
  console.error(`    ${a.title}`);
  console.error(`    via ${a.path}`);
  console.error(`    fixed in ${a.patched}\n`);
}
console.error("Fix it, or pin the patched range through `pnpm.overrides` in package.json.");
process.exit(1);
