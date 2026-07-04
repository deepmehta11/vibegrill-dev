"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ClientTask } from "@/lib/client-types";
import { Markdown } from "@/app/components/markdown";
import { useMonaco } from "@monaco-editor/react";
import { CodeEditor } from "./code-editor";
import { OutputConsole } from "./output-console";
import { TestResultsView } from "./test-results";
import { ChatPanel, type ChatMessage } from "./chat-panel";
import { CompanyBadge } from "@/app/components/company-badge";
import { usePython, type FileMap, type TestResult } from "./use-python";

const DIFFICULTY_COLOR: Record<string, string> = {
  easy: "var(--color-pass)",
  medium: "var(--color-ember)",
  hard: "var(--color-fail)",
};

function statusLabel(status: string): string {
  switch (status) {
    case "booting":
    case "loading-runtime":
      return "Starting Python…";
    case "loading-pytest":
      return "Loading pytest…";
    case "running":
      return "Running…";
    case "ready":
      return "Python ready";
    case "error":
      return "Runtime error";
    default:
      return status;
  }
}

function toMap(files: { path: string; content: string }[]): FileMap {
  return Object.fromEntries(files.map((f) => [f.path, f.content]));
}

// A free-form scratch pad for debugging. Not part of the task, never graded,
// not editable by the agent. Run it (or any file) to see print() output.
const SCRATCH_PATH = "scratch.py";
const SCRATCH_DEFAULT = `# Scratch pad — experiment and debug here.
# Import from the task files, call things, add print() statements, then hit
# Run to see the output below. Nothing here is graded.
#
# Example:
#   from main import *        # or: from <the task module> import ...
#   print("hello from scratch")
`;

