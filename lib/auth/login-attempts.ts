import { createHmac } from "node:crypto";
import { neon } from "@neondatabase/serverless";

type AttemptRow = { failed_attempts: number; locked_until: Date | string | null };

let client: ReturnType<typeof neon> | undefined;

function database() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required for login protection.");
  client ??= neon(process.env.DATABASE_URL);
  return client;
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
    const rows = await database()`SELECT failed_attempts, locked_until
    FROM neftis_security.login_attempts
    WHERE fingerprint = ${fingerprint}
    LIMIT 1`;
  const row = rows[0] as AttemptRow | undefined;
  if (!row?.locked_until) return { locked: false, retryAfter: 0 };
  const lockedAt = row.locked_until instanceof Date ? row.locked_until.getTime() : new Date(row.locked_until).getTime();
  const retryAfter = Math.max(0, Math.ceil((lockedAt - Date.now()) / 1000));
  return { locked: retryAfter > 0, retryAfter };
}

export async function recordLoginFailure(fingerprint: string) {
    const rows = await database()`INSERT INTO neftis_security.login_attempts AS attempts
      (fingerprint, failed_attempts, updated_at)
    VALUES (${fingerprint}, 1, now())
    ON CONFLICT (fingerprint) DO UPDATE SET
      failed_attempts = CASE
        WHEN attempts.updated_at < now() - interval '15 minutes' THEN 1
        ELSE attempts.failed_attempts + 1
      END,
      updated_at = now()
    RETURNING failed_attempts`;
  const attempts = Number((rows[0] as { failed_attempts?: number } | undefined)?.failed_attempts ?? 1);
  await database()`UPDATE neftis_security.login_attempts
    SET locked_until = CASE
      WHEN failed_attempts >= 3 THEN now() + make_interval(secs => LEAST(3600, (30 * power(2, failed_attempts - 3))::int))
      ELSE NULL
    END
    WHERE fingerprint = ${fingerprint}`;
  return attempts;
}

export async function resetLoginFailures(fingerprint: string) {
    await database()`DELETE FROM neftis_security.login_attempts WHERE fingerprint = ${fingerprint}`;
}
