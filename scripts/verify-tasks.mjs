// Verifies every task in content/tasks/ using Pyodide (the same runtime the
// browser uses). For each task it asserts:
//   1. the STARTER files fail at least one test (the task is non-trivial), and
//   2. a reference solution/ makes ALL visible + hidden tests pass.
//
// Run: node scripts/verify-tasks.mjs [slug]
// Exits non-zero if any task fails verification.

import { loadPyodide } from "pyodide";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const TASKS_DIR = join(ROOT, "content", "tasks");

function collectFiles(dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  const walk = (cur) => {
    for (const name of readdirSync(cur).sort()) {
      const full = join(cur, name);
      if (statSync(full).isDirectory()) walk(full);
      else out.push({ path: relative(dir, full).split("\\").join("/"), content: readFileSync(full, "utf8") });
    }
  };
  walk(dir);
  return out;
}

const RUNNER = `
import json, sys, shutil, os
import pytest

def reset_work():
    for name in list(sys.modules):
        mod = sys.modules.get(name)
        f = getattr(mod, "__file__", None)
        if f and str(f).startswith("/work"):
            del sys.modules[name]
    shutil.rmtree("/work", ignore_errors=True)
    os.makedirs("/work", exist_ok=True)
    if "/work" not in sys.path:
        sys.path.insert(0, "/work")

class Collector:
    def __init__(self):
        self.results = []
    def pytest_runtest_logreport(self, report):
        if report.when == "call" or (report.when in ("setup", "teardown") and report.outcome == "failed"):
            self.results.append({
                "nodeid": report.nodeid,
                "outcome": report.outcome,
                "longrepr": (str(report.longrepr) if report.failed else None),
            })
    def pytest_collectreport(self, report):
        if report.failed:
            self.results.append({
                "nodeid": report.nodeid or "collection error",
                "outcome": "error",
                "longrepr": str(report.longrepr),
            })

def run_suite(files):
    reset_work()
    for path, content in files.items():
        full = os.path.join("/work", path)
        os.makedirs(os.path.dirname(full), exist_ok=True)
        with open(full, "w") as fh:
            fh.write(content)
    c = Collector()
    rc = pytest.main(["-q", "-p", "no:cacheprovider", "/work"], plugins=[c])
    passed = sum(1 for r in c.results if r["outcome"] == "passed")
    failed = sum(1 for r in c.results if r["outcome"] != "passed")
    return {"rc": int(rc), "passed": passed, "failed": failed,
            "results": c.results}
`;

async function main() {
  const only = process.argv[2];
  const slugs = readdirSync(TASKS_DIR)
    .filter((n) => statSync(join(TASKS_DIR, n)).isDirectory())
    .filter((n) => !only || n === only)
    .sort();

  const py = await loadPyodide({ stdout: () => {}, stderr: () => {} });
  await py.loadPackage("micropip");
  const micropip = py.pyimport("micropip");
  await micropip.install("pytest");
  await py.runPythonAsync(RUNNER);
  const runSuite = py.globals.get("run_suite");

  const run = (files) => {
    const res = runSuite(py.toPy(files));
    const obj = res.toJs({ dict_converter: Object.fromEntries });
    res.destroy();
    return obj;
  };

  let ok = true;
  for (const slug of slugs) {
    const dir = join(TASKS_DIR, slug);
    const starter = collectFiles(join(dir, "starter"));
    const solution = collectFiles(join(dir, "solution"));
    const visible = collectFiles(join(dir, "tests_visible"));
    const hidden = collectFiles(join(dir, "tests_hidden"));
    const allTests = [...visible, ...hidden];

    const asMap = (files) => Object.fromEntries(files.map((f) => [f.path, f.content]));

    // 1. Starter should fail at least one test.
    const starterRun = run({ ...asMap(starter), ...asMap(allTests) });
    // 2. Reference solution should pass everything.
    const solutionFiles = { ...asMap(starter), ...asMap(solution) }; // solution overrides starter
    const solutionRun = run({ ...solutionFiles, ...asMap(allTests) });

    const starterFailsAsExpected = starterRun.failed > 0;
    const solutionPasses = solutionRun.failed === 0 && solutionRun.passed > 0;

    const status = starterFailsAsExpected && solutionPasses ? "PASS" : "FAIL";
    if (status === "FAIL") ok = false;
    console.log(
      `[${status}] ${slug}: starter ${starterRun.passed}✓/${starterRun.failed}✗ ` +
        `(expected some ✗), solution ${solutionRun.passed}✓/${solutionRun.failed}✗ ` +
        `(expected all pass)`
    );
    if (status === "FAIL") {
      if (!starterFailsAsExpected) console.log(`  ! starter passed everything — task may be trivial`);
      if (!solutionPasses) {
        console.log(`  ! reference solution did not pass all tests:`);
        for (const r of solutionRun.results) {
          if (r.outcome !== "passed") console.log(`    ${r.nodeid}: ${r.outcome}\n${r.longrepr}`);
        }
      }
    }
  }

  process.exit(ok ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
