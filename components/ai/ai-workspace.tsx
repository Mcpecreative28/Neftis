"use client";

import { FormEvent, useMemo, useState } from "react";

type Provider = { id: string; name: string };
type Model = { id: string; name: string; reasoningEfforts: string[]; defaultReasoning: string | null };
type Message = { role: "user" | "assistant"; content: string };

const providerNames: Provider[] = [
  { id: "tokenharbor", name: "Token Harbor" }, { id: "9router", name: "9Router" },
  { id: "openrouter", name: "OpenRouter" }, { id: "mecutinai", name: "MecutinAI" },
  { id: "anthropic", name: "Anthropic / Claude" }, { id: "openai", name: "OpenAI" },
  { id: "google", name: "Google AI Studio" },
];

export default function AIWorkspace() {
  const [apiKey, setApiKey] = useState("");
  const [provider, setProvider] = useState<Provider | null>(null);
  const [manualProvider, setManualProvider] = useState("");
  const [providerChoices, setProviderChoices] = useState<Provider[]>(providerNames);
  const [models, setModels] = useState<Model[]>([]);
  const [modelId, setModelId] = useState("");
  const [reasoning, setReasoning] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [lastUsage, setLastUsage] = useState<{input:number;output:number}|null>(null);
  const selectedModel = useMemo(() => models.find((model) => model.id === modelId) ?? null, [models, modelId]);

  async function connect(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!apiKey.trim()) return;
    setConnecting(true); setError("");
    try {
      const response = await fetch("/api/ai/connect", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ apiKey: apiKey.trim(), ...(manualProvider ? { provider: manualProvider } : {}) }) });
      const result = await response.json();
      if (result.needsProvider) {
        setProviderChoices(result.providers ?? providerNames);
        setError("Jenis token belum bisa dikenali dari formatnya. Pilih gateway yang menerbitkan token ini.");
        return;
      }
      if (!response.ok) throw new Error(result.error ?? "Provider tidak dapat dihubungkan.");
      setProvider(result.provider); setModels(result.models ?? []); setModelId(result.models?.[0]?.id ?? "");
      setReasoning(""); setManualProvider(""); setMessages([]); setLastUsage(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Koneksi provider gagal.");
    } finally { setConnecting(false); }
  }

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!provider || !modelId || !draft.trim() || sending) return;
    const nextMessages = [...messages, { role: "user" as const, content: draft.trim() }];
    setMessages(nextMessages); setDraft(""); setSending(true); setError("");
    try {
      const response = await fetch("/api/ai/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ provider: provider.id, apiKey, model: modelId, messages: nextMessages, ...(reasoning ? { reasoning } : {}) }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Permintaan AI gagal.");
      setMessages([...nextMessages, { role: "assistant", content: result.content }]);
      setLastUsage(result.usage ?? null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Permintaan AI gagal.");
    } finally { setSending(false); }
  }

  function disconnect() {
    setApiKey(""); setProvider(null); setModels([]); setModelId(""); setReasoning("");
    setMessages([]); setLastUsage(null); setError("");
  }

  return (
    <section className="ai-product-workspace">
      {!provider ? (
        <div className="ai-connect-card">
          <div className="ai-connect-intro">
            <span className="ai-eyebrow">NEFTIS AI / PROVIDER SETUP</span>
            <div className="ai-connect-symbol" aria-hidden="true"><svg viewBox="0 0 48 48"><path d="M8 24h32M24 8v32M13 13l22 22M35 13 13 35" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><circle cx="24" cy="24" r="7" fill="none" stroke="currentColor" strokeWidth="1.6"/></svg></div>
            <h2>Hubungkan <em>AI pilihanmu.</em></h2>
            <p>Masukkan API token. Neftis akan memeriksa gateway dan mengambil model yang tersedia sebelum menampilkan pengaturan.</p>
            <div className="ai-provider-list"><span>Token Harbor</span><span>9Router</span><span>OpenRouter</span><span>MecutinAI</span><span>Claude</span><span>Gemini</span></div>
          </div>
          <form className="ai-connect-form" onSubmit={connect}>
            <label htmlFor="ai-api-key">API token</label>
            <input id="ai-api-key" type="password" autoComplete="off" value={apiKey} onChange={(event) => {setApiKey(event.target.value);setManualProvider("");setError("");}} placeholder="Paste API token di sini" />
            {manualProvider && <label htmlFor="ai-provider-select">Pilih gateway</label>}
            {manualProvider !== "" && <select id="ai-provider-select" value={manualProvider} onChange={(event) => setManualProvider(event.target.value)}>{providerChoices.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>}
            {error && <p className="ai-inline-error" role="alert">{error}</p>}
            <button className="ai-connect-button" type="submit" disabled={connecting || apiKey.trim().length < 8}>{connecting ? "Memeriksa token…" : "Periksa token dan lanjutkan"} <span>↗</span></button>
            {error.includes("belum bisa dikenali") && <button className="ai-manual-provider" type="button" onClick={() => setManualProvider(providerChoices[0]?.id ?? "tokenharbor")}>Pilih provider secara manual</button>}
            <p className="ai-key-privacy">Token hanya disimpan di memori halaman ini dan tidak dimasukkan ke penyimpanan akun. Putuskan koneksi untuk menghapusnya dari sesi.</p>
          </form>
        </div>
      ) : (
        <>
          <div className="ai-connected-bar">
            <div className="ai-connected-state"><span className="ai-connected-dot" /><div><span className="ai-eyebrow">PROVIDER CONNECTED</span><strong>{provider.name}</strong></div></div>
            <button type="button" onClick={disconnect}>Putuskan koneksi</button>
          </div>
          <div className="ai-model-settings">
            <label><span>MODEL</span><select value={modelId} onChange={(event) => {setModelId(event.target.value);setReasoning("");}}>{models.map((model) => <option key={model.id} value={model.id}>{model.name}</option>)}</select></label>
            {selectedModel?.reasoningEfforts?.length ? <label><span>TINGKAT PENALARAN</span><select value={reasoning || selectedModel.defaultReasoning || selectedModel.reasoningEfforts[0]} onChange={(event) => setReasoning(event.target.value)}>{selectedModel.reasoningEfforts.map((effort) => <option key={effort} value={effort}>{effort.charAt(0).toUpperCase() + effort.slice(1)}</option>)}</select></label> : <div className="ai-reasoning-note"><span>TINGKAT PENALARAN</span><strong>Diatur oleh model</strong></div>}
            <div className="ai-model-count">{models.length} model tersedia</div>
          </div>
          <div className="ai-chat-panel">
            <div className="ai-chat-heading"><div><span className="ai-eyebrow">PRIVATE SESSION</span><h3>Ruang percakapan</h3></div><span>{selectedModel?.name ?? modelId}</span></div>
            <div className="ai-chat-history" aria-live="polite">
              {messages.length === 0 ? <div className="ai-chat-empty"><div className="ai-empty-glyph">✳</div><strong>Mulai dari sebuah ide.</strong><p>Model yang kamu pilih sudah siap menerima pesan.</p></div> : messages.map((message, index) => <article className={message.role === "user" ? "ai-message user" : "ai-message assistant"} key={message.role + "-" + index}><span>{message.role === "user" ? "KAMU" : provider.name.toUpperCase()}</span><p>{message.content}</p></article>)}
              {sending && <div className="ai-message assistant"><span>NEFTIS AI</span><p className="ai-thinking">Sedang berpikir…</p></div>}
            </div>
            <form className="ai-chat-input" onSubmit={send}>
              <textarea value={draft} onChange={(event) => setDraft(event.target.value)} rows={2} placeholder="Tulis pesan untuk AI…" aria-label="Pesan untuk AI" />
              <button type="submit" disabled={sending || !draft.trim()} aria-label="Kirim pesan">↑</button>
            </form>
            {error && <p className="ai-inline-error" role="alert">{error}</p>}
            {lastUsage && <div className="ai-usage-line">Token permintaan terakhir: {lastUsage.input.toLocaleString("id-ID")} masuk · {lastUsage.output.toLocaleString("id-ID")} keluar</div>}
          </div>
        </>
      )}
    </section>
  );
}
