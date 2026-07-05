"use client";

import dynamic from "next/dynamic";
import type { Monaco } from "@monaco-editor/react";

const MonacoEditor = dynamic(
  () => import("@monaco-editor/react").then((m) => m.Editor),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center font-mono text-xs text-faint">
        loading editor…
      </div>
    ),
  }
);

function languageFor(path: string): string {
  if (path.endsWith(".py")) return "python";
  if (path.endsWith(".md")) return "markdown";
  if (path.endsWith(".json")) return "json";
  return "plaintext";
}

function defineTheme(monaco: Monaco) {
  monaco.editor.defineTheme("vibegrill", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "5c6f5d", fontStyle: "italic" },
      { token: "keyword", foreground: "f5b301" },
      { token: "keyword.control", foreground: "f5b301" },
      { token: "string", foreground: "7dd3fc" },
      { token: "number", foreground: "fcd34d" },
      { token: "type", foreground: "86efac" },
      { token: "function", foreground: "4ade80" },
      { token: "delimiter", foreground: "8ba088" },
    ],
    colors: {
      "editor.background": "#0c100e",
      "editor.foreground": "#d8e3d7",
      "editorLineNumber.foreground": "#33463a",
      "editorLineNumber.activeForeground": "#8ba088",
      "editor.selectionBackground": "#4ade8033",
      "editor.lineHighlightBackground": "#ffffff06",
      "editorCursor.foreground": "#4ade80",
      "editorIndentGuide.background1": "#182019",
      "editorIndentGuide.activeBackground1": "#2e3f33",
      "editorGutter.background": "#0c100e",
      "editorWidget.background": "#111613",
      "editorWidget.border": "#1e2a22",
      "editorBracketMatch.background": "#4ade8022",
      "editorBracketMatch.border": "#4ade8066",
    },
  });
}

export function CodeEditor({
  path,
  value,
  onChange,
  readOnly = false,
}: {
  path: string;
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
}) {
  return (
    <MonacoEditor
      path={path}
      language={languageFor(path)}
      value={value}
      onChange={(v) => onChange?.(v ?? "")}
      beforeMount={defineTheme}
      theme="vibegrill"
      options={{
        minimap: { enabled: false },
        fontSize: 13,
        fontFamily: "var(--font-jetbrains-mono), ui-monospace, monospace",
        fontLigatures: true,
        readOnly,
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 4,
        insertSpaces: true,
        renderWhitespace: "selection",
        padding: { top: 14, bottom: 14 },
        smoothScrolling: true,
        cursorBlinking: "smooth",
        roundedSelection: true,
        scrollbar: { verticalScrollbarSize: 10, horizontalScrollbarSize: 10 },
      }}
    />
  );
}
