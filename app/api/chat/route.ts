import { currentUserId } from "@/lib/auth/server";
import {
  getSession,
  getMessages,
  addMessage,
  updateSessionFiles,
} from "@/lib/sessions";
import { getWorkspaceTask } from "@/lib/tasks";
import { streamChat } from "@/lib/openrouter";
import { buildTutorSystem } from "@/lib/tutor-prompt";

export async function POST(req: Request) {
  const userId = await currentUserId();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  let body: {
    sessionId?: string;
    message?: string;
    files?: Record<string, string>;
  };
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }
  const { sessionId, message, files } = body;
  if (!sessionId || typeof message !== "string" || !message.trim()) {
    return new Response("Bad request", { status: 400 });
  }

  const session = await getSession(sessionId, userId);
  if (!session || session.status !== "active") {
    return new Response("Session not found", { status: 404 });
  }
  const task = getWorkspaceTask(session.task_slug);
  if (!task) return new Response("Task not found", { status: 404 });

  const currentFiles =
    files && typeof files === "object" ? files : session.files;
  // Persist current files (best-effort) and the user's message.
  if (files && typeof files === "object") {
    await updateSessionFiles(sessionId, userId, files);
  }
  await addMessage(sessionId, "user", message);

  const history = await getMessages(sessionId);
  // Progressive disclosure: how much the tutor may reveal escalates with the
  // number of turns the candidate has spent on this problem (session = 1 task).
  const userTurns = history.filter((m) => m.role === "user").length;
  const system = buildTutorSystem(task.prompt, currentFiles, userTurns);

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      let full = "";
      try {
        for await (const delta of streamChat({
          system,
          messages: history.map((m) => ({ role: m.role, content: m.content })),
          maxTokens: 1500,
        })) {
          full += delta;
          controller.enqueue(encoder.encode(delta));
        }
      } catch {
        controller.enqueue(
          encoder.encode("\n\n⚠️ The assistant hit an error. Please try again.")
        );
      } finally {
        if (full.trim()) {
          try {
            await addMessage(sessionId, "assistant", full);
          } catch {
            // best-effort persistence
          }
        }
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
