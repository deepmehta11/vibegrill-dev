import Link from "next/link";
import { auth } from "@/lib/auth/server";
import { SiteHeader, Wordmark } from "@/app/components/site-header";

export const dynamic = "force-dynamic";

const STEPS = [
  {
    n: "01",
    cmd: "pick",
    title: "Pick a realistic task",
    body: "Fix a bug or build a feature in a small Python codebase — or take on a real Meta / Google interview problem.",
  },
  {
    n: "02",
    cmd: "solve",
    title: "Solve it with an AI pair",
    body: "Chat for advice, or hand the wheel to an agent that edits your files. Everything runs right in your browser.",
  },
  {
    n: "03",
    cmd: "score",
    title: "Get scored on how you drove",
    body: "Hidden tests check correctness. An AI judge reviews the whole session and rates how well you drove the AI.",
  },
];

const DIMENSIONS = [
  {
    key: "decomposition",
    label: "Problem decomposition",
    body: "Did you break a fuzzy task into steps the AI could actually act on?",
  },
  {
    key: "prompt_quality",
    label: "Prompt quality",
    body: "Did you ask for the right thing, with the right context, precisely?",
  },
  {
    key: "verification",
    label: "Verification",
    body: "Did you run it, test it, and probe the output — instead of trusting it?",
  },
  {
    key: "catching_errors",
    label: "Catching AI errors",
    body: "Did you spot the bug the model introduced with total confidence?",
  },
  {
    key: "independence",
    label: "Independence",
    body: "Did you steer the work, or did the AI quietly end up driving you?",
  },
];

