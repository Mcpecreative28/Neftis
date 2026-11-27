export type ProviderId = "tokenharbor" | "9router" | "openrouter" | "mecutinai" | "anthropic" | "openai" | "google" | "custom-openai" | "groq" | "together" | "deepseek" | "mistral" | "cerebras" | "fireworks" | "siliconflow" | "novita" | "perplexity" | "xai" | "nvidia";

export type ProviderConfig = {
  id: ProviderId;
  name: string;
  baseUrl: string;
  kind: "openai" | "anthropic" | "google";
  keyHeader: "bearer" | "anthropic" | "google";
};

export const providers: Record<ProviderId, ProviderConfig> = {
  tokenharbor: { id: "tokenharbor", name: "Token Harbor", baseUrl: "https://tokenharbor.ai/v1", kind: "openai", keyHeader: "bearer" },
  "9router": { id: "9router", name: "9Router", baseUrl: "https://9router.com/v1", kind: "openai", keyHeader: "bearer" },
  openrouter: { id: "openrouter", name: "OpenRouter", baseUrl: "https://openrouter.ai/api/v1", kind: "openai", keyHeader: "bearer" },
  mecutinai: { id: "mecutinai", name: "MecutinAI", baseUrl: "https://mecutinai.com/api/v1", kind: "openai", keyHeader: "bearer" },
  anthropic: { id: "anthropic", name: "Anthropic", baseUrl: "https://api.anthropic.com/v1", kind: "anthropic", keyHeader: "anthropic" },
  openai: { id: "openai", name: "OpenAI", baseUrl: "https://api.openai.com/v1", kind: "openai", keyHeader: "bearer" },
  google: { id: "google", name: "Google AI Studio", baseUrl: "https://generativelanguage.googleapis.com/v1beta", kind: "google", keyHeader: "google" },
  "custom-openai": { id: "custom-openai", name: "Custom OpenAI-compatible", baseUrl: "", kind: "openai", keyHeader: "bearer" },
  groq: { id: "groq", name: "Groq", baseUrl: "https://api.groq.com/openai/v1", kind: "openai", keyHeader: "bearer" },
  together: { id: "together", name: "Together AI", baseUrl: "https://api.together.xyz/v1", kind: "openai", keyHeader: "bearer" },
  deepseek: { id: "deepseek", name: "DeepSeek", baseUrl: "https://api.deepseek.com", kind: "openai", keyHeader: "bearer" },
  mistral: { id: "mistral", name: "Mistral AI", baseUrl: "https://api.mistral.ai/v1", kind: "openai", keyHeader: "bearer" },
  cerebras: { id: "cerebras", name: "Cerebras", baseUrl: "https://api.cerebras.ai/v1", kind: "openai", keyHeader: "bearer" },
  fireworks: { id: "fireworks", name: "Fireworks AI", baseUrl: "https://api.fireworks.ai/inference/v1", kind: "openai", keyHeader: "bearer" },
  siliconflow: { id: "siliconflow", name: "SiliconFlow", baseUrl: "https://api.siliconflow.com/v1", kind: "openai", keyHeader: "bearer" },
  novita: { id: "novita", name: "Novita AI", baseUrl: "https://api.novita.ai/v3/openai", kind: "openai", keyHeader: "bearer" },
  perplexity: { id: "perplexity", name: "Perplexity", baseUrl: "https://api.perplexity.ai", kind: "openai", keyHeader: "bearer" },
  xai: { id: "xai", name: "xAI", baseUrl: "https://api.x.ai/v1", kind: "openai", keyHeader: "bearer" },
  nvidia: { id: "nvidia", name: "NVIDIA NIM", baseUrl: "https://integrate.api.nvidia.com/v1", kind: "openai", keyHeader: "bearer" },
};

export function detectProvider(apiKey: string): ProviderId | null {
  if (apiKey.startsWith("thk_")) return "tokenharbor";
  if (apiKey.startsWith("gsk_")) return "groq";
  if (apiKey.startsWith("csk-")) return "cerebras";
  if (apiKey.startsWith("sk-or-v1-")) return "openrouter";
  if (apiKey.startsWith("sk-ant-")) return "anthropic";
  if (apiKey.startsWith("AIza")) return "google";
  if (apiKey.startsWith("sk_")) return "mecutinai";
  if (apiKey.startsWith("9r_")) return "9router";
  if (apiKey.startsWith("sk-proj-") || apiKey.startsWith("sk-svcacct-") || apiKey.startsWith("sk-")) return "openai";
  return null;
}

export function resolveProvider(providerId: ProviderId, customBaseUrl?: string): ProviderConfig {
  const base = providers[providerId];
  return { ...base, baseUrl: providerId === "custom-openai" ? validateBaseUrl(customBaseUrl ?? "") : base.baseUrl };
}

export function validateBaseUrl(value: string): string {
  let url: URL;
  try { url = new URL(value.trim()); } catch { throw new Error("Base URL tidak valid."); }
  const host = url.hostname.toLowerCase();
  const blocked = host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") ||
    host === "metadata.google.internal" || /^127\./.test(host) || /^10\./.test(host) ||
    /^192\.168\./.test(host) || /^169\.254\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host) || (host === "::1" || host === "[::1]") || host.startsWith("[fc") || host.startsWith("[fd") || host.startsWith("[fe80");
  if (url.protocol !== "https:" || blocked || url.username || url.password || url.search || url.hash) {
    throw new Error("Base URL harus HTTPS publik tanpa kredensial, query, atau fragment.");
  }
  return url.toString().replace(/\/+$/, "");
}

export function providerHeaders(provider: ProviderConfig, apiKey: string): Record<string, string> {
  if (provider.keyHeader === "anthropic") return { "x-api-key": apiKey, "anthropic-version": "2023-06-01" };
  if (provider.keyHeader === "google") return { "x-goog-api-key": apiKey };
  return { Authorization: `Bearer ${apiKey}` };
}

export function normalizeModels(providerId: ProviderId, payload: unknown) {
  const body = payload as { data?: unknown[]; models?: unknown[] };
  const rows = providerId === "google" ? body.models : body.data;
  if (!Array.isArray(rows)) return [];
  return rows.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const item = entry as Record<string, unknown>;
    const rawId = typeof item.id === "string" ? item.id : typeof item.name === "string" ? item.name : "";
    const id = providerId === "google" ? rawId.replace(/^models\//, "") : rawId;
    if (!id || (providerId === "google" && !id.startsWith("gemini"))) return [];
    const reasoning = item.reasoning as { efforts?: unknown; default_effort?: unknown } | undefined;
    const efforts = Array.isArray(reasoning?.efforts) ? reasoning.efforts.filter((value): value is string => typeof value === "string") : [];
    return [{ id, name: typeof item.name === "string" ? item.name.replace(/^models\//, "") : id, reasoningEfforts: efforts, defaultReasoning: typeof reasoning?.default_effort === "string" ? reasoning.default_effort : null }];
  }).sort((a, b) => a.id.localeCompare(b.id));
}

export type ModelOption = ReturnType<typeof normalizeModels>[number];
