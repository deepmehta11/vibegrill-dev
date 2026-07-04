// GLM 5.2 via OpenRouter (OpenAI-compatible) powers the in-workspace advice
// assistant. The judge deliberately stays on Claude — see lib/anthropic.ts.
// Raw streaming fetch keeps this dependency-free and Cloudflare Workers-native.

export const ASSISTANT_MODEL = "z-ai/glm-5.2";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export type ChatRole = "system" | "user" | "assistant";
export type ChatMessage = { role: ChatRole; content: string };

function apiKey(): string {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key || key.includes("REPLACE_ME")) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }
  return key;
}

/**
 * Streams a chat completion from OpenRouter, yielding assistant text deltas as
 * they arrive. Reasoning is disabled so replies are snappy and we never surface
 * the model's chain-of-thought (mirrors the old `thinking: disabled` on Claude).
 */
export async function* streamChat(opts: {
  model?: string;
  system: string;
  messages: ChatMessage[];
  maxTokens?: number;
  signal?: AbortSignal;
}): AsyncGenerator<string> {
  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey()}`,
      "content-type": "application/json",
      // Attribution headers OpenRouter surfaces on its dashboard / rankings.
      "http-referer": "https://vibegrill.dev",
      "x-title": "VibeGrill",
    },
    body: JSON.stringify({
      model: opts.model ?? ASSISTANT_MODEL,
      max_tokens: opts.maxTokens ?? 1500,
      stream: true,
      reasoning: { enabled: false },
      messages: [{ role: "system", content: opts.system }, ...opts.messages],
    }),
    signal: opts.signal,
  });

  if (!res.ok || !res.body) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `OpenRouter request failed (${res.status}): ${detail.slice(0, 300)}`
    );
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    // SSE frames are newline-delimited; process every complete line, keep the rest.
    let nl: number;
    while ((nl = buffer.indexOf("\n")) >= 0) {
      const line = buffer.slice(0, nl).trim();
      buffer = buffer.slice(nl + 1);
      if (!line.startsWith("data:")) continue; // blank lines + ": keepalive" comments
      const data = line.slice(5).trim();
      if (data === "[DONE]") return;
      let parsed: {
        choices?: { delta?: { content?: string } }[];
        error?: { message?: string };
      };
      try {
        parsed = JSON.parse(data);
      } catch {
        continue; // partial/non-JSON keepalive line
      }
      if (parsed.error) {
        throw new Error(parsed.error.message || "OpenRouter stream error");
      }
      const delta = parsed.choices?.[0]?.delta?.content;
      if (delta) yield delta;
    }
  }
}
