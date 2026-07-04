"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth/client";

export function MagicLinkForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const addr = email.trim();
    if (!addr || busy) return;
    setBusy(true);
    setError(null);
    try {
      const { error } = await authClient.signIn.magicLink({
        email: addr,
        callbackURL: "/",
      });
      if (error) {
        setError(error.message || "Could not send the sign-in link.");
      } else {
        setSent(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-6 flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded bg-indigo-500 font-mono text-sm text-white">
          V
        </span>
        <span className="text-lg font-semibold">VibeGrill</span>
      </div>

      {sent ? (
        <div className="rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
          <h1 className="text-lg font-semibold">Check your email</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            We sent a sign-in link to <strong>{email.trim()}</strong>. Click it
            to sign in — the link expires shortly.
          </p>
          <button
            type="button"
            onClick={() => {
              setSent(false);
              setError(null);
            }}
            className="mt-4 text-sm font-medium text-indigo-500 hover:text-indigo-400"
          >
            Use a different email
          </button>
        </div>
      ) : (
        <form
          onSubmit={send}
          className="rounded-xl border border-zinc-200 p-6 dark:border-zinc-800"
        >
          <h1 className="text-lg font-semibold">Sign in</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Enter your email and we&apos;ll send you a magic sign-in link — no
            password needed.
          </p>
          <label
            htmlFor="email"
            className="mt-5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-zinc-700"
          />
          {error && <p className="mt-3 text-sm text-rose-500">{error}</p>}
          <button
            type="submit"
            disabled={busy || !email.trim()}
            className="mt-4 flex h-11 w-full items-center justify-center rounded-full bg-indigo-500 px-6 text-sm font-semibold text-white transition-colors hover:bg-indigo-400 disabled:opacity-40"
          >
            {busy ? "Sending…" : "Email me a sign-in link"}
          </button>
        </form>
      )}
    </div>
  );
}