// Static, on-brand product shot for the hero — the screen candidates live in.
function WorkspacePreview() {
  return (
    <div className="vg-scan relative overflow-hidden rounded-xl border border-line bg-panel/70 shadow-[0_40px_90px_-40px_rgba(0,0,0,0.85)] backdrop-blur-sm">
      {/* window bar */}
      <div className="flex items-center gap-2 border-b border-line bg-ink/60 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-fail/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-ember/70" />
        <span className="ml-2 font-mono text-[11px] text-faint">
          rate-limiter · vibegrill workspace
        </span>
        <span className="ml-auto inline-flex items-center gap-1.5 font-mono text-[11px] text-ember">
          <span className="h-1.5 w-1.5 rounded-full bg-ember" />
          python ready
        </span>
      </div>

      <div className="grid grid-cols-[1fr_15rem]">
        {/* editor column */}
        <div className="min-w-0 border-r border-line">
          <div className="flex h-8 items-center border-b border-line bg-ink/40 font-mono text-[11px]">
            <span className="relative h-full px-3 py-2 text-fg">
              main.py
              <span className="absolute top-0 left-0 h-0.5 w-full bg-ember" />
            </span>
            <span className="px-3 py-2 text-faint">test_rate.py</span>
            <span className="ml-auto flex items-center gap-3 px-3 text-faint">
              <span className="text-ember">▸ run</span>
              <span className="text-ember">4/4 pass</span>
            </span>
          </div>
          <pre className="overflow-x-auto px-4 py-4 font-mono text-[12.5px] leading-[1.7] text-fg">
            <span className="text-faint"># fix the off-by-one at the window edge</span>
            {"\n"}
            <span className="text-amber">from</span> collections{" "}
            <span className="text-amber">import</span> deque{"\n"}
            {"\n"}
            <span className="text-amber">def</span>{" "}
            <span className="text-ember">rate_limit</span>(hits, window):{"\n"}
            {"    "}seen = <span className="text-muted">deque</span>(){"\n"}
            {"    "}
            <span className="text-amber">for</span> t{" "}
            <span className="text-amber">in</span> hits:{"\n"}
            {"        "}
            <span className="text-amber">while</span> seen{" "}
            <span className="text-amber">and</span> t - seen[
            <span className="text-amber-bright">0</span>] &gt;= window:{"\n"}
            {"            "}seen.popleft(){"\n"}
            {"        "}seen.append(t){"\n"}
            {"        "}
            <span className="text-amber">yield</span>{" "}
            <span className="text-muted">len</span>(seen)
            <span className="vg-caret" />
          </pre>
        </div>

        {/* chat column */}
        <div className="flex flex-col bg-ink/30">
          <div className="border-b border-line px-3 py-2 term-label">advice</div>
          <div className="flex flex-col gap-2.5 p-3">
            <div className="self-end rounded-md rounded-br-sm bg-ember px-2.5 py-1.5 text-[11.5px] text-[#04170c]">
              where&apos;s my off-by-one?
            </div>
            <p className="border-l-2 border-line pl-2.5 text-[11.5px] leading-relaxed text-muted">
              What does <span className="text-fg">&gt;=</span> include that{" "}
              <span className="text-fg">&gt;</span> wouldn&apos;t — the hit
              sitting exactly <span className="text-fg">window</span> ago?
            </p>
            <p className="font-mono text-[9.5px] tracking-wide text-faint">
              ▸ level 1 · nudge — no code yet
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function Home() {
  const { data: session } = await auth.getSession();
  const user = session?.user ?? null;

  return (
    <>
      <SiteHeader user={user} />
      <main className="relative flex flex-1 flex-col">
        {/* Hero */}
        <section className="relative mx-auto grid w-full max-w-6xl gap-14 px-6 pt-20 pb-24 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-10">
          <div>
            <div
              className="vg-rise mb-7 inline-flex w-fit items-center gap-2 rounded-md border border-line bg-panel/60 px-3 py-1 font-mono text-xs text-muted"
              style={{ animationDelay: "0ms" }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-ember vg-pulse" />
              ~/ai-assisted-coding-practice
            </div>

            <h1
              className="vg-rise font-mono text-4xl leading-[1.12] font-semibold tracking-tight text-fg sm:text-[3.25rem] sm:leading-[1.08]"
              style={{ animationDelay: "80ms" }}
            >
              Interviews now let
              <br />
              you use AI.
              <br />
              The real skill is{" "}
              <span className="text-ember">driving_it_well</span>
              <span className="vg-caret" />
            </h1>

            <p
              className="vg-rise mt-7 max-w-md text-lg leading-relaxed text-muted"
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
                className="btn-ember inline-flex h-12 items-center justify-center rounded-md px-6 font-mono text-sm font-semibold"
              >
                {user ? "▸ browse tasks" : "▸ start practicing"}
              </Link>
              {!user && (
                <Link
                  href="/auth/sign-in"
                  className="btn-ghost inline-flex h-12 items-center justify-center rounded-md px-5 font-mono text-sm font-medium"
                >
                  sign in
                </Link>
              )}
            </div>
          </div>

          <div className="vg-rise lg:pl-2" style={{ animationDelay: "320ms" }}>
            <WorkspacePreview />
          </div>
        </section>

        {/* Sourced-from strip */}
        <section className="border-y border-line/60 bg-panel/20">
          <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-8 gap-y-3 px-6 py-5">
            <span className="term-label">problems pulled from real interviews at</span>
            <div className="flex items-center gap-6 font-mono text-sm text-muted">
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#0866ff] shadow-[0_0_8px_#0866ff]" />
                Meta
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#ea4335] shadow-[0_0_8px_#ea4335]" />
                Google
              </span>
              <span className="text-faint">+ hand-authored codebases</span>
            </div>
          </div>
        </section>

        {/* How it works — a real sequence, so numbered */}
        <section className="mx-auto w-full max-w-6xl px-6 py-24">
          <p className="term-label">// how it works</p>
          <h2 className="mt-3 font-mono text-2xl font-semibold tracking-tight text-fg">
            Three steps, one browser tab
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {STEPS.map((step) => (
              <div
                key={step.n}
                className="group relative overflow-hidden rounded-xl border border-line bg-panel/40 p-6 transition-colors hover:border-ember/40"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm text-ember">{step.n}</span>
                  <span className="font-mono text-xs text-faint">
                    <span className="text-ember/70">$</span> {step.cmd}
                  </span>
                </div>
                <h3 className="mt-4 font-mono text-base font-semibold text-fg">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {step.body}
                </p>
                <div className="absolute -right-8 -bottom-8 h-24 w-24 rounded-full bg-ember/5 blur-2xl transition-all group-hover:bg-ember/10" />
              </div>
            ))}
          </div>
        </section>

        {/* What the judge scores — the differentiator */}
        <section className="border-t border-line/60 bg-panel/20">
          <div className="mx-auto w-full max-w-6xl px-6 py-24">
            <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
              <div>
                <p className="term-label">// what gets scored</p>
                <h2 className="mt-3 font-mono text-2xl leading-tight font-semibold tracking-tight text-fg">
                  We don&apos;t grade the code.
                  <br />
                  We grade how you{" "}
                  <span className="text-ember">drove the AI</span>.
                </h2>
                <p className="mt-5 max-w-md leading-relaxed text-muted">
                  Anyone can paste a prompt. The skill worth practicing is
                  everything around it. After each session an AI judge reads the
                  full transcript and your diff, then scores five dimensions —
                  the ones that actually separate a strong operator from a
                  copy-paster.
                </p>
              </div>

              <ul className="flex flex-col divide-y divide-line-soft rounded-xl border border-line bg-ink/40">
                {DIMENSIONS.map((d, i) => (
                  <li
                    key={d.key}
                    className="flex items-start gap-4 px-5 py-4"
                  >
                    <span className="mt-0.5 font-mono text-xs text-faint tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0">
                      <p className="font-mono text-sm font-medium text-fg">
                        {d.label}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-muted">
                        {d.body}
                      </p>
                    </div>
                    <span className="ml-auto hidden shrink-0 font-mono text-xs text-ember/60 sm:block">
                      1–5
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="mx-auto w-full max-w-6xl px-6 py-24">
          <div className="term-grid relative overflow-hidden rounded-2xl border border-ember/25 bg-panel/50 px-8 py-14 text-center">
            <div className="pointer-events-none absolute -top-16 left-1/2 h-40 w-80 -translate-x-1/2 rounded-full bg-ember/10 blur-3xl" />
            <p className="relative font-mono text-sm text-ember">
              <span className="text-ember/60">$</span> vibegrill start
            </p>
            <h2 className="relative mt-4 font-mono text-3xl font-semibold tracking-tight text-fg">
              Practice the skill the interview
              <br className="hidden sm:block" /> actually tests now.
            </h2>
            <div className="relative mt-8 flex justify-center">
              <Link
                href={user ? "/tasks" : "/auth/sign-in"}
                className="btn-ember inline-flex h-12 items-center justify-center rounded-md px-7 font-mono text-sm font-semibold"
              >
                {user ? "▸ browse tasks" : "▸ start practicing"}
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-line/60">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-4 px-6 py-8 sm:flex-row sm:items-center">
            <Wordmark />
            <p className="font-mono text-xs text-faint">
              Built for the interview that lets you use AI.
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}
