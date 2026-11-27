import { createHmac } from "node:crypto";
import { neon } from "@neondatabase/serverless";

type AttemptRow = { failed_attempts: number; locked_until: Date | string | null };

let client: ReturnType<typeof neon> | undefined;
let tableReady: Promise<unknown> | undefined;

function database() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required for login protection.");
  client ??= neon(process.env.DATABASE_URL);
  return client;
}

async function ensureTable() {
  tableReady ??= database()`CREATE TABLE IF NOT EXISTS public.neftis_auth_login_attempts (
    fingerprint text PRIMARY KEY,
    failed_attempts integer NOT NULL DEFAULT 0,
    locked_until timestamptz,
    updated_at timestamptz NOT NULL DEFAULT now()
  )`;
  await tableReady;
}

export function getLoginFingerprint(email: string, request: Request) {
  const secret = process.env.NEON_AUTH_COOKIE_SECRET;
  if (!secret || secret.length < 32) throw new Error("NEON_AUTH_COOKIE_SECRET is not configured.");
  const forwarded = request.headers.get("cf-connecting-ip")
    ?? request.headers.get("x-real-ip")
    ?? request.headers.get("x-forwarded-for")?.split(",").at(-1)?.trim()
    ?? "unknown";
  return createHmac("sha256", secret)
    .update(`${email.trim().toLowerCase()}\0${forwarded}`)
    .digest("hex");
}

export async function getLoginLock(fingerprint: string) {
  await ensureTable();
  const rows = await database()`SELECT failed_attempts, locked_until
    FROM public.neftis_auth_login_attempts
    WHERE fingerprint = ${fingerprint}
    LIMIT 1`;
  const row = rows[0] as AttemptRow | undefined;
  if (!row?.locked_until) return { locked: false, retryAfter: 0 };
  const retryAfter = Math.max(0, Math.ceil((new Date(row.locked_until).getTime() - Date.now()) / 1000));
  return { locked: retryAfter > 0, retryAfter };
}

export async function recordLoginFailure(fingerprint: string) {
  await ensureTable();
  const rows = await database()`INSERT INTO public.neftis_auth_login_attempts
      (fingerprint, failed_attempts, updated_at)
    VALUES (${fingerprint}, 1, now())
    ON CONFLICT (fingerprint) DO UPDATE SET
      failed_attempts = CASE
        WHEN public.neftis_auth_login_attempts.updated_at < now() - interval '15 minutes' THEN 1
        ELSE public.neftis_auth_login_attempts.failed_attempts + 1
      END,
      updated_at = now()
    RETURNING failed_attempts`;
  const attempts = Number((rows[0] as { failed_attempts?: number } | undefined)?.failed_attempts ?? 1);
  await database()`UPDATE public.neftis_auth_login_attempts
    SET locked_until = CASE
      WHEN failed_attempts >= 3 THEN now() + make_interval(secs => LEAST(3600, (30 * power(2, failed_attempts - 3))::int))
      ELSE NULL
    END
    WHERE fingerprint = ${fingerprint}`;
  return attempts;
}

export async function resetLoginFailures(fingerprint: string) {
  await ensureTable();
  await database()`DELETE FROM public.neftis_auth_login_attempts WHERE fingerprint = ${fingerprint}`;
}
