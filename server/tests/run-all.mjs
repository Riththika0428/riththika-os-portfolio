// Runs every server test file in its own process and prints one summary line each.
// Exit code is 0 only if every file passes, so it works in CI too.
import { readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dir, "..");
const files = readdirSync(dir).filter((f) => f.endsWith(".mjs") && f !== "run-all.mjs").sort();

let failed = 0;
for (const f of files) {
  const r = spawnSync(process.execPath, [path.join(dir, f)], { cwd: root, encoding: "utf8", env: { ...process.env, NODE_ENV: "test" } });
  const out = `${r.stdout}\n${r.stderr}`;
  const passes = (out.match(/^\s*(PASS|ok)\s/gm) || []).length;
  const fails = (out.match(/^\s*(FAIL|not ok)\s/gm) || []).length;
  const bad = r.status !== 0 || fails > 0;
  if (bad) {
    failed++;
    console.log(`FAIL  ${f}  (${passes} passed, ${fails} failed, exit ${r.status})`);
    console.log(out.split("\n").filter((l) => /^\s*(FAIL|not ok)|Error/.test(l)).slice(0, 8).map((l) => "      " + l).join("\n"));
  } else {
    console.log(`ok    ${f}  (${passes} checks)`);
  }
}
console.log(failed ? `\n${failed} of ${files.length} test files FAILED` : `\nAll ${files.length} test files passed`);
process.exit(failed ? 1 : 0);