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
        className="grid h-7 w-7 place-items-center rounded-[7px] border border-ember/40 bg-ember-soft font-mono text-sm font-bold text-ember transition-colors group-hover:border-ember/70"
        style={{ boxShadow: "0 0 16px -6px rgba(74,222,128,0.6)" }}
      >
        V
      </span>
      <span className="font-mono text-[16px] font-semibold tracking-tight text-fg">
        Vibe<span className="text-ember">Grill</span>
      </span>
    </Link>
  );
}

const navLink =
  "font-mono text-[13px] text-muted transition-colors hover:text-ember";

export function SiteHeader({ user }: { user: HeaderUser }) {
  return (
    <header className="sticky top-0 z-20 border-b border-line/70 bg-ink/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <Wordmark />
        <nav className="flex items-center gap-6">
          {user ? (
            <>
              <Link href="/tasks" className={navLink}>
                tasks
              </Link>
              <Link href="/history" className={navLink}>
                history
              </Link>
              <UserMenu />
            </>
          ) : (
            <Link
              href="/auth/sign-in"
              className="font-mono text-[13px] font-medium text-ember transition-colors hover:text-ember-bright"
            >
              sign in →
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
