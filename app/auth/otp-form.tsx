"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { Wordmark } from "@/app/components/site-header";

export function OtpForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    const addr = email.trim();
    if (!addr || busy) return;
    setBusy(true);
    setError(null);
    try {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email: addr,
        type: "sign-in",
      });
      if (error) setError(error.message || "Could not send the code.");
      else setStep("code");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    const code = otp.trim();
    if (!code || busy) return;
    setBusy(true);
    setError(null);
    try {
      const { error } = await authClient.signIn.emailOtp({
        email: email.trim(),
        otp: code,
      });
      if (error) {
        setError(error.message || "That code is invalid or expired.");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  const inputClass =
    "mt-1 w-full rounded-md border border-line bg-ink px-3 py-2.5 text-sm text-fg placeholder:text-faint outline-none transition-colors focus:border-ember/50";
  const buttonClass =
    "btn-ember mt-5 flex h-12 w-full items-center justify-center rounded-md px-6 font-mono text-sm font-semibold";

  return (
    <div className="w-full max-w-sm">
      <div className="mb-7 flex justify-center">
        <Wordmark />
      </div>

      <div className="relative overflow-hidden rounded-xl border border-line bg-panel/60 p-7">
        <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-ember/10 blur-3xl" />
        {step === "email" ? (
          <form onSubmit={sendCode}>
            <h1 className="font-mono text-xl font-semibold text-fg">Sign in</h1>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              Enter your email and we&apos;ll send you a one-time code — no
              password needed.
            </p>
            <label
              htmlFor="email"
              className="mt-6 block text-sm font-medium text-muted"
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
              className={inputClass}
            />
            {error && <p className="mt-3 text-sm text-fail">{error}</p>}
            <button type="submit" disabled={busy || !email.trim()} className={buttonClass}>
              {busy ? "Sending…" : "Email me a code →"}
            </button>
          </form>
        ) : (
          <form onSubmit={verify}>
            <h1 className="font-mono text-xl font-semibold text-fg">
              Enter your code
            </h1>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              We sent a 6-digit code to{" "}
              <strong className="text-fg">{email.trim()}</strong>. It expires
              shortly.
            </p>
            <label htmlFor="otp" className="mt-6 block text-sm font-medium text-muted">
              Code
            </label>
            <input
              id="otp"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 8))}
              placeholder="123456"
              className={`${inputClass} font-mono text-lg tracking-[0.5em]`}
            />
            {error && <p className="mt-3 text-sm text-fail">{error}</p>}
            <button type="submit" disabled={busy || !otp.trim()} className={buttonClass}>
              {busy ? "Verifying…" : "Verify & sign in"}
            </button>
            <div className="mt-4 flex justify-between text-sm">
              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setOtp("");
                  setError(null);
                }}
                className="font-medium text-faint transition-colors hover:text-muted"
              >
                Different email
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => sendCode(new Event("submit") as unknown as React.FormEvent)}
                className="font-medium text-ember transition-colors hover:text-ember-bright disabled:opacity-40"
              >
                Resend code
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
