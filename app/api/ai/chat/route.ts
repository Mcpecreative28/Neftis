import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { providerHeaders, providers, resolveProvider, type ProviderId } from "@/lib/ai/providers";

export const dynamic = "force-dynamic";
type ChatMessage = { role: "user" | "assistant"; content: string };
type Connection = { id: string; provider: ProviderId; apiKey: string; baseUrl?: string; model: string; reasoning?: string };

async function requestProvider(connection: Connection, messages: ChatMessage[]) {
  const provider = resolveProvider(connection.provider, connection.baseUrl);
  const headers = { ...providerHeaders(provider, connection.apiKey), "Content-Type": "application/json" };
  let response: Response;
  if (provider.kind === "anthropic") {
    response = await fetch(`${provider.baseUrl}/messages`, {
      method: "POST", headers,
      body: JSON.stringify({ model: connection.model, max_tokens: 2048, messages }),
      cache: "no-store", redirect: "error", signal: AbortSignal.timeout(60000),
    });
  } else if (provider.kind === "google") {
    const contents = messages.map((message) => ({ role: message.role === "assistant" ? "model" : "user", parts: [{ text: message.content }] }));
    response = await fetch(`${provider.baseUrl}/models/${encodeURIComponent(connection.model)}:generateContent`, {
      method: "POST", headers,
      body: JSON.stringify({ contents, generationConfig: { maxOutputTokens: 2048 } }),
      cache: "no-store", redirect: "error", signal: AbortSignal.timeout(60000),
    });
  } else {
    response = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: "POST", headers,
      body: JSON.stringify({ model: connection.model, messages, ...(connection.reasoning ? { reasoning_effort: connection.reasoning } : {}) }),
      cache: "no-store", redirect: "error", signal: AbortSignal.timeout(60000),
    });
  }

  const payload = await response.json().catch(() => ({})) as Record<string, any>;
  if (!response.ok) {
    const error = new Error(typeof payload.error?.message === "string" ? payload.error.message.slice(0, 240) : `Provider returned HTTP ${response.status}.`) as Error & { status: number };
    error.status = response.status;
    throw error;
  }
  const content = provider.kind === "anthropic"
    ? (payload.content ?? []).filter((part: any) => part.type === "text").map((part: any) => part.text).join("")
    : provider.kind === "google"
      ? (payload.candidates?.[0]?.content?.parts ?? []).map((part: any) => part.text ?? "").join("")
      : payload.choices?.[0]?.message?.content;
  if (typeof content !== "string") throw new Error("Provider returned an unsupported response format.");
  const usage = provider.kind === "anthropic"
    ? { input: payload.usage?.input_tokens ?? 0, output: payload.usage?.output_tokens ?? 0 }
    : provider.kind === "google"
      ? { input: payload.usageMetadata?.promptTokenCount ?? 0, output: payload.usageMetadata?.candidatesTokenCount ?? 0 }
      : { input: payload.usage?.prompt_tokens ?? 0, output: payload.usage?.completion_tokens ?? 0 };
  return { content, usage, providerName: provider.name };
}

function shouldFallback(error: unknown) {
  if (!(error instanceof Error)) return true;
  const status = (error as Error & { status?: number }).status;
  if (!status) return true;
  return [401, 402, 403, 404, 408, 409, 425, 429, 500, 502, 503, 504].includes(status);
}

export async function POST(request: Request) {
  const { data: session } = await auth.getSession();
  if (!session?.user) return NextResponse.json({ error: "Sign in to use Neftis AI." }, { status: 401 });

  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (origin && host && new URL(origin).host !== host) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });

  let body: { connections?: Connection[]; messages?: ChatMessage[] };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  const { connections, messages } = body;
  if (!Array.isArray(connections) || connections.length < 1 || connections.length > 8) {
    return NextResponse.json({ error: "Tambahkan minimal satu dan maksimal delapan koneksi AI." }, { status: 400 });
  }
  if (!Array.isArray(messages) || messages.length < 1 || messages.length > 40 ||
    messages.some((message) => !message || !["user", "assistant"].includes(message.role) || typeof message.content !== "string" || message.content.length > 24000)) {
    return NextResponse.json({ error: "Message content is invalid or too large." }, { status: 400 });
  }

  const failures: string[] = [];
  for (const connection of connections) {
    if (!connection || typeof connection !== "object" || typeof connection.id !== "string" ||
      !Object.hasOwn(providers, connection.provider) || typeof connection.apiKey !== "string" ||
      connection.apiKey.length < 8 || connection.apiKey.length > 512 ||
      typeof connection.model !== "string" || !connection.model || connection.model.length > 180) {
      failures.push("Satu koneksi memiliki konfigurasi yang tidak valid.");
      continue;
    }
    try {
      const result = await requestProvider(connection, messages);
      return NextResponse.json({ ...result, connectionId: connection.id, failover: failures.length > 0, failedBeforeSuccess: failures.length });
    } catch (error) {
      const status = (error as Error & { status?: number }).status;
      failures.push(`${connection.id}: ${status ? `HTTP ${status}` : "network/timeout"}`);
      if (!shouldFallback(error)) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Permintaan provider gagal.", fallbackStopped: true }, { status: 502 });
      }
    }
  }
  return NextResponse.json({ error: "Semua koneksi AI gagal. Periksa saldo, limit, token, dan status provider.", attempts: failures }, { status: 502 });
}
