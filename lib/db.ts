import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

let _sql: NeonQueryFunction<false, false> | null = null;

/**
 * Returns the Neon serverless query function (HTTP driver, safe on Workers).
 * Lazily constructed so `process.env.DATABASE_URL` is read per-runtime, not at
 * module-load during build.
 */
export function sql(): NeonQueryFunction<false, false> {
  if (!_sql) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    _sql = neon(url);
  }
  return _sql;
}
