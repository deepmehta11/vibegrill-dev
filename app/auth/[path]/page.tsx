import { AuthView } from "@neondatabase/auth-ui";
import { OtpForm } from "@/app/auth/otp-form";

// Rendered dynamically (OpenNext/Cloudflare doesn't serve SSG dynamic-param
// routes reliably). Sign-in/up use a passwordless Email OTP form; other auth
// paths (e.g. callback) fall back to the Neon Auth UI view.
export const dynamic = "force-dynamic";

export default async function AuthPage({
  params,
}: {
  params: Promise<{ path: string }>;
}) {
  const { path } = await params;
  const isSignIn = path === "sign-in" || path === "sign-up";

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      {isSignIn ? <OtpForm /> : <AuthView path={path} />}
    </main>
  );
}
