import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { listSessionsForUser } from "@/lib/sessions";
import { listTasks } from "@/lib/tasks";
import { SiteHeader } from "@/app/components/site-header";

export const dynamic = "force-dynamic";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function HistoryPage() {
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect("/auth/sign-in");

  const [sessions, tasks] = [
    await listSessionsForUser(session.user.id),
    listTasks(),
  ];
  const titleFor = new Map(tasks.map((t) => [t.slug, t.title]));

  return (
    <>
      <SiteHeader user={session.user} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-14">
        <p className="font-mono text-xs tracking-widest text-ember uppercase">
          History
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-fg">
          Your sessions
        </h1>
        <p className="mt-2 text-muted">
          Pick up where you left off, or review a scored session.
        </p>

        {sessions.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-line p-12 text-center">
            <p className="text-muted">No sessions yet.</p>
            <Link
              href="/tasks"
              className="mt-3 inline-block font-medium text-ember hover:text-ember-bright"
            >
              Browse tasks →
            </Link>
          </div>
        ) : (
          <ul className="mt-8 space-y-2">
            {sessions.map((s) => {
              const submitted = s.status === "submitted";
              const href = submitted ? `/report/${s.id}` : `/workspace/${s.id}`;
              return (
                <li key={s.id}>
                  <Link
                    href={href}
                    className="flex items-center justify-between gap-4 rounded-xl border border-line bg-panel/40 px-5 py-4 transition-colors hover:border-ember/30 hover:bg-panel"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-fg">
                        {titleFor.get(s.task_slug) ?? s.task_slug}
                      </p>
                      <p className="mt-0.5 font-mono text-xs text-faint">
                        {submitted ? "submitted" : "in progress"} ·{" "}
                        {formatDate(s.started_at)}
                      </p>
                    </div>
                    <div className="shrink-0 text-right text-sm">
                      {submitted && s.rubric ? (
                        <>
                          <span className="font-display font-semibold text-ember">
                            {s.rubric.overall}/5
                          </span>
                          {s.test_score && (
                            <span className="ml-2 font-mono text-xs text-faint">
                              {s.test_score.passed}/{s.test_score.total} tests
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-faint">
                          {submitted ? "scored" : "resume →"}
                        </span>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </>
  );
}
