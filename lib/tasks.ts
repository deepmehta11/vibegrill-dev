import "server-only";
import {
  TASKS,
  type GeneratedTask,
  type TaskFile,
} from "./content.generated";

export type { GeneratedTask, TaskFile };

/** Metadata shown in task lists — safe for the client. */
export type TaskListItem = Pick<
  GeneratedTask,
  | "slug"
  | "title"
  | "difficulty"
  | "estimatedMinutes"
  | "summary"
  | "tags"
  | "company"
>;

/** Everything the in-browser workspace needs — deliberately excludes the
 * grading rubric and hidden tests so they are never serialized to the client. */
export type WorkspaceTask = Omit<GeneratedTask, "rubric" | "hiddenTests">;

export function listTasks(): TaskListItem[] {
  return Object.values(TASKS)
    .map(
      ({ slug, title, difficulty, estimatedMinutes, summary, tags, company }) => ({
        slug,
        title,
        difficulty,
        estimatedMinutes,
        summary,
        tags,
        company,
      })
    )
    .sort((a, b) => a.estimatedMinutes - b.estimatedMinutes);
}

export function taskExists(slug: string): boolean {
  return slug in TASKS;
}

export function getWorkspaceTask(slug: string): WorkspaceTask | null {
  const task = TASKS[slug];
  if (!task) return null;
  // Strip rubric + hiddenTests.
  const { rubric: _rubric, hiddenTests: _hidden, ...safe } = task;
  void _rubric;
  void _hidden;
  return safe;
}

/** Server-only: full task including rubric + hidden tests, for grading. */
export function getTaskFull(slug: string): GeneratedTask | null {
  return TASKS[slug] ?? null;
}

export function getHiddenTests(slug: string): TaskFile[] {
  return TASKS[slug]?.hiddenTests ?? [];
}

export function getRubric(slug: string): string {
  return TASKS[slug]?.rubric ?? "";
}
