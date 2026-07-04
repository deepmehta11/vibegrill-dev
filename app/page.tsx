import Link from "next/link";
import { auth } from "@/lib/auth/server";
import { SiteHeader } from "@/app/components/site-header";

export const dynamic = "force-dynamic";

const STEPS = [
  {
    n: "01",
    title: "Pick a realistic task",
    body: "Fix a bug or build a feature in a small Python codebase — or take on a real Meta / Google interview problem.",
  },
  {
    n: "02",
    title: "Solve it with an AI pair",
    body: "Chat for advice, or hand the wheel to an agent that edits your files. Everything runs right in your browser.",
  },
  {
    n: "03",
    title: "Get scored on how you drove it",
    body: "Hidden tests check correctness. An AI judge reviews the whole session and rates how well you drove the AI.",
  },
];

export default async function Home() {
  const { data: session } = await auth.getSession();
  const user = session?.user ?? null;

  return (
    <>
      <SiteHeader user={user} />
      <main className="relative flex flex-1 flex-col overflow-hidden">
        {/* Hero */}
        <section className="relative mx-auto flex w-full max-w-5xl flex-col px-6 pt-24 pb-20">
          <div
            className="vg-rise mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-line bg-panel/60 px-3 py-1 font-mono text-xs text-muted"
            style={{ animationDelay: "0ms" }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-ember vg-pulse" />
            AI-assisted coding practice
          </div>

          <h1
            className="vg-rise max-w-3xl font-display text-5xl leading-[1.05] font-semibold tracking-tight text-fg sm:text-6xl"
            style={{ animationDelay: "80ms" }}
          >
            Interviews now let you use AI.
            <br />
            The real skill is{" "}
            <span className="relative whitespace-nowrap text-ember">
              driving it well
              <svg
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 300 12"
                fill="none"
                preserveAspectRatio="none"
              >
                <path
                  d="M2 8C60 3 120 3 180 6C220 8 260 5 298 4"
                  stroke="var(--color-ember-hot)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  opacity="0.7"
                />
              </svg>
            </span>
            .
          </h1>

          <p
            className="vg-rise mt-7 max-w-xl text-lg leading-relaxed text-muted"
            style={{ animationDelay: "160ms" }}
          >
            VibeGrill gives you realistic Python tasks, an AI pair to work
            alongside, and a score on how well you collaborated with it — not
            just whether the tests passed.
          </p>

          <div
            className="vg-rise mt-9 flex flex-wrap items-center gap-3"
            style={{ animationDelay: "240ms" }}
          >
            <Link
              href={user ? "/tasks" : "/auth/sign-in"}
              className="btn-ember inline-flex h-12 items-center justify-center rounded-full px-7 text-sm font-semibold"
            >
              {user ? "Browse tasks" : "Start practicing"} →
            </Link>
            {!user && (
              <Link
                href="/auth/sign-in"
                className="inline-flex h-12 items-center justify-center rounded-full border border-line px-6 text-sm font-medium text-fg transition-colors hover:bg-panel"
              >
                Sign in
              </Link>
            )}
          </div>
        </section>

        {/* Steps */}
        <section className="mx-auto grid w-full max-w-5xl gap-4 px-6 pb-28 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <div
              key={step.n}
              className="vg-rise group relative overflow-hidden rounded-2xl border border-line bg-panel/50 p-6 transition-colors hover:border-ember/40"
              style={{ animationDelay: `${320 + i * 90}ms` }}
            >
              <span className="font-mono text-sm text-ember">{step.n}</span>
              <h3 className="mt-3 font-display text-lg font-semibold text-fg">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {step.body}
              </p>
              <div className="absolute -right-8 -bottom-8 h-24 w-24 rounded-full bg-ember/5 blur-2xl transition-all group-hover:bg-ember/10" />
            </div>
          ))}
        </section>
      </main>
    </>
  );
}
