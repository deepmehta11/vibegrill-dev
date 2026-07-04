"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type PyStatus =
  | "booting"
  | "loading-runtime"
  | "loading-pytest"
  | "ready"
  | "running"
  | "error";

export type TestResultItem = {
  nodeid: string;
  outcome: string;
  longrepr: string | null;
};

export type TestResult = {
  ok: boolean;
  passed: number;
  failed: number;
  results: TestResultItem[];
};

export type OutputLine = {
  stream: "stdout" | "stderr" | "system";
  text: string;
};

export type FileMap = Record<string, string>;

type Pending = {
  resolve: (value: unknown) => void;
  reject: (err: Error) => void;
};

export function usePython() {
  const workerRef = useRef<Worker | null>(null);
  const pendingRef = useRef<Map<string, Pending>>(new Map());
  const idRef = useRef(0);
  const [status, setStatus] = useState<PyStatus>("booting");
  const [output, setOutput] = useState<OutputLine[]>([]);

  useEffect(() => {
    const worker = new Worker("/pyodide-worker.js", { type: "module" });
    workerRef.current = worker;

    const append = (stream: OutputLine["stream"], text: string) =>
      setOutput((prev) => [...prev, { stream, text }]);

    const settle = (id: string | undefined, run: (p: Pending) => void) => {
      if (!id) return;
      const p = pendingRef.current.get(id);
      if (p) {
        pendingRef.current.delete(id);
        run(p);
      }
    };

    worker.onmessage = (event: MessageEvent) => {
      const m = event.data;
      switch (m.type) {
        case "status":
          setStatus(m.status);
          break;
        case "ready":
          setStatus("ready");
          break;
        case "stdout":
          append("stdout", m.text);
          break;
        case "stderr":
          append("stderr", m.text);
          break;
        case "run-start":
        case "test-start":
          setStatus("running");
          break;
        case "run-result":
          setStatus("ready");
          settle(m.id, (p) => p.resolve({ ok: m.ok }));
          break;
        case "test-result":
          setStatus("ready");
          settle(m.id, (p) =>
            p.resolve({
              ok: m.ok,
              passed: m.passed,
              failed: m.failed,
              results: m.results,
            } satisfies TestResult)
          );
          break;
        case "error":
          setStatus("ready");
          append("stderr", m.text);
          settle(m.id, (p) => p.reject(new Error(m.text)));
          break;
        case "fatal":
          setStatus("error");
          append("system", "Python runtime failed to load: " + m.text);
          break;
      }
    };

    worker.onerror = (e) => {
      setStatus("error");
      append(
        "system",
        `Python runtime worker error: ${e.message || "unknown"}${
          e.filename ? ` (${e.filename}:${e.lineno})` : ""
        }`
      );
    };

    return () => {
      worker.terminate();
      pendingRef.current.clear();
    };
  }, []);

  const clearOutput = useCallback(() => setOutput([]), []);

  const send = useCallback(
    <T,>(message: Record<string, unknown>, header: string): Promise<T> => {
      const worker = workerRef.current;
      if (!worker) return Promise.reject(new Error("Runtime not started"));
      const id = String(++idRef.current);
      setOutput([{ stream: "system", text: header }]);
      return new Promise<T>((resolve, reject) => {
        pendingRef.current.set(id, {
          resolve: resolve as (v: unknown) => void,
          reject,
        });
        worker.postMessage({ ...message, id });
      });
    },
    []
  );

  const run = useCallback(
    (files: FileMap, entry: string) =>
      send<{ ok: boolean }>({ type: "run", files, entry }, `$ python ${entry}`),
    [send]
  );

  const runTests = useCallback(
    (files: FileMap, testPaths: string[]) =>
      send<TestResult>(
        { type: "test", files, testPaths },
        `$ pytest ${testPaths.join(" ")}`
      ),
    [send]
  );

  return { status, output, clearOutput, run, runTests };
}
