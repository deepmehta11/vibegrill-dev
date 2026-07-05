"use client";

import { useEffect, useRef, useState } from "react";
import { Markdown } from "@/app/components/markdown";
import type { FileMap, TestResult } from "./use-python";

export type ChatMessage = { role: "user" | "assistant"; content: string };

type Mode = "advice" | "agent";
const MAX_AGENT_ROUNDS = 4;

export function ChatPanel({
  sessionId,
  initialMessages = [],
  getFiles,
  applyFiles,
  runVisibleTests,
  pythonReady = false,
}: {
  sessionId?: string;
  initialMessages?: ChatMessage[];
  getFiles?: () => FileMap;
  applyFiles?: (files: FileMap) => void;
  runVisibleTests?: () => Promise<TestResult>;
  pythonReady?: boolean;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<Mode>("advice");
  const [autoFix, setAutoFix] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, status]);

  const push = (msg: ChatMessage) => setMessages((m) => [...m, msg]);

  async function sendAdvice(text: string) {
    push({ role: "user", content: text });
    push({ role: "assistant", content: "" });
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sessionId, message: text, files: getFiles?.() ?? {} }),
    });
    if (!res.ok || !res.body) throw new Error("Chat request failed");
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let acc = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      acc += decoder.decode(value, { stream: true });
      setMessages((m) => {
        const copy = m.slice();
        copy[copy.length - 1] = { role: "assistant", content: acc };
        return copy;
      });
    }
  }

  async function sendAgent(text: string) {
    push({ role: "user", content: text });
    let instruction = text;
    for (let round = 0; round < MAX_AGENT_ROUNDS; round++) {
      setStatus(
        round === 0
          ? "Agent is editing your files…"
          : `Fixing failing tests (round ${round + 1})…`
      );
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sessionId, message: instruction, files: getFiles?.() ?? {} }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Agent request failed");
      }
      const { files, summary } = (await res.json()) as {
        files: FileMap;
        summary: string;
      };
      applyFiles?.(files);
      push({ role: "assistant", content: summary });

      if (!autoFix || !runVisibleTests || !pythonReady) break;

      setStatus("Running the visible tests…");
      const result = await runVisibleTests();
      if (result.failed === 0) {
        push({ role: "assistant", content: "✓ All visible tests pass." });
        break;
      }
      if (round === MAX_AGENT_ROUNDS - 1) {
        push({
          role: "assistant",
          content: `Some visible tests are still failing (${result.passed}/${result.passed + result.failed} passing). I've stopped after ${MAX_AGENT_ROUNDS} rounds — take a look and steer me.`,
        });
        break;
      }
      const fails = result.results
        .filter((r) => r.outcome !== "passed")
        .map((r) => `- ${r.nodeid}: ${r.outcome}`)
        .join("\n");
      instruction = `The visible tests are still failing:\n${fails}\n\nFix the code so these pass. Do not modify the tests.`;
    }
  }

  async function send() {
    const text = input.trim();
    if (!sessionId || !text || busy) return;
    setInput("");
    setBusy(true);
    try {
      if (mode === "agent") await sendAgent(text);
      else await sendAdvice(text);
    } catch (e) {
      push({
        role: "assistant",
        content: `× ${e instanceof Error ? e.message : "Something went wrong."} Please try again.`,
      });
    } finally {
      setStatus(null);
      setBusy(false);
    }
  }

  return (
    <div className="flex h-full flex-col bg-panel/20">
      <div className="border-b border-line px-4 py-3">
        <div className="flex items-center justify-between">
          <h2 className="font-mono text-sm font-semibold text-fg">
            AI assistant
          </h2>
          {sessionId && (
            <div className="flex rounded-md border border-line bg-ink p-0.5 text-xs">
              {(["advice", "agent"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  disabled={busy}
                  className={`rounded-[5px] px-2.5 py-0.5 font-mono font-medium transition-colors disabled:opacity-50 ${
                    mode === m
                      ? "bg-ember text-[#04170c]"
                      : "text-faint hover:text-muted"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          )}
        </div>
        <p className="mt-1 text-xs text-faint">
          {mode === "advice"
            ? "Advice only — it won't edit your files."
            : "Agent mode — it edits your files directly. Review its changes."}
        </p>
        {sessionId && mode === "agent" && (
          <label className="mt-2 flex items-center gap-2 text-xs text-muted">
            <input
              type="checkbox"
              checked={autoFix}
              onChange={(e) => setAutoFix(e.target.checked)}
              disabled={busy}
              className="accent-[var(--color-ember)]"
            />
            Auto-run visible tests and let the agent fix failures
          </label>
        )}
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-auto px-4 py-4">
        {messages.length === 0 && (
          <p className="text-sm text-faint">
            {sessionId
              ? "Ask for a hint in Advice mode, or switch to Agent mode to have the AI edit your files on your instruction."
              : "Start a session to chat with the assistant."}
          </p>
        )}
        {messages.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="flex justify-end">
              <div className="max-w-[85%] rounded-lg rounded-br-sm bg-ember px-3 py-2 text-sm text-[#04170c]">
                {m.content}
              </div>
            </div>
          ) : (
            <div key={i} className="text-sm text-fg">
              {m.content ? (
                <Markdown>{m.content}</Markdown>
              ) : (
                <span className="text-faint">…</span>
              )}
            </div>
          )
        )}
        {status && (
          <p className="flex items-center gap-2 text-xs italic text-faint">
            <span className="h-1.5 w-1.5 rounded-full bg-ember vg-pulse" />
            {status}
          </p>
        )}
        <div ref={endRef} />
      </div>

      {sessionId && (
        <div className="border-t border-line p-3">
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={2}
              placeholder={
                mode === "agent" ? "Tell the agent what to change…" : "Ask the assistant…"
              }
              className="min-h-0 flex-1 resize-none rounded-md border border-line bg-ink px-3 py-2 text-sm text-fg placeholder:text-faint focus:border-ember/50 focus:outline-none"
            />
            <button
              type="button"
              onClick={send}
              disabled={busy || !input.trim()}
              className="btn-ember rounded-md px-3.5 py-2 font-mono text-sm font-semibold"
            >
              {busy ? "…" : mode === "agent" ? "run" : "send"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
