import { currentUserId } from "@/lib/auth/server";
import { getSession } from "@/lib/sessions";
import { getHiddenTests } from "@/lib/tasks";

// Returns the hidden tests for the client to run in Pyodide at submit time.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const userId = await currentUserId();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { sessionId } = await params;
  const session = await getSession(sessionId, userId);
  if (!session) return Response.json({ error: "Not found" }, { status: 404 });

  const tests = getHiddenTests(session.task_slug);
  return Response.json({ tests });
}
