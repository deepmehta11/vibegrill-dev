import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { getSession, getReport } from "@/lib/sessions";
import { listTasks } from "@/lib/tasks";
import { SiteHeader } from "@/app/components/site-header";

export const dynamic = "force-dynamic";

function ScoreDots({ score }: { score: number }) {
  return (
    <span className="flex gap-1.5" aria-label={`${score} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className="h-2 w-2 rounded-full"
          style={{
            background: n <= score ? "var(--color-ember)" : "var(--color-line)",
            boxShadow: n <= score ? "0 0 6px var(--color-ember-soft)" : "none",
          }}
        />
      ))}
    </span>
  );
}

export default async function ReportPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { data: authSession } = await auth.getSession();
  if (!authSession?.user) redirect("/auth/sign-in");

  const { sessionId } = await params;
  const session = await getSession(sessionId, authSession.user.id);
  if (!session) notFound();
  if (session.status !== "submitted") redirect(`/workspace/${sessionId}`);

  const report = await getReport(sessionId);
  const title =
    listTasks().find((t) => t.slug === session.task_slug)?.title ??
    session.task_slug;

  const testScore = report?.test_score;
  const rubric = report?.rubric;
  const testsAllGreen = testScore && testScore.failed === 0 && testScore.total > 0;

  return (
    <>
      <SiteHeader user={authSession.user} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-14">
        <p className="font-mono text-xs tracking-widest text-ember uppercase">
          Session report
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-fg">
          {title}
        </h1>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-line bg-panel/50 p-6">
            <p className="font-mono text-xs tracking-wide text-faint uppercase">
              Hidden tests
            </p>
            <p className="mt-2 font-display text-4xl font-semibold">
              <span style={{ color: testsAllGreen ? "var(--color-pass)" : "var(--color-fg)" }}>
                {testScore ? `${testScore.passed}/${testScore.total}` : "—"}
              </span>
              <span className="ml-2 text-base font-normal text-faint">passing</span>
            </p>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-line bg-panel/50 p-6">
            <p className="font-mono text-xs tracking-wide text-faint uppercase">
              AI collaboration
            </p>
            <p className="mt-2 font-display text-4xl font-semibold text-ember">
              {rubric ? `${rubric.overall}` : "—"}
              <span className="text-base font-normal text-faint">/5</span>
            </p>
            <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-ember/10 blur-2xl" />
          </div>
        </div>

        {rubric && (
          <>
            <div className="mt-6 rounded-2xl border border-line bg-panel/50 p-6">
              <p className="leading-relaxed text-muted">{rubric.summary}</p>
            </div>

            <h2 className="mt-10 font-display text-lg font-semibold text-fg">
              How you worked with the AI
            </h2>
            <ul className="mt-5 space-y-5">
              {rubric.dimensions.map((d) => (
                <li key={d.key} className="border-b border-line-soft pb-5 last:border-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-fg">{d.label}</span>
                    <ScoreDots score={d.score} />
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">
                    {d.comment}
                  </p>
                </li>
              ))}
            </ul>
          </>
        )}

        <div className="mt-12 flex flex-wrap gap-3">
          <Link
            href="/tasks"
            className="btn-ember inline-flex h-12 items-center justify-center rounded-full px-7 text-sm font-semibold"
          >
            Practice another task
          </Link>
          <Link
            href="/history"
            className="inline-flex h-12 items-center justify-center rounded-full border border-line px-6 text-sm font-medium text-fg transition-colors hover:bg-panel"
          >
            View history
          </Link>
        </div>
      </main>
    </>
  );
}
