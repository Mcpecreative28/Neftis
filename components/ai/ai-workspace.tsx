"use client";

import { FormEvent, useMemo, useState } from "react";

type Provider = { id: string; name: string; kind?: "openai" | "anthropic" | "google"; keyHeader?: string };
type Model = { id: string; name: string; reasoningEfforts: string[]; defaultReasoning: string | null };
type Message = { role: "user" | "assistant"; content: string };
type Connection = {
  id: string; provider: Provider; apiKey: string; baseUrl: string; models: Model[];
  modelId: string; reasoning: string; healthy: boolean;
  protocol: "openai" | "anthropic" | "google";
  authMode?: "bearer" | "x-api-key" | "google-key" | "none";
};

const providerNames: Provider[] = [
  { id: "tokenharbor", name: "Token Harbor" }, { id: "9router", name: "9Router" },
  { id: "openrouter", name: "OpenRouter" }, { id: "mecutinai", name: "MecutinAI" },
  { id: "anthropic", name: "Anthropic / Claude" }, { id: "openai", name: "OpenAI" },
  { id: "google", name: "Google AI Studio / Gemini" }, { id: "groq", name: "Groq" },
  { id: "together", name: "Together AI" }, { id: "deepseek", name: "DeepSeek" },
  { id: "mistral", name: "Mistral AI" }, { id: "cerebras", name: "Cerebras" },
  { id: "fireworks", name: "Fireworks AI" }, { id: "siliconflow", name: "SiliconFlow" },
  { id: "novita", name: "Novita AI" }, { id: "perplexity", name: "Perplexity" },
  { id: "xai", name: "xAI" }, { id: "nvidia", name: "NVIDIA NIM" },
  { id: "custom-openai", name: "Custom API / Telegram Gateway" },
];

