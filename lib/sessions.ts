import "server-only";
import { sql } from "./db";
import { getWorkspaceTask } from "./tasks";

export type SessionStatus = "active" | "submitted";

export type SessionRow = {
  id: string;
  user_id: string;
  task_slug: string;
  status: SessionStatus;
  files: Record<string, string>;
  started_at: string;
  submitted_at: string | null;
};

export type MessageRow = {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

/** Snapshot the task's starter files into a new session for the user. */
export async function createSession(
  userId: string,
  taskSlug: string
): Promise<string> {
  const task = getWorkspaceTask(taskSlug);
  if (!task) throw new Error(`Unknown task: ${taskSlug}`);
  const files = Object.fromEntries(task.starter.map((f) => [f.path, f.content]));
  const rows = (await sql()`
    INSERT INTO sessions (user_id, task_slug, files)
    VALUES (${userId}, ${taskSlug}, ${JSON.stringify(files)}::jsonb)
    RETURNING id
  `) as { id: string }[];
  return rows[0].id;
}

export async function getSession(
  id: string,
  userId: string
): Promise<SessionRow | null> {
  const rows = (await sql()`
    SELECT id, user_id, task_slug, status, files, started_at, submitted_at
    FROM sessions WHERE id = ${id} AND user_id = ${userId}
  `) as SessionRow[];
  return rows[0] ?? null;
}

/** Save file state for an active session owned by the user. Returns false if
 * the session doesn't exist, isn't owned, or is already submitted. */
export async function updateSessionFiles(
  id: string,
  userId: string,
  files: Record<string, string>
): Promise<boolean> {
  const rows = (await sql()`
    UPDATE sessions SET files = ${JSON.stringify(files)}::jsonb
    WHERE id = ${id} AND user_id = ${userId} AND status = 'active'
    RETURNING id
  `) as { id: string }[];
  return rows.length > 0;
}

export async function markSubmitted(id: string, userId: string): Promise<void> {
  await sql()`
    UPDATE sessions SET status = 'submitted', submitted_at = now()
    WHERE id = ${id} AND user_id = ${userId}
  `;
}

export async function addMessage(
  sessionId: string,
  role: "user" | "assistant",
  content: string
): Promise<MessageRow> {
  const rows = (await sql()`
    INSERT INTO messages (session_id, role, content)
    VALUES (${sessionId}, ${role}, ${content})
    RETURNING id, role, content, created_at
  `) as MessageRow[];
  return rows[0];
}

export async function getMessages(sessionId: string): Promise<MessageRow[]> {
  return (await sql()`
    SELECT id, role, content, created_at
    FROM messages WHERE session_id = ${sessionId}
    ORDER BY created_at ASC
  `) as MessageRow[];
}

// ---- reports ----

export type TestScore = { passed: number; failed: number; total: number };
export type RubricDimension = { key: string; label: string; score: number; comment: string };
export type RubricReport = {
  dimensions: RubricDimension[];
  overall: number;
  summary: string;
};

export async function upsertReport(
  sessionId: string,
  testScore: TestScore,
  rubric: RubricReport
): Promise<void> {
  await sql()`
    INSERT INTO reports (session_id, test_score, rubric)
    VALUES (${sessionId}, ${JSON.stringify(testScore)}::jsonb, ${JSON.stringify(rubric)}::jsonb)
    ON CONFLICT (session_id)
    DO UPDATE SET test_score = EXCLUDED.test_score, rubric = EXCLUDED.rubric, created_at = now()
  `;
}

export type ReportRow = {
  session_id: string;
  test_score: TestScore | null;
  rubric: RubricReport | null;
  created_at: string;
};

export async function getReport(sessionId: string): Promise<ReportRow | null> {
  const rows = (await sql()`
    SELECT session_id, test_score, rubric, created_at
    FROM reports WHERE session_id = ${sessionId}
  `) as ReportRow[];
  return rows[0] ?? null;
}

export type SessionSummary = {
  id: string;
  task_slug: string;
  status: SessionStatus;
  started_at: string;
  submitted_at: string | null;
  test_score: TestScore | null;
  rubric: RubricReport | null;
};

export async function listSessionsForUser(
  userId: string
): Promise<SessionSummary[]> {
  return (await sql()`
    SELECT s.id, s.task_slug, s.status, s.started_at, s.submitted_at,
           r.test_score, r.rubric
    FROM sessions s
    LEFT JOIN reports r ON r.session_id = s.id
    WHERE s.user_id = ${userId}
    ORDER BY s.started_at DESC
    LIMIT 100
  `) as SessionSummary[];
}
