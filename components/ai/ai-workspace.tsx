"use client";

import { FormEvent, useMemo, useState } from "react";

type Provider = { id: string; name: string };
type Model = { id: string; name: string; reasoningEfforts: string[]; defaultReasoning: string | null };
type Message = { role: "user" | "assistant"; content: string };
type Connection = {
  id: string; provider: Provider; apiKey: string; baseUrl: string; models: Model[];
  modelId: string; reasoning: string; healthy: boolean;
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
  { id: "custom-openai", name: "Custom OpenAI-compatible" },
];

export default function AIWorkspace() {
  const [apiKey, setApiKey] = useState("");
  const [providerChoice, setProviderChoice] = useState("auto");
  const [baseUrl, setBaseUrl] = useState("");
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
          ...(providerChoice !== "auto" ? { provider: providerChoice } : {}),
          ...(providerChoice === "custom-openai" ? { baseUrl: baseUrl.trim() } : {}),
        }),
      });
      const result = await response.json();
      if (result.needsProvider) {
        setProviderChoices(result.providers ?? providerNames);
        setNeedsProvider(true);
        setError("Format token belum dikenali otomatis. Pilih provider yang menerbitkan token ini.");
        return;
      }
      if (!response.ok) throw new Error(result.error ?? "Provider tidak dapat dihubungkan.");
      const entry: Connection = {
        id: crypto.randomUUID(), provider: result.provider, apiKey: apiKey.trim(),
        baseUrl: result.provider.baseUrl ?? "", models: result.models ?? [],
        modelId: result.models?.[0]?.id ?? "", reasoning: "", healthy: true,
      };
      setConnections((items) => [...items, entry]);
      setActiveConnectionId(entry.id);
      setApiKey(""); setBaseUrl(""); setProviderChoice("auto"); setNeedsProvider(false);
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
      model: item.modelId, ...(item.reasoning ? { reasoning: item.reasoning } : {}),
    }));
    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connections: ordered, messages: nextMessages }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Semua koneksi AI gagal.");
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
          <div className="ai-rail-heading"><span className="ai-eyebrow">GATEWAY / CONNECTIONS</span><strong>Rute AI kamu</strong><p>Tambahkan beberapa akun atau layanan. Urutan menentukan prioritas fallback.</p></div>
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
            <div><span className="ai-eyebrow">NEFTIS AI / MULTI-PROVIDER</span><h2>AI, <em>tanpa satu titik gagal.</em></h2><p>Hubungkan layanan favoritmu, pilih model, lalu biarkan Neftis mengatur urutan cadangan.</p></div>
            <div className="ai-gateway-count"><strong>{connections.length}<small>/ 8</small></strong><span>KONEKSI AKTIF</span></div>
          </div>

          <form className="ai-connect-form ai-add-connection" onSubmit={connect}>
            <div className="ai-form-title"><span>01 / ADD CONNECTION</span><strong>Tambahkan provider</strong></div>
            <div className="ai-form-grid">
              <label className="ai-field ai-field-wide"><span>API TOKEN</span><input type="password" autoComplete="off" value={apiKey} onChange={(event) => { setApiKey(event.target.value); setError(""); setNeedsProvider(false); }} placeholder="Tempel token API di sini" /></label>
              <label className="ai-field"><span>DETEKSI PROVIDER</span><select value={providerChoice} onChange={(event) => { setProviderChoice(event.target.value); setNeedsProvider(false); setError(""); }}><option value="auto">Deteksi otomatis</option>{providerChoices.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
              {selectedProvider === "custom-openai" && <label className="ai-field ai-field-wide"><span>BASE URL (HTTPS)</span><input type="url" value={baseUrl} onChange={(event) => setBaseUrl(event.target.value)} placeholder="https://api.example.com/v1" required /><small>Untuk endpoint OpenAI-compatible yang menyediakan /models dan /chat/completions.</small></label>}
            </div>
            {error && <p className="ai-inline-error" role="alert">{error}</p>}
            {notice && <p className="ai-inline-notice" role="status">{notice}</p>}
            <div className="ai-connect-actions"><button className="ai-connect-button" type="submit" disabled={connecting || apiKey.trim().length < 8 || connections.length >= 8 || (selectedProvider === "custom-openai" && !baseUrl.trim())}>{connecting ? "Memeriksa endpoint…" : "Validasi token & ambil model"} <span>↗</span></button><span>Token tidak disimpan permanen. Maksimal 8 koneksi per sesi.</span></div>
          </form>

          {activeConnection ? (
            <div className="ai-selected-provider">
              <div className="ai-selected-heading"><div><span className="ai-eyebrow">02 / MODEL ROUTING</span><h3>Konfigurasi model</h3><p>Setiap koneksi menyimpan pilihan model dan menjadi kandidat fallback.</p></div><span className="ai-model-total">{connections.reduce((sum, item) => sum + item.models.length, 0)} MODEL DITEMUKAN</span></div>
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
            <div className="ai-chat-heading"><div><span className="ai-eyebrow">03 / CHAT WORKSPACE</span><h3>Ruang percakapan</h3></div><span>{activeConnection ? activeConnection.provider.name + " · " + activeConnection.modelId : "Belum terhubung"}</span></div>
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
