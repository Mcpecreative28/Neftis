import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { providerHeaders, providers, type ProviderId } from "@/lib/ai/providers";

export const dynamic = "force-dynamic";
type ChatMessage = { role: "user" | "assistant"; content: string };

export async function POST(request: Request) {
  const { data: session } = await auth.getSession();
  if (!session?.user) return NextResponse.json({ error: "Sign in to use Neftis AI." }, { status: 401 });

  let body: { provider?: ProviderId; apiKey?: string; model?: string; messages?: ChatMessage[]; reasoning?: string };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  const { provider: providerId, apiKey, model, messages, reasoning } = body;
  if (!providerId || !(providerId in providers) || typeof apiKey !== "string" || apiKey.length < 8 || apiKey.length > 512) {
    return NextResponse.json({ error: "Connect a valid provider first." }, { status: 400 });
  }
  if (typeof model !== "string" || model.length > 180 || !Array.isArray(messages) || messages.length < 1 || messages.length > 40) {
    return NextResponse.json({ error: "Choose a model and provide a valid conversation." }, { status: 400 });
  }
  if (messages.some((message) => !message || !["user", "assistant"].includes(message.role) || typeof message.content !== "string" || message.content.length > 24000)) {
    return NextResponse.json({ error: "Message content is invalid or too large." }, { status: 400 });
  }

  const provider = providers[providerId];
  const headers = { ...providerHeaders(provider, apiKey), "Content-Type": "application/json" };
  try {
    let response: Response;
    if (provider.kind === "anthropic") {
      const payload = await fetch(`${provider.baseUrl}/messages`, {
        method: "POST", headers: { ...headers, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({ model, max_tokens: 2048, messages }),
        cache: "no-store", redirect: "error", signal: AbortSignal.timeout(60000),
      });
      response = payload;
    } else if (provider.kind === "google") {
      const contents = messages.map((message) => ({ role: message.role === "assistant" ? "model" : "user", parts: [{ text: message.content }] }));
      response = await fetch(`${provider.baseUrl}/models/${encodeURIComponent(model)}:generateContent`, {
        method: "POST", headers,
        body: JSON.stringify({ contents, generationConfig: { maxOutputTokens: 2048 } }),
        cache: "no-store", redirect: "error", signal: AbortSignal.timeout(60000),
      });
    } else {
      response = await fetch(`${provider.baseUrl}/chat/completions`, {
        method: "POST", headers,
        body: JSON.stringify({ model, messages, ...(reasoning ? { reasoning_effort: reasoning } : {}) }),
        cache: "no-store", redirect: "error", signal: AbortSignal.timeout(60000),
      });
    }
    const payload = await response.json() as Record<string, any>;
    if (!response.ok) {
      const message = payload.error?.message;
      return NextResponse.json({ error: typeof message === "string" ? message.slice(0, 300) : `Provider returned HTTP ${response.status}.` }, { status: response.status >= 500 ? 502 : 400 });
    }
    const content = provider.kind === "anthropic"
      ? (payload.content ?? []).filter((part: any) => part.type === "text").map((part: any) => part.text).join("")
      : provider.kind === "google"
        ? (payload.candidates?.[0]?.content?.parts ?? []).map((part: any) => part.text ?? "").join("")
        : payload.choices?.[0]?.message?.content;
    if (typeof content !== "string") return NextResponse.json({ error: "Provider returned an unsupported response format." }, { status: 502 });
    const usage = provider.kind === "anthropic"
      ? { input: payload.usage?.input_tokens ?? 0, output: payload.usage?.output_tokens ?? 0 }
      : provider.kind === "google"
        ? { input: payload.usageMetadata?.promptTokenCount ?? 0, output: payload.usageMetadata?.candidatesTokenCount ?? 0 }
        : { input: payload.usage?.prompt_tokens ?? 0, output: payload.usage?.completion_tokens ?? 0 };
    return NextResponse.json({ content, usage });
  } catch {
    return NextResponse.json({ error: "The provider request failed or timed out." }, { status: 502 });
  }
}
