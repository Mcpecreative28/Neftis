import { NextResponse } from "next/server";
import { detectProvider, normalizeModels, providerHeaders, providers, resolveProvider, type ProviderId } from "@/lib/ai/providers";

export const dynamic = "force-dynamic";

type Protocol = "openai" | "anthropic" | "google";
type AuthMode = "bearer" | "x-api-key" | "google-key" | "none";

function inferProtocol(baseUrl: string): Protocol {
  const host = new URL(baseUrl).hostname.toLowerCase();
  if (host.includes("anthropic")) return "anthropic";
  if (host.includes("generativelanguage.googleapis.com") || host.includes("googleapis.com")) return "google";
  return "openai";
}

function authCandidates(preferred?: AuthMode): AuthMode[] {
  const all: AuthMode[] = ["bearer", "x-api-key", "google-key"];
  return preferred && preferred !== "none" ? [preferred, ...all.filter((mode) => mode !== preferred)] : all;
}

export async function POST(request: Request) {
  const { auth } = await import("@/lib/auth/server");
  const { data: session } = await auth.getSession();
  if (!session?.user) return NextResponse.json({ error: "Masuk terlebih dahulu untuk menggunakan Neftis AI." }, { status: 401 });

  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (origin && host) {
    try { if (new URL(origin).host !== host) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 }); }
    catch { return NextResponse.json({ error: "Invalid request origin." }, { status: 403 }); }
  }

  let body: { apiKey?: string; provider?: ProviderId; baseUrl?: string; protocol?: Protocol; authMode?: AuthMode; displayName?: string };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  if (body.protocol !== undefined && !["openai", "anthropic", "google"].includes(body.protocol)) return NextResponse.json({ error: "Protokol API tidak didukung." }, { status: 400 });
  if (body.authMode !== undefined && !["bearer", "x-api-key", "google-key", "none"].includes(body.authMode)) return NextResponse.json({ error: "Metode autentikasi tidak didukung." }, { status: 400 });

  const apiKey = typeof body.apiKey === "string" ? body.apiKey.trim() : "";
  if (apiKey.length < 8 || apiKey.length > 512 || /[\r\n]/.test(apiKey)) return NextResponse.json({ error: "Format API key tidak valid." }, { status: 400 });

  const hasBaseUrl = typeof body.baseUrl === "string" && body.baseUrl.trim().length > 0;
  const detected = detectProvider(apiKey);
  const providerId = hasBaseUrl ? "custom-openai" : body.provider ?? detected;
  if (!providerId || !Object.hasOwn(providers, providerId)) {
    return NextResponse.json({ error: "Base URL diperlukan untuk token yang tidak memiliki pola provider yang dikenali.", needsBaseUrl: true }, { status: 400 });
  }

  let provider;
  try {
    const protocol = body.protocol ?? (hasBaseUrl ? inferProtocol(body.baseUrl!) : providerId === "google" ? "google" : providerId === "anthropic" ? "anthropic" : "openai");
    provider = resolveProvider(providerId, body.baseUrl, protocol, body.authMode ?? "bearer");
    if (providerId === "custom-openai") provider.name = body.displayName?.trim().slice(0, 48) || new URL(provider.baseUrl).hostname;
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Base URL tidak valid." }, { status: 400 });
  }

  const candidates = authCandidates(body.authMode);
  const diagnostics: string[] = [];
  for (const authMode of candidates) {
    const candidate = { ...provider, keyHeader: authMode === "google-key" ? "google" as const : authMode };
    try {
      const response = await fetch(`${provider.baseUrl}/models`, {
        headers: providerHeaders(candidate, apiKey),
        cache: "no-store",
        redirect: "error",
        signal: AbortSignal.timeout(9000),
      });
      if (response.status === 401 || response.status === 403) {
        diagnostics.push(`${authMode}: HTTP ${response.status}`);
        continue;
      }
      if (!response.ok) {
        const detail = (await response.text()).slice(0, 180);
        return NextResponse.json({ error: `Endpoint model mengembalikan HTTP ${response.status}. ${detail}`.trim(), endpoint: `${provider.baseUrl}/models` }, { status: 502 });
      }
      const payload: unknown = await response.json();
      const models = normalizeModels(providerId, payload, provider.kind);
      if (!models.length) {
        return NextResponse.json({ error: "Token diterima, tetapi endpoint /models tidak mengembalikan daftar model yang dikenali. Periksa format API atau masukkan model ID secara manual pada pengaturan lanjutan.", modelsUnavailable: true, endpoint: `${provider.baseUrl}/models` }, { status: 422 });
      }
      return NextResponse.json({
        provider: { id: provider.id, name: provider.name, baseUrl: provider.baseUrl, kind: provider.kind, keyHeader: authMode },
        models,
        detection: { protocol: provider.kind, authMode, method: "base-url" },
      });
    } catch (error) {
      diagnostics.push(`${authMode}: ${error instanceof Error ? error.name : "network error"}`);
      if (error instanceof Error && error.name === "TimeoutError") continue;
    }
  }
  return NextResponse.json({
    error: "Koneksi belum berhasil. Neftis sudah mencoba header Bearer, x-api-key, dan x-goog-api-key. Pastikan Base URL adalah alamat API, bukan halaman web, dan token memang berlaku untuk endpoint tersebut.",
    endpoint: `${provider.baseUrl}/models`,
    diagnostics,
  }, { status: 502 });
}
