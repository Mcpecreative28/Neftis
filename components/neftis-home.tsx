"use client";

import { useMemo, useState } from "react";

type PageKey = "home" | "ai" | "tools" | "community" | "learn" | "games" | "achievements" | "services";

const navPrimary: { id: PageKey; label: string; icon: string; isNew?: boolean }[] = [
  { id: "home", label: "Overview", icon: "◫" },
  { id: "ai", label: "Neftis AI", icon: "✳", isNew: true },
  { id: "tools", label: "Tools library", icon: "⌘" },
  { id: "community", label: "Community", icon: "◎" },
  { id: "learn", label: "Knowledge", icon: "▤" },
  { id: "games", label: "Arcade", icon: "◇" },
];
const navPersonal: { id: PageKey; label: string; icon: string }[] = [
  { id: "achievements", label: "Achievements", icon: "✧" },
  { id: "services", label: "Services", icon: "↗" },
];
const spaces = [
  { id: "ai" as const, no: "01", tag: "THINK", title: "Neftis AI", desc: "A focused space for questions, drafts, and ideas.", icon: "✳", tone: "feature-ai" },
  { id: "tools" as const, no: "02", tag: "MAKE", title: "Tools library", desc: "Small utilities for everyday digital work.", icon: "⌘", tone: "feature-tools" },
  { id: "community" as const, no: "03", tag: "SHARE", title: "Community", desc: "Exchange notes, questions, and discoveries.", icon: "◎", tone: "feature-community" },
  { id: "learn" as const, no: "04", tag: "GROW", title: "Knowledge room", desc: "Guides and references worth keeping.", icon: "▤", tone: "feature-learn" },
];
const pageTitles: Record<PageKey, string> = {
  home: "Overview", ai: "Neftis AI", tools: "Tools library", community: "Community",
  learn: "Knowledge room", games: "Arcade", achievements: "Achievements", services: "Services",
};

