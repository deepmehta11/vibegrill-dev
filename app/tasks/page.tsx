import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { listTasks } from "@/lib/tasks";
import { SiteHeader } from "@/app/components/site-header";
import { CompanyBadge } from "@/app/components/company-badge";
import { startSession } from "./actions";

export const dynamic = "force-dynamic";

const DIFFICULTY: Record<string, { label: string; color: string }> = {
  easy: { label: "Easy", color: "var(--color-pass)" },
  medium: { label: "Medium", color: "var(--color-ember)" },
  hard: { label: "Hard", color: "var(--color-fail)" },
};

export default async function TasksPage() {
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect("/auth/sign-in");

  const tasks = listTasks();

  return (
    <>
      <SiteHeader user={session.user} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-14">
        <p className="term-label">// practice</p>
        <h1 className="mt-3 font-mono text-3xl font-semibold tracking-tight text-fg">
          Choose a challenge
        </h1>
        <p className="mt-2 text-muted">
          Pick a task, solve it with the AI, and get scored on how you worked.
        </p>

        <ul className="mt-9 space-y-3">
          {tasks.map((task) => {
            const diff = DIFFICULTY[task.difficulty] ?? {
              label: task.difficulty,
              color: "var(--color-faint)",
            };
            return (
              <li key={task.slug}>
                <form action={startSession}>
                  <input type="hidden" name="task" value={task.slug} />
                  <button
                    type="submit"
                    className="group flex w-full items-center justify-between gap-4 rounded-xl border border-line bg-panel/50 p-5 text-left transition-all hover:-translate-y-0.5 hover:border-ember/40 hover:bg-panel"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h2 className="font-mono text-lg font-semibold text-fg transition-colors group-hover:text-ember">
                          {task.title}
                        </h2>
                        <CompanyBadge company={task.company} />
                        <span
                          className="inline-flex items-center gap-1.5 font-mono text-[11px] font-medium lowercase"
                          style={{ color: diff.color }}
                        >
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ background: diff.color }}
                          />
                          {diff.label}
                        </span>
                      </div>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted">
                        {task.summary}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="font-mono text-xs text-faint tabular-nums">
                        ~{task.estimatedMinutes}m
                      </span>
                      <span className="grid h-8 w-8 place-items-center rounded-md border border-line font-mono text-muted transition-all group-hover:border-ember/50 group-hover:bg-ember-soft group-hover:text-ember">
                        ▸
                      </span>
                    </div>
                  </button>
                </form>
              </li>
            );
          })}
        </ul>
      </main>
    </>
  );
}
