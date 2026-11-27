import { NextResponse } from "next/server";
import { detectProvider, normalizeModels, providerHeaders, providers, resolveProvider, type ProviderId } from "@/lib/ai/providers";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { auth } = await import("@/lib/auth/server");
  const { data: session } = await auth.getSession();
  if (!session?.user) return NextResponse.json({ error: "Sign in to connect an AI provider." }, { status: 401 });

  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (origin && host) {
    try { if (new URL(origin).host !== host) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 }); }
    catch { return NextResponse.json({ error: "Invalid request origin." }, { status: 403 }); }
  }

  let body: {
    apiKey?: string;
    provider?: ProviderId;
    baseUrl?: string;
    protocol?: "openai" | "anthropic" | "google";
    authMode?: "bearer" | "x-api-key" | "google-key" | "none";
    displayName?: string;
  };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  if (body.protocol !== undefined && !["openai", "anthropic", "google"].includes(body.protocol)) {
    return NextResponse.json({ error: "Protokol API tidak didukung." }, { status: 400 });
  }
  if (body.authMode !== undefined && !["bearer", "x-api-key", "google-key", "none"].includes(body.authMode)) {
    return NextResponse.json({ error: "Metode autentikasi tidak didukung." }, { status: 400 });
  }
  const apiKey = typeof body.apiKey === "string" ? body.apiKey.trim() : "";
  if (apiKey.length < 8 || apiKey.length > 512 || /[\r\n]/.test(apiKey)) return NextResponse.json({ error: "API key format is invalid." }, { status: 400 });

  const detected = detectProvider(apiKey);
  const baseHost = body.baseUrl?.trim() ? new URL(body.baseUrl).hostname.toLowerCase() : "";
  const hostMatch = Object.values(providers).find((item) => item.baseUrl && new URL(item.baseUrl).hostname.toLowerCase() === baseHost)?.id;
  const providerId = body.provider ?? hostMatch ?? (body.baseUrl?.trim() ? "custom-openai" : detected);
  if (!providerId || !Object.hasOwn(providers, providerId)) {
    return NextResponse.json({ needsProvider: true, providers: Object.values(providers).map(({ id, name }) => ({ id, name })) });
  }

  let provider;
  try {
    const inferredProtocol = body.protocol ?? (baseHost.includes("generativelanguage.googleapis.com") ? "google" : baseHost.includes("anthropic.com") ? "anthropic" : "openai");
    const inferredAuth = body.authMode ?? (inferredProtocol === "google" ? "google-key" : inferredProtocol === "anthropic" ? "x-api-key" : "bearer");
    provider = resolveProvider(providerId, body.baseUrl, inferredProtocol, inferredAuth);
    if (providerId === "custom-openai" && typeof body.displayName === "string" && body.displayName.trim()) {
      provider.name = body.displayName.trim().slice(0, 48);
    }
  }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Base URL tidak valid." }, { status: 400 }); }

  try {
    const authModes = body.authMode ? [provider.keyHeader] : provider.kind === "google" ? ["google", "bearer", "x-api-key"] : provider.kind === "anthropic" ? ["anthropic", "x-api-key", "bearer"] : ["bearer", "x-api-key", "google"];
    let response: Response | null = null;
    let payload: unknown = null;
    for (const authMode of authModes) {
      const candidate = { ...provider, keyHeader: authMode as typeof provider.keyHeader };
      const attempt = await fetch(`${provider.baseUrl}/models`, { headers: providerHeaders(candidate, apiKey), cache: "no-store", redirect: "error", signal: AbortSignal.timeout(10000) });
      response = attempt;
      if (attempt.ok) { payload = await attempt.json(); provider.keyHeader = candidate.keyHeader; break; }
      if (attempt.status !== 401 && attempt.status !== 403) break;
    }
    if (!response?.ok) {
      const status = response?.status === 401 || response?.status === 403 ? 401 : 502;
      return NextResponse.json({ error: status === 401 ? "API key atau metode autentikasi tidak cocok." : `Endpoint mengembalikan HTTP ${response?.status ?? "unknown"}.` }, { status });
    }
    const models = normalizeModels(providerId, payload, provider.kind);
    if (!models.length) return NextResponse.json({ error: "Provider merespons, tetapi tidak mengirim daftar model yang kompatibel." }, { status: 422 });
    return NextResponse.json({
      provider: { id: provider.id, name: provider.name, baseUrl: provider.baseUrl, kind: provider.kind, keyHeader: provider.keyHeader },
      models,
    });
  } catch {
    return NextResponse.json({ error: "Tidak dapat menghubungi provider. Periksa Base URL dan token." }, { status: 502 });
  }
}
