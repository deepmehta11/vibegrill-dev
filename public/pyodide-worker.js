/* Pyodide module Web Worker: runs the candidate's Python off the main thread.
 * Loads Pyodide + pytest from same-origin /pyodide/ (copied from the pyodide
 * npm package into public/pyodide by scripts/copy-pyodide.mjs). Pyodide 0.28+
 * requires a module worker, so this is loaded with { type: "module" } and uses
 * an ES import instead of importScripts. Same-origin => works offline / on CF. */

import { loadPyodide } from "/pyodide/pyodide.mjs";

const PYODIDE_BASE = "/pyodide/";

let pyodide = null;
let pytestLoaded = false;
let runEntryFn = null;
let runPytestFn = null;

const SETUP = `
import sys, os, shutil, traceback

def _reset(files):
    for name in list(sys.modules):
        mod = sys.modules.get(name)
        f = getattr(mod, "__file__", None)
        if f and str(f).startswith("/work"):
            del sys.modules[name]
    shutil.rmtree("/work", ignore_errors=True)
    os.makedirs("/work", exist_ok=True)
    if "/work" not in sys.path:
        sys.path.insert(0, "/work")
    for path, content in files.items():
        full = os.path.join("/work", path)
        parent = os.path.dirname(full)
        if parent:
            os.makedirs(parent, exist_ok=True)
        with open(full, "w") as fh:
            fh.write(content)

def run_entry(files, entry):
    _reset(files)
    entry_path = os.path.join("/work", entry)
    if not os.path.exists(entry_path):
        print("No entry file:", entry, file=sys.stderr)
        return {"ok": False}
    g = {"__name__": "__main__", "__file__": entry_path}
    try:
        with open(entry_path) as fh:
            code = fh.read()
        exec(compile(code, entry_path, "exec"), g)
        return {"ok": True}
    except SystemExit:
        return {"ok": True}
    except BaseException:
        traceback.print_exc()
        return {"ok": False}

def run_pytest(files, test_paths):
    _reset(files)
    import pytest

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
            # Surface import/collection errors (e.g. a test importing a function
            # the candidate hasn't written yet) as failures instead of silence.
            if report.failed:
                self.results.append({
                    "nodeid": report.nodeid or "collection error",
                    "outcome": "error",
                    "longrepr": str(report.longrepr),
                })

    targets = [os.path.join("/work", p) for p in test_paths] if test_paths else ["/work"]
    c = Collector()
    rc = pytest.main(["-q", "-p", "no:cacheprovider", *targets], plugins=[c])
    passed = sum(1 for r in c.results if r["outcome"] == "passed")
    failed = sum(1 for r in c.results if r["outcome"] != "passed")
    return {"rc": int(rc), "passed": passed, "failed": failed, "results": c.results}
`;

async function init() {
  post({ type: "status", status: "loading-runtime" });
  pyodide = await loadPyodide({
    indexURL: PYODIDE_BASE,
    stdout: (s) => post({ type: "stdout", text: s }),
    stderr: (s) => post({ type: "stderr", text: s }),
  });
  await pyodide.runPythonAsync(SETUP);
  runEntryFn = pyodide.globals.get("run_entry");
  runPytestFn = pyodide.globals.get("run_pytest");
  post({ type: "ready" });
}

async function ensurePytest() {
  if (pytestLoaded) return;
  post({ type: "status", status: "loading-pytest" });
  // Resolves pytest + deps from the same-origin wheels via pyodide-lock.json.
  await pyodide.loadPackage("pytest");
  pytestLoaded = true;
}

function post(msg) {
  self.postMessage(msg);
}

function toResult(pyResult) {
  const obj = pyResult.toJs({ dict_converter: Object.fromEntries });
  pyResult.destroy();
  return obj;
}

const readyPromise = init().catch((e) => {
  post({ type: "fatal", text: String(e && e.stack ? e.stack : e) });
});

self.onmessage = async (event) => {
  const msg = event.data;
  await readyPromise;
  try {
    if (msg.type === "run") {
      post({ type: "run-start", id: msg.id });
      const res = toResult(runEntryFn(pyodide.toPy(msg.files), msg.entry));
      post({ type: "run-result", id: msg.id, ok: res.ok });
    } else if (msg.type === "test") {
      await ensurePytest();
      post({ type: "test-start", id: msg.id });
      const res = toResult(
        runPytestFn(pyodide.toPy(msg.files), pyodide.toPy(msg.testPaths || []))
      );
      post({
        type: "test-result",
        id: msg.id,
        ok: res.rc === 0,
        passed: res.passed,
        failed: res.failed,
        results: res.results,
      });
    }
  } catch (e) {
    post({
      type: "error",
      id: msg.id,
      text: String(e && e.stack ? e.stack : e),
    });
  }
};