export default function NeftisHome() {
  const [page, setPage] = useState<PageKey>("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [language, setLanguage] = useState<"ID" | "EN">("ID");
  const [message, setMessage] = useState("");
  const [sentMessages, setSentMessages] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState("All tools");
  const [toast, setToast] = useState("");

  const searchable = useMemo(() => [...navPrimary, ...navPersonal].filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase())), [query]);

  function navigate(next: PageKey) {
    setPage(next);
    setMenuOpen(false);
    setSearchOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function notify(text: string) {
    setToast(text);
    window.setTimeout(() => setToast(""), 2200);
  }
  function sendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!message.trim()) return;
    setSentMessages((current) => [...current, message.trim()]);
    setMessage("");
    notify("Pesan disimpan di sesi pratinjau.");
  }

  return (
    <div className={`app-shell ${theme === "light" ? "light-theme" : ""}`}>
      <aside className={`sidebar ${menuOpen ? "open" : ""}`}>
        <a className="brand" href="#home" onClick={(e) => { e.preventDefault(); navigate("home"); }} aria-label="Neftis home">
          <span className="brand-mark">N<span>/</span></span>
          <span className="brand-name">neftis<span>.</span><small>DIGITAL COMMONS</small></span>
        </a>
        <div className="workspace-label">WORKSPACE <span>PUBLIC</span></div>
        <nav className="primary-nav" aria-label="Main navigation">
          {navPrimary.map((item) => <button key={item.id} className={`nav-link ${page === item.id ? "active" : ""}`} onClick={() => navigate(item.id)}>
            <span className="nav-icon">{item.icon}</span><span>{item.label}</span>{item.isNew && <b className="nav-new">NEW</b>}
          </button>)}
        </nav>
        <div className="sidebar-divider" />
        <div className="workspace-label">YOUR SPACE</div>
        <nav className="primary-nav" aria-label="Personal navigation">
          {navPersonal.map((item) => <button key={item.id} className={`nav-link ${page === item.id ? "active" : ""}`} onClick={() => navigate(item.id)}><span className="nav-icon">{item.icon}</span><span>{item.label}</span></button>)}
        </nav>
        <div className="sidebar-bottom">
          <div className="status-card"><span className="status-dot" /><div><strong>Open for everyone</strong><small>A shared digital space</small></div></div>
          <button className="profile-button" onClick={() => notify("Autentikasi akan tersedia pada tahap berikutnya.")}><span className="avatar">G</span><span><strong>Guest session</strong><small>Preview mode</small></span><span className="more">···</span></button>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button className="icon-button mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Open navigation">☰</button>
          <div className="breadcrumbs"><span>NEFTIS</span><i>/</i><strong>{pageTitles[page]}</strong></div>
          <div className="topbar-actions">
            <button className="search-trigger" onClick={() => setSearchOpen(true)}><span>⌕</span><span>Search anything</span><kbd>⌘ K</kbd></button>
            <button className="icon-button" onClick={() => setLanguage(language === "ID" ? "EN" : "ID")} aria-label="Switch language">{language}</button>
            <button className="icon-button" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label="Toggle theme">◐</button>
            <button className="sign-in-button" onClick={() => notify("Login akan diaktifkan setelah modul autentikasi selesai.")}>Sign in</button>
          </div>
        </header>

        <div className="content-wrap">
          {page === "home" && <>
            <section className="page-view active">
              <div className="hero-grid">
                <div className="hero-copy">
                  <div className="eyebrow"><span className="eyebrow-line" /><span>A PUBLIC DIGITAL SPACE</span><span className="eyebrow-index">NEF—001</span></div>
                  <h1>Make room<br />for <em>what&apos;s next.</em></h1>
                  <p>A shared place to explore useful tools, think with AI, exchange ideas, and learn something new.</p>
                  <div className="hero-actions"><button className="button button-primary" onClick={() => navigate("ai")}>Open Neftis AI <span>↗</span></button><button className="button button-quiet" onClick={() => navigate("tools")}>Explore tools <span>→</span></button></div>
                  <div className="hero-footnote"><span className="pulse-dot" /> OPEN ACCESS · BUILT FOR SHARING</div>
                </div>
                <div className="hero-art" aria-label="Abstract orbital graphic">
                  <div className="art-topline"><span>FIG. 01 / DIGITAL ECOSYSTEM</span><span>∞</span></div>
                  <div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="orbit orbit-three" />
                  <div className="orbit-core">N<i /></div>
                  <span className="orbit-label label-a">IDEAS / 01</span><span className="orbit-label label-b">TOOLS / 02</span><span className="orbit-label label-c">PEOPLE / 03</span>
                  <div className="art-coordinates">NEFTIS<br />DIGITAL / 001</div>
                  <div className="art-bottomline"><span>CONNECTED BY CURIOSITY</span><span>NEF—01</span></div>
                </div>
              </div>
              <div className="section-heading"><div><span className="section-kicker">THE COMMONS</span><h2>A place to begin</h2></div><span className="section-count">01 / 04</span></div>
              <div className="feature-grid">{spaces.map((space) => <button key={space.id} className={`feature-card ${space.tone}`} onClick={() => navigate(space.id)}><div className="card-meta"><span>{space.no} — {space.tag}</span><span>{space.icon}</span></div><div className="feature-symbol">{space.icon}</div><h3>{space.title}</h3><p>{space.desc}</p><span className="card-arrow">↗</span></button>)}</div>
              <div className="lower-grid">
                <section className="panel activity-panel"><div className="panel-heading"><div><span className="section-kicker">YOUR ACTIVITY</span><h3>Recent activity</h3></div><button className="text-link" onClick={() => navigate("achievements")}>View all ↗</button></div><div className="activity-list"><div className="empty-state"><span>◌</span><p>Your activity will appear here as you explore.</p></div></div></section>
                <section className="panel signal-panel"><div className="panel-heading"><div><span className="section-kicker">COMMUNITY SIGNAL</span><h3>From the community</h3></div><button className="text-link" onClick={() => navigate("community")}>Visit ↗</button></div><div className="signal-post"><span className="signal-tag">DISCUSSION / 001</span><h4>What small tool saves you the most time?</h4><p>A thread for sharing the little utilities that make a difference.</p><div className="signal-foot"><span>COMMUNITY BOARD</span><span>↗</span></div></div></section>
              </div>
              <footer className="page-footer"><span>© NEFTIS / DIGITAL COMMONS</span><span>OPEN BY DESIGN · MADE TO EXPLORE</span></footer>
            </section>
          </>}

          {page === "ai" && <section className="page-view active"><div className="page-intro"><div><span className="section-kicker">01 / INTELLIGENCE</span><h1>Neftis <em>AI</em></h1><p>A calm workspace for thinking, exploring, and making progress.</p></div><div className="intro-side-label">CONVERSATION SPACE<br />GEMINI PROVIDER / PLANNED</div></div><div className="chat-layout"><aside className="chat-history panel"><div className="history-head"><strong>History</strong><button className="small-plus" onClick={() => setSentMessages([])}>+</button></div><div className="history-item selected">◌ <span>Preview conversation</span></div><div className="history-note">Chat history will be stored after account setup.</div></aside><div className="chat-main panel"><div className="chat-toolbar"><div><span className="online-indicator" /><strong>Neftis Assistant</strong><small>Preview mode</small></div><button className="text-button" onClick={() => setSentMessages([])}>Clear</button></div><div className="chat-messages"><div className="assistant-welcome"><div className="assistant-orb">✳</div><span className="section-kicker">NEFTIS / ASSISTANT</span><h2>What are we<br /><em>working on?</em></h2><p>Ask a question, explore an idea, or start with one of these prompts.</p><div className="prompt-chips">{["Organize a project", "Explain a topic", "Find a useful tool"].map((prompt) => <button key={prompt} onClick={() => setMessage(prompt)}>{prompt} ↗</button>)}</div></div>{sentMessages.map((text, index) => <div className="activity-row" key={`${text}-${index}`}>↗ {text}<small>LOCAL PREVIEW</small></div>)}</div><form className="chat-composer" onSubmit={sendMessage}><textarea rows={2} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Ask anything..." /><div className="composer-bottom"><span>Preview mode · AI endpoint not connected yet</span><button className="send-button" type="submit">↑</button></div></form></div><aside className="chat-context panel"><span className="section-kicker">SESSION CONTEXT</span><h3>Conversation setup</h3><label>Response style</label><select defaultValue="balanced"><option value="balanced">Balanced</option><option>Concise</option><option>Detailed</option><option>Creative</option></select><label>Response language</label><select defaultValue="id"><option value="id">Bahasa Indonesia</option><option value="en">English</option></select><p className="context-footnote">AI settings will be configurable in your workspace.</p></aside></div></section>}

          {page === "tools" && <section className="page-view active"><PageIntro number="02" title={<>Tools <em>library</em></>} desc="Practical utilities, collected in one place." side={<>UTILITY INDEX<br />002—NEF</>} /><div className="filter-row"><div className="filter-tabs">{["All tools", "Text", "Developer", "Utility"].map((filter) => <button key={filter} className={`filter-tab ${activeFilter === filter ? "active" : ""}`} onClick={() => setActiveFilter(filter)}>{filter}</button>)}</div><span className="result-count">{activeFilter === "All tools" ? "06" : "02"} TOOLS</span></div><div className="tools-grid">{[{name:"Text formatter",cat:"Text",desc:"Clean and format text for everyday use."},{name:"Base64 converter",cat:"Developer",desc:"Encode and decode Base64 strings."},{name:"JSON inspector",cat:"Developer",desc:"Explore and validate structured JSON."},{name:"Word counter",cat:"Text",desc:"Count words, characters, and lines."},{name:"Unit converter",cat:"Utility",desc:"Convert common units in one place."},{name:"Color reference",cat:"Utility",desc:"Inspect HEX, RGB, and HSL values."}].filter((tool) => activeFilter === "All tools" || tool.cat === activeFilter).map((tool) => <article className="tool-card" key={tool.name}><span className="tool-category">{tool.cat.toUpperCase()}</span><h3>{tool.name}</h3><p>{tool.desc}</p><button className="text-link" onClick={() => notify(`${tool.name} akan dibangun pada tahap Tools.`)}>Open tool ↗</button></article>)}</div></section>}

          {page === "community" && <section className="page-view active"><PageIntro number="03" title={<>The <em>commons</em></>} desc="A public board for questions, experiments, and shared discoveries." side={<>COMMUNITY BOARD<br />OPEN ACCESS</>} /><div className="community-compose panel"><div className="compose-mark">＋</div><div className="compose-body"><strong>Start a discussion</strong><p>Share a question or something useful you found.</p></div><button className="button button-outline" onClick={() => notify("Posting akan tersedia setelah autentikasi aktif.")}>Write a post</button></div><article className="community-post"><div className="post-meta"><span>COMMUNITY / INTRODUCTION</span><strong>OPEN DISCUSSION</strong></div><h3>Welcome to Neftis</h3><p>This is a preview of the community space. Sign-in and posting features will be connected in a later phase.</p></article></section>}

          {page === "learn" && <section className="page-view active"><PageIntro number="04" title={<>Knowledge <em>room</em></>} desc="Notes and guides for curious minds." side={<>FIELD NOTES<br />LEARN / SHARE</>} /><div className="learn-grid"><article className="learn-card learn-featured"><div className="learn-art"><span>FIELD NOTE / 001</span><div className="learn-art-shape">⌘</div><small>TOOLS · WORKFLOW</small></div><div className="learn-card-body"><span className="section-kicker">PRACTICAL GUIDE · 5 MIN</span><h3>Build a better digital workflow</h3><p>A simple framework for choosing tools, reducing friction, and keeping your work organized.</p><button className="text-link" onClick={() => notify("Artikel akan tersedia pada modul Knowledge.")}>Read field note ↗</button></div></article><article className="learn-card"><div className="learn-card-body"><span className="section-kicker">AI LITERACY · 4 MIN</span><h3>How to write a useful AI prompt</h3><p>Give an AI system the context it needs without overcomplicating the request.</p><button className="text-link" onClick={() => notify("Artikel akan tersedia pada modul Knowledge.")}>Read field note ↗</button></div><div className="learn-number">02</div></article><article className="learn-card"><div className="learn-card-body"><span className="section-kicker">WEB BASICS · 6 MIN</span><h3>What happens when a website loads?</h3><p>A plain-language tour of browsers, servers, assets, and the request cycle.</p><button className="text-link" onClick={() => notify("Artikel akan tersedia pada modul Knowledge.")}>Read field note ↗</button></div><div className="learn-number">03</div></article></div></section>}

          {page === "games" && <section className="page-view active"><PageIntro number="05" title={<>The <em>arcade</em></>} desc="Small experiments for a short mental reset." side={<>PLAY MODE<br />NO SCORE PRESSURE</>} /><div className="game-panel panel"><div className="game-heading"><div><span className="section-kicker">GAME 001 / COMING SOON</span><h2>Signal Sequence</h2><p>A small collection of playful experiments is taking shape.</p></div><div className="game-score"><small>STATUS</small><strong>01</strong></div></div><div className="game-status">The arcade is being prepared.</div><div className="signal-grid"><button aria-label="Signal 1" /><button aria-label="Signal 2" /><button aria-label="Signal 3" /><button aria-label="Signal 4" /></div><div className="game-actions"><button className="button button-primary" onClick={() => notify("Game akan diaktifkan pada tahap Arcade.")}>Explore soon ↗</button></div></div></section>}

          {page === "achievements" && <section className="page-view active"><PageIntro number="06" title={<>Small <em>milestones</em></>} desc="Discoveries and contributions, collected as you explore." side={<>PERSONAL PROGRESS<br />PROFILE / PLANNED</>} /><div className="achievement-summary panel"><div><span className="section-kicker">COLLECTED</span><strong>0 / 6</strong></div><div className="achievement-progress"><div /></div><span className="achievement-percent">0%</span></div><div className="achievement-grid">{["First visit", "Curious mind", "Tool explorer", "Conversation starter", "Knowledge seeker", "Community member"].map((name, index) => <article className="achievement-card" key={name}><span className="achievement-icon">{["✧","✳","⌘","◎","▤","◇"][index]}</span><h3>{name}</h3><p>Keep exploring Neftis to unlock this milestone.</p><span className="achievement-state">NOT UNLOCKED</span></article>)}</div></section>}

          {page === "services" && <section className="page-view active"><PageIntro number="07" title={<>Digital <em>services</em></>} desc="Useful support for ideas that need to move forward." side={<>SERVICE DIRECTORY<br />BY REQUEST</>} /><div className="service-grid">{[{no:"01 / WEB",name:"Web development",desc:"Responsive websites, landing pages, and small digital products."},{no:"02 / DIGITAL",name:"Digital utilities",desc:"Focused tools and workflow improvements for everyday tasks."},{no:"03 / KNOWLEDGE",name:"Learning resources",desc:"Clear technical explanations and practical learning material."}].map((item) => <article className="service-card" key={item.no}><span>{item.no}</span><h3>{item.name}</h3><p>{item.desc}</p><button className="text-link" onClick={() => notify("Detail layanan akan segera tersedia.")}>Explore service ↗</button></article>)}</div></section>}
        </div>
      </main>

      {searchOpen && <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setSearchOpen(false); }}><section className="modal panel" role="dialog" aria-modal="true" aria-label="Search Neftis"><div className="modal-head"><span className="section-kicker">NEFTIS / SEARCH</span><button className="icon-button" onClick={() => setSearchOpen(false)}>×</button></div><input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search spaces..." />{searchable.map((item) => <button className="search-result" key={item.id} onClick={() => navigate(item.id)}>{item.label}<span>OPEN ↗</span></button>)}</section></div>}
      {toast && <div className="toast show" role="status">{toast}</div>}
    </div>
  );
}

function PageIntro({ number, title, desc, side }: { number: string; title: React.ReactNode; desc: string; side: React.ReactNode }) {
  return <div className="page-intro"><div><span className="section-kicker">{number} / NEFTIS SPACE</span><h1>{title}</h1><p>{desc}</p></div><div className="intro-side-label">{side}</div></div>;
}
