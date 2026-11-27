import { NextResponse } from "next/server";
import {
  getLoginFingerprint,
  getLoginLock,
  recordLoginFailure,
  resetLoginFailures,
} from "@/lib/auth/login-attempts";

export const dynamic = "force-dynamic";
const passwordPolicy = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9\\s]).{12,128}$/;

async function verifyTurnstile(request: Request) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!siteKey && !secretKey) return null;
  if (!siteKey || !secretKey) {
    return NextResponse.json({ error: "Verifikasi keamanan belum dikonfigurasi dengan lengkap." }, { status: 503 });
  }

  const token = request.headers.get("x-captcha-response");
  if (!token) return NextResponse.json({ error: "Selesaikan verifikasi keamanan terlebih dahulu." }, { status: 403 });

  try {
    const form = new URLSearchParams({ secret: secretKey, response: token });
    const ip = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-real-ip");
    if (ip) form.set("remoteip", ip);
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: form,
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    const result = await response.json() as { success?: boolean };
    if (!response.ok || !result.success) {
      return NextResponse.json({ error: "Verifikasi keamanan gagal. Coba lagi." }, { status: 403 });
    }
    return null;
  } catch {
    return NextResponse.json({ error: "Layanan verifikasi sedang tidak tersedia." }, { status: 503 });
  }
}

export async function GET(request: Request, context: { params: Promise<{ path: string[] }> }) {
  return (await getAuthHandlers()).GET(request, context);
}
export async function PUT(request: Request, context: { params: Promise<{ path: string[] }> }) {
  return (await getAuthHandlers()).PUT(request, context);
}
export async function PATCH(request: Request, context: { params: Promise<{ path: string[] }> }) {
  return (await getAuthHandlers()).PATCH(request, context);
}
export async function DELETE(request: Request, context: { params: Promise<{ path: string[] }> }) {
  return (await getAuthHandlers()).DELETE(request, context);
}

export async function POST(request: Request) {
  const path = new URL(request.url).pathname;
  const isEmailLogin = path.endsWith("/sign-in/email");
  const isEmailSignup = path.endsWith("/sign-up/email");
  let fingerprint: string | null = null;

  if (isEmailSignup) {
    let body: { password?: unknown };
    try { body = await request.clone().json(); }
    catch { return NextResponse.json({ error: "Permintaan pendaftaran tidak valid." }, { status: 400 }); }
    if (typeof body.password !== "string" || !passwordPolicy.test(body.password)) {
      return NextResponse.json({
        error: "Password harus 12–128 karakter dan berisi huruf kapital, huruf kecil, angka, serta simbol.",
      }, { status: 400 });
    }
  }

  if (isEmailLogin) {
    let body: { email?: unknown };
    try { body = await request.clone().json(); }
    catch { return NextResponse.json({ error: "Permintaan login tidak valid." }, { status: 400 }); }
    if (typeof body.email !== "string" || body.email.length > 320) {
      return NextResponse.json({ error: "Kredensial tidak valid." }, { status: 400 });
    }
    try {
      fingerprint = getLoginFingerprint(body.email, request);
      const lock = await getLoginLock(fingerprint);
      if (lock.locked) {
        return NextResponse.json(
          { error: "Terlalu banyak percobaan login. Coba lagi setelah jeda berakhir." },
          { status: 429, headers: { "Retry-After": String(lock.retryAfter) } },
        );
      }
    } catch {
      return NextResponse.json({ error: "Perlindungan login sedang tidak tersedia. Coba lagi nanti." }, { status: 503 });
    }
  }

  if (isEmailLogin || isEmailSignup) {
    const captchaError = await verifyTurnstile(request);
    if (captchaError) return captchaError;
  }

  const authPath = new URL(request.url).pathname.replace("/api/auth/", "");
  const context = { params: Promise.resolve({ path: authPath.split("/").filter(Boolean) }) };
  const response = await (await getAuthHandlers()).POST(request, context);
  if (isEmailLogin && fingerprint) {
    try {
      if (response.status === 401) await recordLoginFailure(fingerprint);
      else if (response.ok) await resetLoginFailures(fingerprint);
    } catch {
      return NextResponse.json({ error: "Perlindungan login tidak tersedia. Coba lagi nanti." }, { status: 503 });
    }
  }
  return response;
}

// Preview configuration refresh: Neon Auth initialization remains request-scoped.
