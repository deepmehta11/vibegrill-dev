// Client-safe task types (no server-only imports). Structurally compatible
// with the server-side WorkspaceTask returned by lib/tasks.ts.

export type ClientTaskFile = { path: string; content: string };

export type ClientTask = {
  slug: string;
  title: string;
  difficulty: string;
  estimatedMinutes: number;
  summary: string;
  entry: string;
  tags: string[];
  company: string | null;
  prompt: string;
  starter: ClientTaskFile[];
  visibleTests: ClientTaskFile[];
};

export type SessionStatus = "active" | "submitted";
