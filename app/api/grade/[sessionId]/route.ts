import { currentUserId } from "@/lib/auth/server";
import {
  getSession,
  getMessages,
  updateSessionFiles,
  upsertReport,
  markSubmitted,
  type TestScore,
} from "@/lib/sessions";
import { getTaskFull } from "@/lib/tasks";
import { runJudge } from "@/lib/judge";
import type { TestResultItem } from "@/app/workspace/use-python";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const userId = await currentUserId();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { sessionId } = await params;
  let body: {
    files?: Record<string, string>;
    testResult?: { passed: number; failed: number; results?: TestResultItem[] };
  };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { files, testResult } = body;
  if (!files || !testResult) {
    return Response.json({ error: "Missing files or testResult" }, { status: 400 });
  }

  const session = await getSession(sessionId, userId);
  if (!session) return Response.json({ error: "Not found" }, { status: 404 });

  const task = getTaskFull(session.task_slug);
  if (!task) return Response.json({ error: "Task not found" }, { status: 404 });

  // Persist the final files (no-op if the session was already submitted).
  await updateSessionFiles(sessionId, userId, files);

  const passed = testResult.passed ?? 0;
  const failed = testResult.failed ?? 0;
  const testScore: TestScore = { passed, failed, total: passed + failed };

  const messages = await getMessages(sessionId);
  const transcript = messages
    .map((m) => `${m.role === "user" ? "CANDIDATE" : "ASSISTANT"}: ${m.content}`)
    .join("\n\n");

  const rubric = await runJudge(task, files, transcript, testResult);

  await upsertReport(sessionId, testScore, rubric);
  await markSubmitted(sessionId, userId);

  return Response.json({ ok: true });
}
