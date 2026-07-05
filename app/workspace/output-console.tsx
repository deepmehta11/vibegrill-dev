"use client";

import { useEffect, useRef } from "react";
import type { OutputLine } from "./use-python";

export function OutputConsole({ lines }: { lines: OutputLine[] }) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [lines]);

  return (
    <div className="h-full overflow-auto bg-[#0a0c0b] p-4 font-mono text-xs leading-relaxed">
      {lines.length === 0 ? (
        <p className="text-faint">
          Output appears here. Add{" "}
          <span className="text-ember">print()</span> statements to any file
          (or the scratch pad) and hit Run.
        </p>
      ) : (
        lines.map((line, i) => (
          <pre
            key={i}
            className={
              line.stream === "stderr"
                ? "whitespace-pre-wrap text-fail"
                : line.stream === "system"
                  ? "whitespace-pre-wrap text-ember"
                  : "whitespace-pre-wrap text-fg"
            }
          >
            {line.text}
          </pre>
        ))
      )}
      <div ref={endRef} />
    </div>
  );
}
