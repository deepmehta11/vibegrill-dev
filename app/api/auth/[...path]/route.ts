import { auth } from "@/lib/auth/server";

// Delegate per-request rather than `export const { GET, POST } = auth.handler()`
// at module load: that top-level call would construct Neon Auth during
// `next build` page-data collection, before the cookie secret exists. Building
// the handler on each request keeps auth construction at runtime only.
type AuthHandlers = ReturnType<typeof auth.handler>;

export function GET(...args: Parameters<AuthHandlers["GET"]>) {
  return auth.handler().GET(...args);
}

export function POST(...args: Parameters<AuthHandlers["POST"]>) {
  return auth.handler().POST(...args);
}
