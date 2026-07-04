import Anthropic from "@anthropic-ai/sdk";

// Model split by job. The rubric JUDGE is the product's scoring core and runs
// only once per session, so cost is a rounding error — it's optimized for
// judgment quality (Opus 4.8). Agent mode's file-editing tool-use loop
// (CHAT_MODEL, used in app/api/agent) stays on Sonnet 5. The advice-mode
// assistant runs on GLM 5.2 via OpenRouter — see lib/openrouter.ts.
export const CHAT_MODEL = "claude-sonnet-5";
export const JUDGE_MODEL = "claude-opus-4-8";

let _client: Anthropic | null = null;

/** Lazily construct the Anthropic client so ANTHROPIC_API_KEY is read per-runtime. */
export function anthropic(): Anthropic {
  if (!_client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey.includes("REPLACE_ME")) {
      throw new Error("ANTHROPIC_API_KEY is not configured");
    }
    _client = new Anthropic({ apiKey });
  }
  return _client;
}

/** Renders a file map into a fenced-code context block for prompts. */
export function formatFiles(files: Record<string, string>): string {
  return Object.entries(files)
    .map(([path, content]) => {
      const lang = path.endsWith(".py") ? "python" : "";
      return `\`${path}\`\n\`\`\`${lang}\n${content}\n\`\`\``;
    })
    .join("\n\n");
}