export function Workspace({
  task,
  initialFiles,
  sessionId,
  initialMessages = [],
}: {
  task: ClientTask;
  initialFiles?: FileMap;
  sessionId?: string;
  initialMessages?: ChatMessage[];
}) {
  const router = useRouter();
  const starterMap = useMemo(() => toMap(task.starter), [task.starter]);
  const visibleTestsMap = useMemo(
    () => toMap(task.visibleTests),
    [task.visibleTests]
  );
  const starterPaths = useMemo(
    () => task.starter.map((f) => f.path),
    [task.starter]
  );
  // Files the AI agent may edit — the task's own files, never the scratch pad.
  const editableSet = useMemo(() => new Set(starterPaths), [starterPaths]);
  // Tabs shown in the editor: the task files plus a scratch pad for debugging.
  const tabPaths = useMemo(() => [...starterPaths, SCRATCH_PATH], [starterPaths]);
  const monaco = useMonaco();

  const initialFileState = useMemo(() => {
    const base = initialFiles ?? starterMap;
    return SCRATCH_PATH in base
      ? base
      : { ...base, [SCRATCH_PATH]: SCRATCH_DEFAULT };
  }, [initialFiles, starterMap]);

  const [files, setFiles] = useState<FileMap>(initialFileState);
  const filesRef = useRef<FileMap>(initialFileState);
  const [active, setActive] = useState<string>(
    starterPaths.includes(task.entry) ? task.entry : starterPaths[0]
  );
  const [leftTab, setLeftTab] = useState<"instructions" | "tests">(
    "instructions"
  );
  const [bottomTab, setBottomTab] = useState<"output" | "tests">("output");
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { status, output, run, runTests } = usePython();
  const busy = status !== "ready";

  // Debounced autosave for real sessions.
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scheduleSave = useCallback(
    (next: FileMap) => {
      if (!sessionId) return;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        fetch(`/api/sessions/${sessionId}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ files: next }),
        }).catch(() => {});
      }, 800);
    },
    [sessionId]
  );
  useEffect(() => () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
  }, []);

  const updateFile = useCallback(
    (path: string, content: string) => {
      setFiles((prev) => {
        const next = { ...prev, [path]: content };
        filesRef.current = next;
        scheduleSave(next);
        return next;
      });
    },
    [scheduleSave]
  );

  // Run whatever file is open (so you can drop print() statements into any
  // file — or the scratch pad — and see the output).
  const doRun = useCallback(async () => {
    setBottomTab("output");
    await run(filesRef.current, active);
  }, [run, active]);

  const doTest = useCallback(async () => {
    setBottomTab("tests");
    const testPaths = task.visibleTests.map((f) => f.path);
    const result = await runTests({ ...files, ...visibleTestsMap }, testPaths);
    setTestResult(result);
  }, [runTests, files, visibleTestsMap, task.visibleTests]);

  // Apply edits produced by the agent to workspace state + live Monaco models.
  const applyFiles = useCallback(
    (incoming: FileMap) => {
      setFiles((prev) => {
        const next = { ...prev };
        for (const [p, c] of Object.entries(incoming)) {
          if (editableSet.has(p)) next[p] = c;
        }
        filesRef.current = next;
        scheduleSave(next);
        if (monaco) {
          for (const m of monaco.editor.getModels()) {
            const p = m.uri.path.replace(/^\//, "");
            if (next[p] !== undefined && m.getValue() !== next[p]) {
              m.setValue(next[p]);
            }
          }
        }
        return next;
      });
    },
    [monaco, scheduleSave, editableSet]
  );

  // Run the visible tests on the current files and return the result (for the
  // agent's auto-iterate loop).
  const runVisibleTests = useCallback(async () => {
    setBottomTab("tests");
    const testPaths = task.visibleTests.map((f) => f.path);
    const result = await runTests(
      { ...filesRef.current, ...visibleTestsMap },
      testPaths
    );
    setTestResult(result);
    return result;
  }, [runTests, visibleTestsMap, task.visibleTests]);

  const doSubmit = useCallback(async () => {
    if (!sessionId) return;
    setError(null);
    setSubmitting(true);
    try {
      // Persist the latest files before grading.
      await fetch(`/api/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ files }),
      });
      // Fetch hidden tests, run them in-browser.
      const testsRes = await fetch(`/api/grade/${sessionId}/tests`);
      if (!testsRes.ok) throw new Error("Could not load the hidden tests.");
      const { tests } = (await testsRes.json()) as {
        tests: { path: string; content: string }[];
      };
      const hiddenMap = toMap(tests);
      const hiddenPaths = tests.map((t) => t.path);
      setBottomTab("tests");
      const result = await runTests({ ...files, ...hiddenMap }, hiddenPaths);
      setTestResult(result);
      // Send to the judge.
      const gradeRes = await fetch(`/api/grade/${sessionId}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          files,
          testResult: {
            passed: result.passed,
            failed: result.failed,
            results: result.results,
          },
        }),
      });
      if (!gradeRes.ok) {
        const body = await gradeRes.json().catch(() => ({}));
        throw new Error(body.error || "Grading failed.");
      }
      router.push(`/report/${sessionId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submit failed.");
      setSubmitting(false);
    }
  }, [sessionId, files, runTests, router]);

  const statusDot =
    status === "ready"
      ? "var(--color-pass)"
      : status === "error"
        ? "var(--color-fail)"
        : "var(--color-ember)";
  const statusPulse = status !== "ready" && status !== "error";

  return (
    <div className="flex h-screen flex-col bg-ink text-fg">
      <header className="flex h-13 items-center justify-between border-b border-line bg-panel/40 px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/tasks"
            className="grid h-7 w-7 place-items-center rounded-lg border border-line text-muted transition-colors hover:border-ember/40 hover:text-ember"
            aria-label="Back to tasks"
          >
            ←
          </Link>
          <span className="truncate font-display text-sm font-semibold">
            {task.title}
          </span>
          <CompanyBadge company={task.company} />
          <span
            className="inline-flex items-center gap-1.5 font-mono text-[11px] font-medium capitalize"
            style={{ color: DIFFICULTY_COLOR[task.difficulty] ?? "var(--color-faint)" }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: DIFFICULTY_COLOR[task.difficulty] ?? "var(--color-faint)" }}
            />
            {task.difficulty}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {error && (
            <span className="mr-1 max-w-xs truncate text-xs text-fail">
              {error}
            </span>
          )}
          <span className="mr-1 inline-flex items-center gap-1.5 font-mono text-xs text-muted">
            <span
              className={`h-1.5 w-1.5 rounded-full ${statusPulse ? "vg-pulse" : ""}`}
              style={{ background: statusDot }}
            />
            {statusLabel(status)}
          </span>
          <button
            type="button"
            onClick={doRun}
            disabled={busy || submitting}
            className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-fg transition-colors hover:border-ember/40 hover:text-ember disabled:opacity-40 disabled:hover:border-line disabled:hover:text-fg"
          >
            Run
          </button>
          <button
            type="button"
            onClick={doTest}
            disabled={busy || submitting}
            className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-fg transition-colors hover:border-ember/40 hover:text-ember disabled:opacity-40 disabled:hover:border-line disabled:hover:text-fg"
          >
            Run tests
          </button>
          {sessionId && (
            <button
              type="button"
              onClick={doSubmit}
              disabled={busy || submitting}
              className="btn-ember rounded-lg px-4 py-1.5 text-xs font-semibold"
            >
              {submitting ? "Submitting…" : "Submit"}
            </button>
          )}
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="flex w-[22rem] shrink-0 flex-col border-r border-line">
          <div className="flex gap-1 border-b border-line px-2 pt-2 text-xs">
            {(["instructions", "tests"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setLeftTab(tab)}
                className={`rounded-t-lg px-3 py-1.5 font-medium transition-colors ${
                  leftTab === tab
                    ? "bg-panel-2 text-fg"
                    : "text-faint hover:text-muted"
                }`}
              >
                {tab === "tests" ? "Visible tests" : "Instructions"}
              </button>
            ))}
          </div>
          <div className="min-h-0 flex-1 overflow-auto px-5 py-4">
            {leftTab === "instructions" ? (
              <Markdown>{task.prompt}</Markdown>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-faint">
                  These run when you hit <strong className="text-muted">Run tests</strong>.
                  Hidden tests are used only when you submit.
                </p>
                {task.visibleTests.map((f) => (
                  <div key={f.path}>
                    <p className="mb-1 font-mono text-xs text-muted">{f.path}</p>
                    <pre className="overflow-x-auto rounded-lg border border-line bg-[#100d0b] p-3 font-mono text-[11px] leading-relaxed text-muted">
                      {f.content}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          <div className="flex h-9 items-center border-b border-line bg-panel/30">
            {tabPaths.map((path) => (
              <button
                key={path}
                type="button"
                onClick={() => setActive(path)}
                className={`relative h-full border-r border-line px-4 font-mono text-xs transition-colors ${
                  active === path
                    ? "bg-[#14110f] text-fg"
                    : "text-faint hover:text-muted"
                } ${path === SCRATCH_PATH ? "italic" : ""}`}
              >
                {active === path && (
                  <span className="absolute top-0 left-0 h-0.5 w-full bg-ember" />
                )}
                {path === SCRATCH_PATH ? "✎ scratch" : path}
              </button>
            ))}
          </div>
          <div className="min-h-0 flex-1">
            <CodeEditor
              path={active}
              value={files[active] ?? ""}
              onChange={(v) => updateFile(active, v)}
            />
          </div>
          <div className="flex h-64 shrink-0 flex-col border-t border-line">
            <div className="flex gap-1 border-b border-line px-2 pt-2 text-xs">
              {(["output", "tests"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setBottomTab(tab)}
                  className={`rounded-t-lg px-3 py-1.5 font-medium transition-colors ${
                    bottomTab === tab
                      ? "bg-panel-2 text-fg"
                      : "text-faint hover:text-muted"
                  }`}
                >
                  {tab === "tests" ? "Test results" : "Output"}
                </button>
              ))}
            </div>
            <div className="min-h-0 flex-1">
              {bottomTab === "output" ? (
                <OutputConsole lines={output} />
              ) : testResult ? (
                <TestResultsView result={testResult} />
              ) : (
                <div className="flex h-full items-center justify-center font-mono text-xs text-faint">
                  Run the tests to see results.
                </div>
              )}
            </div>
          </div>
        </section>

        <aside className="hidden w-[24rem] shrink-0 border-l border-line lg:flex lg:flex-col">
          <ChatPanel
            sessionId={sessionId}
            initialMessages={initialMessages}
            getFiles={() => filesRef.current}
            applyFiles={applyFiles}
            runVisibleTests={runVisibleTests}
            pythonReady={status === "ready"}
          />
        </aside>
      </div>
    </div>
  );
}
