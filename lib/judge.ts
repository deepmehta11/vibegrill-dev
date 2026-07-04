import "server-only";
import { anthropic, JUDGE_MODEL, formatFiles } from "./anthropic";
import type { GeneratedTask } from "./content.generated";
import type { RubricReport } from "./sessions";
import type { TestResultItem } from "@/app/workspace/use-python";

const DIMENSIONS = [
  { key: "problem_decomposition", label: "Problem decomposition" },
  { key: "prompt_quality", label: "Prompt quality" },
  { key: "verification", label: "Verification habits" },
  { key: "catching_ai_errors", label: "Catching AI errors" },
  { key: "independence", label: "Independence" },
] as const;

const JUDGE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    dimensions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          key: { type: "string", enum: DIMENSIONS.map((d) => d.key) },
          label: { type: "string" },
          score: { type: "integer", enum: [1, 2, 3, 4, 5] },
          comment: { type: "string" },
        },
        required: ["key", "label", "score", "comment"],
      },
    },
    overall: { type: "integer", enum: [1, 2, 3, 4, 5] },
    summary: { type: "string" },
  },
  required: ["dimensions", "overall", "summary"],
};

const JUDGE_SYSTEM = `You are grading how well a candidate WORKED WITH AN AI on a coding exercise. You are NOT grading whether the code is correct — a hidden test suite already scored correctness. You grade their PROCESS.

The candidate had two ways to use the AI, and may have used either or both:
- ADVICE mode: a chat where the AI only gives advice; the candidate writes the code themselves.
- AGENT mode: the AI edits the files directly on the candidate's instruction (agent-turn assistant messages are prefixed with "[agent mode]"). Here the skill is DIRECTING and REVIEWING the agent — clear instructions, catching bad edits, verifying results.

Score each dimension from 1 (poor) to 5 (excellent), judging whichever mode(s) they used:
- problem_decomposition: Did they break the task into the right pieces and work deliberately (whether coding themselves or directing the agent), rather than flailing?
- prompt_quality: Were their messages/instructions to the AI specific and grounded in the actual code, spec, and tests — or vague?
- verification: Did they run the tests, read failures, and check the work (their own or the agent's) before submitting?
- catching_ai_errors: Did they notice and correct wrong or subtly-off AI output — bad advice, or a bad agent edit?
- independence: Did they understand and steer the solution, or just accept whatever the AI produced without engaging?

If there was NO interaction at all, they solved it solo: score prompt_quality and catching_ai_errors at 3 and say so. Use the task-specific rubric as your guide. Be fair, specific, and concrete — cite what they actually did. Keep each comment to 1-2 sentences. Give an overall score (1-5) and a short, direct summary the candidate can learn from.`;

function buildContent(
  task: GeneratedTask,
  files: Record<string, string>,
  transcript: string,
  testResult: { passed: number; failed: number; results?: TestResultItem[] }
): string {
  const changed = task.starter
    .filter((f) => (files[f.path] ?? "") !== f.content)
    .map((f) => f.path);
  const failing = (testResult.results ?? [])
    .filter((r) => r.outcome !== "passed")
    .map((r) => `- ${r.nodeid}: ${r.outcome}`)
    .join("\n");

  return [
    `# Task: ${task.title}\n${task.prompt}`,
    `# Grading rubric (task-specific)\n${task.rubric}`,
    `# Hidden test results\n${testResult.passed} passed, ${testResult.failed} failed.${
      failing ? `\nFailing:\n${failing}` : ""
    }`,
    `# Files the candidate changed: ${changed.join(", ") || "none"}`,
    `# Final files\n${formatFiles(files)}`,
    `# Chat transcript (candidate ↔ AI assistant)\n${transcript || "(no chat — solved solo)"}`,
  ].join("\n\n");
}

function fallbackReport(reason: string): RubricReport {
  return {
    dimensions: DIMENSIONS.map((d) => ({
      key: d.key,
      label: d.label,
      score: 3,
      comment: "Not scored.",
    })),
    overall: 3,
    summary: `The AI judge could not be run (${reason}). Your test results are still shown above.`,
  };
}

export async function runJudge(
  task: GeneratedTask,
  files: Record<string, string>,
  transcript: string,
  testResult: { passed: number; failed: number; results?: TestResultItem[] }
): Promise<RubricReport> {
  let client;
  try {
    client = anthropic();
  } catch (e) {
    return fallbackReport(e instanceof Error ? e.message : "no API key");
  }

  try {
    const response = await client.messages.create({
      model: JUDGE_MODEL,
      max_tokens: 2000,
      thinking: { type: "disabled" },
      system: JUDGE_SYSTEM,
      messages: [
        { role: "user", content: buildContent(task, files, transcript, testResult) },
      ],
      output_config: { format: { type: "json_schema", schema: JUDGE_SCHEMA } },
    });
    let jsonText = "";
    for (const block of response.content) {
      if (block.type === "text") jsonText += block.text;
    }
    const parsed = JSON.parse(jsonText) as RubricReport;
    // Ensure a stable, ordered dimension set for the UI.
    const byKey = new Map(parsed.dimensions.map((d) => [d.key, d]));
    parsed.dimensions = DIMENSIONS.map(
      (d) =>
        byKey.get(d.key) ?? {
          key: d.key,
          label: d.label,
          score: 3,
          comment: "Not scored.",
        }
    );
    return parsed;
  } catch (e) {
    return fallbackReport(e instanceof Error ? e.message : "judge error");
  }
}
