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
      { token: "comment", foreground: "6f665f", fontStyle: "italic" },
      { token: "keyword", foreground: "fbbf24" },
      { token: "keyword.control", foreground: "fbbf24" },
      { token: "string", foreground: "9ae6a0" },
      { token: "number", foreground: "fb923c" },
      { token: "type", foreground: "f6c177" },
      { token: "function", foreground: "fcd34d" },
      { token: "delimiter", foreground: "b6ada4" },
    ],
    colors: {
      "editor.background": "#14110f",
      "editor.foreground": "#f6f3ef",
      "editorLineNumber.foreground": "#4a423c",
      "editorLineNumber.activeForeground": "#b6ada4",
      "editor.selectionBackground": "#f59e0b33",
      "editor.lineHighlightBackground": "#ffffff08",
      "editorCursor.foreground": "#f59e0b",
      "editorIndentGuide.background1": "#241f1b",
      "editorIndentGuide.activeBackground1": "#3a322d",
      "editorGutter.background": "#14110f",
      "editorWidget.background": "#1b1714",
      "editorWidget.border": "#2a2320",
      "editorBracketMatch.background": "#f59e0b22",
      "editorBracketMatch.border": "#f59e0b66",
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
        fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
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
