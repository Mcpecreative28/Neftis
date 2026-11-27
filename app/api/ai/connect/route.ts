import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { detectProvider, normalizeModels, providerHeaders, providers, type ProviderId } from "@/lib/ai/providers";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { data: session } = await auth.getSession();
  if (!session?.user) return NextResponse.json({ error: "Sign in to connect an AI provider." }, { status: 401 });

  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (origin && host && new URL(origin).host !== host) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  let body: { apiKey?: string; provider?: ProviderId };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  const apiKey = typeof body.apiKey === "string" ? body.apiKey.trim() : "";
  if (apiKey.length < 8 || apiKey.length > 512 || /[\r\n]/.test(apiKey)) {
    return NextResponse.json({ error: "API key format is invalid." }, { status: 400 });
  }

  const detected = detectProvider(apiKey);
  const providerId = body.provider ?? detected;
  if (!providerId || !(providerId in providers)) {
    return NextResponse.json({ needsProvider: true, providers: Object.values(providers).map(({ id, name }) => ({ id, name })) }, { status: 200 });
  }

  const provider = providers[providerId];
  const endpoint = provider.kind === "google" ? `${provider.baseUrl}/models` : `${provider.baseUrl}/models`;
  try {
    const response = await fetch(endpoint, {
      headers: providerHeaders(provider, apiKey),
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(9000),
    });
    if (!response.ok) {
      const status = response.status === 401 || response.status === 403 ? 401 : 502;
      return NextResponse.json({ error: status === 401 ? "API key rejected by provider." : `Provider returned HTTP ${response.status}.` }, { status });
    }
    const payload: unknown = await response.json();
    const models = normalizeModels(providerId, payload);
    if (!models.length) return NextResponse.json({ error: "The provider responded, but no compatible models were found." }, { status: 422 });
    return NextResponse.json({ provider: { id: provider.id, name: provider.name }, models });
  } catch {
    return NextResponse.json({ error: "Could not reach the provider. Check the key and try again." }, { status: 502 });
  }
}
