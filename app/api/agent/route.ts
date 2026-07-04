import Anthropic from "@anthropic-ai/sdk";
import { currentUserId } from "@/lib/auth/server";
import {
  getSession,
  addMessage,
  updateSessionFiles,
} from "@/lib/sessions";
import { getWorkspaceTask } from "@/lib/tasks";
import { anthropic, CHAT_MODEL, formatFiles } from "@/lib/anthropic";

const AGENT_SYSTEM = `You are an AI coding agent working INSIDE a candidate's workspace during a timed coding exercise. The candidate has switched you into "agent mode" and instructed you to make changes. You CAN edit their files using the provided tools.

Rules:
- Only edit the files you are given. NEVER edit or create test files, and do not try to read or guess hidden tests.
- Make the smallest change that satisfies the instruction and the task spec. Follow the spec exactly — output formats, rounding, edge cases all matter.
- Prefer edit_file for small targeted changes; use write_file when rewriting a whole file. read_file if you need to re-check current contents.
- When done, stop calling tools and write a SHORT final message summarizing what you changed and why. Do not paste the whole file back in the summary.
- If the instruction is ambiguous, make a reasonable choice and say so.`;

const tools: Anthropic.Tool[] = [
  {
    name: "read_file",
    description: "Read the current contents of one of the editable files.",
    input_schema: {
      type: "object",
      additionalProperties: false,
      properties: { path: { type: "string" } },
      required: ["path"],
    },
  },
  {
    name: "write_file",
    description: "Replace the entire contents of an editable file.",
    input_schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        path: { type: "string" },
        content: { type: "string" },
      },
      required: ["path", "content"],
    },
  },
  {
    name: "edit_file",
    description:
      "Replace an exact substring in an editable file. old_string must appear exactly once in the file.",
    input_schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        path: { type: "string" },
        old_string: { type: "string" },
        new_string: { type: "string" },
      },
      required: ["path", "old_string", "new_string"],
    },
  },
];

const MAX_STEPS = 8;

export async function POST(req: Request) {
  const userId = await currentUserId();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body: {
    sessionId?: string;
    message?: string;
    files?: Record<string, string>;
  };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { sessionId, message } = body;
  if (!sessionId || typeof message !== "string" || !message.trim()) {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }

  const session = await getSession(sessionId, userId);
  if (!session || session.status !== "active") {
    return Response.json({ error: "Session not found" }, { status: 404 });
  }
  const task = getWorkspaceTask(session.task_slug);
  if (!task) return Response.json({ error: "Task not found" }, { status: 404 });

  // Only the editable (starter) files are exposed to the agent.
  const editablePaths = new Set(task.starter.map((f) => f.path));
  const files: Record<string, string> = {};
  const incoming = body.files ?? session.files;
  for (const path of editablePaths) {
    files[path] = incoming[path] ?? "";
  }

  let client: Anthropic;
  try {
    client = anthropic();
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "AI not configured" },
      { status: 503 }
    );
  }

  const messages: Anthropic.MessageParam[] = [
    {
      role: "user",
      content: `# Task\n${task.prompt}\n\n# Files you can edit (current contents)\n${formatFiles(
        files
      )}\n\n# The candidate's instruction\n${message}`,
    },
  ];

  let summary = "";
  try {
    for (let step = 0; step < MAX_STEPS; step++) {
      const resp = await client.messages.create({
        model: CHAT_MODEL,
        max_tokens: 4096,
        thinking: { type: "disabled" },
        system: AGENT_SYSTEM,
        tools,
        messages,
      });

      const text = resp.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("");
      if (text.trim()) summary = text;

      const toolUses = resp.content.filter(
        (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
      );
      if (resp.stop_reason !== "tool_use" || toolUses.length === 0) break;

      messages.push({ role: "assistant", content: resp.content });

      const results: Anthropic.ToolResultBlockParam[] = [];
      for (const tu of toolUses) {
        const input = tu.input as Record<string, string>;
        let out = "ok";
        let isError = false;
        if (!(input.path in files)) {
          out = `ERROR: '${input.path}' is not an editable file. Editable files: ${Object.keys(
            files
          ).join(", ")}`;
          isError = true;
        } else if (tu.name === "read_file") {
          out = files[input.path];
        } else if (tu.name === "write_file") {
          files[input.path] = input.content ?? "";
        } else if (tu.name === "edit_file") {
          const cur = files[input.path];
          const first = cur.indexOf(input.old_string);
          if (first === -1) {
            out = "ERROR: old_string not found in file.";
            isError = true;
          } else if (cur.indexOf(input.old_string, first + 1) !== -1) {
            out = "ERROR: old_string is not unique; include more surrounding context.";
            isError = true;
          } else {
            files[input.path] = cur.replace(input.old_string, input.new_string);
          }
        }
        results.push({
          type: "tool_result",
          tool_use_id: tu.id,
          content: out,
          is_error: isError,
        });
      }
      messages.push({ role: "user", content: results });
    }
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Agent error" },
      { status: 500 }
    );
  }

  // Persist the turn (for the judge) and the edited files.
  await updateSessionFiles(sessionId, userId, { ...incoming, ...files });
  await addMessage(sessionId, "user", message);
  await addMessage(
    sessionId,
    "assistant",
    `[agent mode] ${summary || "(made edits)"}`
  );

  return Response.json({ files, summary: summary || "Done." });
}
