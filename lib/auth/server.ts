import { createNeonAuth, type NeonAuth } from "@neondatabase/auth/next/server";

// Constructed lazily. `next build` evaluates every route module that imports
// this file to collect page data; a top-level createNeonAuth() would read
// NEON_AUTH_COOKIE_SECRET before the Worker secrets exist and fail the build
// with "Missing required config: cookies.secret". Deferring construction to the
// first property access — which only ever happens while handling a request —
// means the secrets are read at runtime (Worker cold start), never at build.
let _auth: NeonAuth | null = null;
function getAuth(): NeonAuth {
  if (!_auth) {
    _auth = createNeonAuth({
      baseUrl: process.env.NEON_AUTH_BASE_URL!,
      cookies: {
        secret: process.env.NEON_AUTH_COOKIE_SECRET!,
      },
    });
  }
  return _auth;
}

/**
 * A lazy stand-in for the Neon Auth server instance. Importing it never builds
 * anything; the first real use (`auth.getSession()`, `auth.handler()`, …)
 * constructs the singleton and forwards to it.
 */
export const auth: NeonAuth = new Proxy({} as NeonAuth, {
  get(_target, prop) {
    const instance = getAuth() as unknown as Record<string | symbol, unknown>;
    const value = instance[prop];
    return typeof value === "function" ? value.bind(instance) : value;
  },
});

/**
 * Returns the authenticated user's id, or null. Use in server components,
 * server actions, and API routes to gate access and key data by user.
 */
export async function currentUserId(): Promise<string | null> {
  const { data: session } = await auth.getSession();
  return session?.user?.id ?? null;
}
