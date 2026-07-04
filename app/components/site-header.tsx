import Link from "next/link";
import { UserMenu } from "./user-menu";

type HeaderUser = {
  name?: string | null;
  email?: string | null;
} | null;

export function Wordmark() {
  return (
    <Link href="/" className="group flex items-center gap-2.5">
      <span
        className="grid h-7 w-7 place-items-center rounded-[9px] font-display text-sm font-bold text-[#2a1400]"
        style={{
          background:
            "linear-gradient(160deg, var(--color-ember-bright), var(--color-ember-hot))",
          boxShadow: "0 4px 14px -4px rgba(245,158,11,0.7)",
        }}
      >
        V
      </span>
      <span className="font-display text-[17px] font-semibold tracking-tight text-fg">
        Vibe<span className="text-ember">Grill</span>
      </span>
    </Link>
  );
}

export function SiteHeader({ user }: { user: HeaderUser }) {
  return (
    <header className="sticky top-0 z-20 border-b border-line/70 bg-ink/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <Wordmark />
        <nav className="flex items-center gap-6 text-sm">
          {user ? (
            <>
              <Link
                href="/tasks"
                className="text-muted transition-colors hover:text-fg"
              >
                Tasks
              </Link>
              <Link
                href="/history"
                className="text-muted transition-colors hover:text-fg"
              >
                History
              </Link>
              <UserMenu />
            </>
          ) : (
            <Link
              href="/auth/sign-in"
              className="font-medium text-ember transition-colors hover:text-ember-bright"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
