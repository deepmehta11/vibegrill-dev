"use client";

import { useState } from "react";
import type { TestResult } from "./use-python";

function shortName(nodeid: string): string {
  const parts = nodeid.split("/");
  return parts[parts.length - 1] || nodeid;
}

export function TestResultsView({ result }: { result: TestResult }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const total = result.passed + result.failed;

  return (
    <div className="flex h-full flex-col bg-[#0a0c0b]">
      <div className="flex items-center gap-3 border-b border-line px-4 py-2.5 text-xs">
        <span className="font-mono font-medium text-fg">
          {result.passed}/{total} passing
        </span>
        {result.failed > 0 ? (
          <span className="rounded-full bg-fail/15 px-2 py-0.5 font-mono font-medium text-fail">
            {result.failed} failing
          </span>
        ) : (
          <span className="rounded-full bg-pass/15 px-2 py-0.5 font-mono font-medium text-pass">
            all green
          </span>
        )}
      </div>
      <div className="flex-1 overflow-auto">
        {result.results.map((r) => {
          const passed = r.outcome === "passed";
          const isOpen = expanded === r.nodeid;
          return (
            <div key={r.nodeid} className="border-b border-line-soft">
              <button
                type="button"
                onClick={() => !passed && setExpanded(isOpen ? null : r.nodeid)}
                className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-xs transition-colors hover:bg-panel/40"
              >
                <span className={passed ? "text-pass" : "text-fail"}>
                  {passed ? "✓" : "✗"}
                </span>
                <span className="font-mono text-muted">{shortName(r.nodeid)}</span>
              </button>
              {isOpen && r.longrepr && (
                <pre className="overflow-x-auto whitespace-pre-wrap bg-[#080a09] px-4 py-3 font-mono text-[11px] text-fail/90">
                  {r.longrepr}
                </pre>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