export default function AIWorkspace() {
  const [apiKey, setApiKey] = useState("");
  const [providerChoice, setProviderChoice] = useState("auto");
  const [baseUrl, setBaseUrl] = useState("");
  const [customName, setCustomName] = useState("Koneksi API");
  const [customProtocol, setCustomProtocol] = useState<"openai" | "anthropic" | "google">("openai");
  const [customAuthMode, setCustomAuthMode] = useState<"bearer" | "x-api-key" | "google-key" | "none">("bearer");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [providerChoices, setProviderChoices] = useState<Provider[]>(providerNames);
  const [needsProvider, setNeedsProvider] = useState(false);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [lastUsage, setLastUsage] = useState<{input:number;output:number}|null>(null);
  const [activeConnectionId, setActiveConnectionId] = useState("");

  const activeConnection = useMemo(
    () => connections.find((item) => item.id === activeConnectionId) ?? connections[0] ?? null,
    [connections, activeConnectionId],
  );

  function updateConnection(id: string, patch: Partial<Connection>) {
    setConnections((items) => items.map((item) => item.id === id ? { ...item, ...patch } : item));
  }

  async function connect(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!apiKey.trim() || connecting || connections.length >= 8) return;
    setConnecting(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/ai/connect", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: apiKey.trim(),
          ...(baseUrl.trim() ? { provider: "custom-openai" } : {}),
          ...(baseUrl.trim() ? {
            baseUrl: baseUrl.trim(),
            displayName: new URL(baseUrl.trim()).hostname,
            ...(showAdvanced ? { protocol: customProtocol, authMode: customAuthMode } : {}),
          } : {}),
        }),
      });
      const result = await response.json();
      if (result.needsProvider) {
        setProviderChoices(result.providers ?? providerNames);
        setNeedsProvider(true);
        setError("Token belum dikenali. Pilih layanan atau gunakan gateway dengan Base URL khusus.");
        return;
      }
      if (!response.ok) throw new Error(result.error ?? "Provider tidak dapat dihubungkan.");
      const entry: Connection = {
        id: crypto.randomUUID(), provider: result.provider, apiKey: apiKey.trim(),
        baseUrl: result.provider.baseUrl ?? "", models: result.models ?? [],
        modelId: result.models?.[0]?.id ?? "", reasoning: "", healthy: true,
        protocol: result.provider.kind ?? "openai",
        authMode: result.provider.id === "custom-openai" ? (result.provider.keyHeader === "google" ? "google-key" : result.provider.keyHeader) : undefined,
      };
      setConnections((items) => [...items, entry]);
      setActiveConnectionId(entry.id);
      setApiKey(""); setBaseUrl(""); setProviderChoice("auto"); setNeedsProvider(false);
      setCustomName("Koneksi API"); setCustomProtocol("openai"); setCustomAuthMode("bearer"); setShowAdvanced(false);
      setNotice(`${entry.provider.name} terhubung · ${entry.models.length} model ditemukan.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Koneksi provider gagal.");
    } finally { setConnecting(false); }
  }

  function removeConnection(id: string) {
    setConnections((items) => {
      const next = items.filter((item) => item.id !== id);
      if (activeConnectionId === id) setActiveConnectionId(next[0]?.id ?? "");
      return next;
    });
  }

  function moveConnection(id: string, direction: -1 | 1) {
    setConnections((items) => {
      const index = items.findIndex((item) => item.id === id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= items.length) return items;
      const next = [...items];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!connections.length || !activeConnection?.modelId || !draft.trim() || sending) return;
    const nextMessages = [...messages, { role: "user" as const, content: draft.trim() }];
    setMessages(nextMessages); setDraft(""); setSending(true); setError(""); setNotice("");
    const ordered = connections.filter((item) => item.modelId).map((item) => ({
      id: item.id, provider: item.provider.id, apiKey: item.apiKey, baseUrl: item.baseUrl,
      protocol: item.protocol, ...(item.authMode ? { authMode: item.authMode } : {}),
      model: item.modelId, ...(item.reasoning ? { reasoning: item.reasoning } : {}),
    }));
    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connections: ordered, messages: nextMessages }),
      });
      const result = await response.json();
      if (!response.ok) {
        const detail = Array.isArray(result.attempts) && result.attempts.length ? " (" + result.attempts.join(" · ") + ")" : "";
        throw new Error((result.error ?? "Permintaan AI gagal.") + detail);
      }
      setMessages([...nextMessages, { role: "assistant", content: result.content }]);
      setLastUsage(result.usage ?? null);
      if (result.connectionId) {
        setActiveConnectionId(result.connectionId);
        setConnections((items) => items.map((item) => ({ ...item, healthy: item.id === result.connectionId ? true : item.healthy })));
      }
      if (result.failover) setNotice(`Koneksi utama gagal. Neftis otomatis beralih setelah ${result.failedBeforeSuccess} percobaan.`);
    } catch (cause) {
      setMessages(messages);
      setError(cause instanceof Error ? cause.message : "Permintaan AI gagal.");
    } finally { setSending(false); }
  }

  function disconnectAll() {
    setConnections([]); setActiveConnectionId(""); setMessages([]); setLastUsage(null);
    setError(""); setNotice("Semua token koneksi telah dilepas dari memori halaman.");
  }

  const selectedProvider = providerChoice !== "auto" ? providerChoice : "";

  return (
    <section className="ai-product-workspace ai-gateway-v2">
      <div className="ai-gateway-layout">
        <aside className="ai-gateway-rail">
          <div className="ai-rail-heading"><span className="ai-eyebrow">KONEKSI</span><strong>Layanan tersambung</strong><p>Atur koneksi utama dan cadanganmu di sini.</p></div>
          <div className="ai-connection-list">
            {connections.length === 0 ? <div className="ai-connection-empty"><span>＋</span><strong>Belum ada koneksi</strong><small>Tambahkan token pertama untuk mulai.</small></div> : connections.map((item, index) => (
              <article className={`ai-connection-item ${activeConnection?.id === item.id ? "is-active" : ""}`} key={item.id}>
                <button type="button" className="ai-connection-select" onClick={() => setActiveConnectionId(item.id)}>
                  <span className="ai-connection-index">{String(index + 1).padStart(2, "0")}</span>
                  <span className="ai-connection-meta"><strong>{item.provider.name}</strong><small>{item.modelId || "Pilih model"}</small></span>
                  <span className="ai-connection-health" aria-label="Connected" />
                </button>
                <div className="ai-connection-actions">
                  <button type="button" onClick={() => moveConnection(item.id, -1)} disabled={index === 0} aria-label="Naikkan prioritas">↑</button>
                  <button type="button" onClick={() => moveConnection(item.id, 1)} disabled={index === connections.length - 1} aria-label="Turunkan prioritas">↓</button>
                  <button type="button" onClick={() => removeConnection(item.id)} aria-label="Hapus koneksi">×</button>
                </div>
              </article>
            ))}
          </div>
          <div className="ai-fallback-note"><span>↳</span><p><strong>Auto fallback aktif</strong>Jika provider kehabisan kuota, menolak token, atau mengalami gangguan, Neftis mencoba koneksi berikutnya.</p></div>
          {connections.length > 0 && <button type="button" className="ai-disconnect-all" onClick={disconnectAll}>Lepas semua koneksi</button>}
        </aside>

        <div className="ai-gateway-main">
          <div className="ai-gateway-heading">
            <div><span className="ai-eyebrow">NEFTIS AI</span><h2>Ruang AI</h2><p>Sambungkan API pilihanmu. Model yang tersedia akan muncul otomatis.</p></div>
            <div className="ai-gateway-count"><strong>{connections.length}<small>/ 8</small></strong><span>KONEKSI AKTIF</span></div>
          </div>

          <form className="ai-connect-form ai-add-connection" onSubmit={connect}>
            <div className="ai-form-title"><span>KONEKSI BARU</span><strong>Masukkan API key dan Base URL</strong></div>
<div className="ai-form-grid">
  <label className="ai-field ai-field-wide"><span>API KEY</span><input type="password" autoComplete="off" value={apiKey} onChange={(event) => { setApiKey(event.target.value); setError(""); setNeedsProvider(false); }} placeholder="Tempel API key di sini" /></label>
  <label className="ai-field ai-field-wide"><span>BASE URL</span><input type="url" value={baseUrl} onChange={(event) => setBaseUrl(event.target.value)} placeholder="https://api.example.com/v1" /><small>Masukkan alamat API dari penyedia token. Format OpenAI-compatible digunakan otomatis.</small></label>
  <button type="button" className="ai-advanced-toggle" aria-expanded={showAdvanced} onClick={() => setShowAdvanced((value) => !value)}>{showAdvanced ? "Sembunyikan pengaturan tambahan" : "Pengaturan tambahan"} <span>{showAdvanced ? "−" : "+"}</span></button>
  {showAdvanced && <>
    <label className="ai-field"><span>FORMAT API</span><select value={customProtocol} onChange={(event) => setCustomProtocol(event.target.value as "openai" | "anthropic" | "google")}><option value="openai">OpenAI-compatible (default)</option><option value="anthropic">Anthropic Messages</option><option value="google">Gemini generateContent</option></select></label>
    <label className="ai-field"><span>HEADER API KEY</span><select value={customAuthMode} onChange={(event) => setCustomAuthMode(event.target.value as "bearer" | "x-api-key" | "google-key" | "none")}><option value="bearer">Authorization: Bearer (default)</option><option value="x-api-key">x-api-key</option><option value="google-key">x-goog-api-key</option><option value="none">Tanpa header</option></select></label>
  </>}
</div>
            {error && <p className="ai-inline-error" role="alert">{error}</p>}
            {notice && <p className="ai-inline-notice" role="status">{notice}</p>}
            <div className="ai-connect-actions"><button className="ai-connect-button" type="submit" disabled={connecting || apiKey.trim().length < 8 || connections.length >= 8 || false}>{connecting ? "Menghubungkan…" : "Hubungkan API"} <span>↗</span></button><span>API key hanya disimpan sementara di tab ini.</span></div>
          </form>

          {activeConnection ? (
            <div className="ai-selected-provider">
              <div className="ai-selected-heading"><div><span className="ai-eyebrow">MODEL</span><h3>Pilih model</h3><p>Pilihan diambil dari daftar model API yang kamu sambungkan.</p></div><span className="ai-model-total">{connections.reduce((sum, item) => sum + item.models.length, 0)} MODEL DITEMUKAN</span></div>
              <div className="ai-provider-model-grid">
                {connections.map((item, index) => {
                  const selected = item.models.find((model) => model.id === item.modelId);
                  return <article className={`ai-provider-model-card ${activeConnection.id === item.id ? "is-selected" : ""}`} key={item.id}>
                    <div className="ai-provider-model-top"><span>PRIORITAS {String(index + 1).padStart(2, "0")}</span><strong>{item.provider.name}</strong></div>
                    <label className="ai-field"><span>MODEL</span><select value={item.modelId} onChange={(event) => updateConnection(item.id, { modelId: event.target.value, reasoning: "" })}>{item.models.map((model) => <option key={model.id} value={model.id}>{model.name}</option>)}</select></label>
                    {selected?.reasoningEfforts.length ? <label className="ai-field"><span>TINGKAT PENALARAN</span><select value={item.reasoning || selected.defaultReasoning || selected.reasoningEfforts[0]} onChange={(event) => updateConnection(item.id, { reasoning: event.target.value })}>{selected.reasoningEfforts.map((effort) => <option key={effort} value={effort}>{effort}</option>)}</select></label> : <p className="ai-reasoning-note">Tingkat penalaran mengikuti kemampuan model/provider.</p>}
                    <button type="button" className="ai-use-connection" onClick={() => setActiveConnectionId(item.id)}>{activeConnection.id === item.id ? "Koneksi aktif" : "Pilih koneksi"} <span>↗</span></button>
                  </article>;
                })}
              </div>
            </div>
          ) : <div className="ai-first-run"><span className="ai-first-run-icon">✳</span><div><strong>Mulai dengan satu token.</strong><p>Setelah koneksi pertama berhasil, kamu bisa menambahkan provider lain sebagai cadangan.</p></div></div>}

          <div className="ai-chat-panel ai-chat-panel-v2">
            <div className="ai-chat-heading"><div><span className="ai-eyebrow">CHAT</span><h3>Percakapan</h3></div><span>{activeConnection ? activeConnection.provider.name + " · " + activeConnection.modelId : "Belum terhubung"}</span></div>
            <div className="ai-chat-history" aria-live="polite">
              {messages.length === 0 ? <div className="ai-chat-empty"><div className="ai-empty-glyph">✳</div><strong>Mulai dari sebuah ide.</strong><p>Pesan akan dikirim melalui koneksi prioritas. Fallback berjalan otomatis bila diperlukan.</p></div> : messages.map((message, index) => <article className={message.role === "user" ? "ai-message user" : "ai-message assistant"} key={message.role + "-" + index}><span>{message.role === "user" ? "KAMU" : "NEFTIS AI"}</span><p>{message.content}</p></article>)}
              {sending && <div className="ai-message assistant"><span>NEFTIS AI</span><p className="ai-thinking">Mencari koneksi yang tersedia…</p></div>}
            </div>
            <form className="ai-chat-input" onSubmit={send}>
              <textarea value={draft} onChange={(event) => setDraft(event.target.value)} rows={2} placeholder={connections.length ? "Tulis pesan untuk AI…" : "Hubungkan provider terlebih dahulu…"} aria-label="Pesan untuk AI" disabled={!connections.length} />
              <button type="submit" disabled={sending || !draft.trim() || !connections.length} aria-label="Kirim pesan">↑</button>
            </form>
            {error && !connecting && <p className="ai-inline-error" role="alert">{error}</p>}
            {lastUsage && <div className="ai-usage-line">Token permintaan terakhir: {lastUsage.input.toLocaleString("id-ID")} masuk · {lastUsage.output.toLocaleString("id-ID")} keluar</div>}
          </div>
          <p className="ai-key-privacy ai-security-footnote">Keamanan: token hanya berada di memori tab dan dikirim ke server Neftis saat diperlukan. Base URL khusus wajib HTTPS publik; redirect dan alamat jaringan privat ditolak. Fallback bukan jaminan saldo/kuota akurat—provider tetap menjadi sumber status pemakaian.</p>
        </div>
      </div>
    </section>
  );
}
