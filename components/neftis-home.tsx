"use client";

import { useState } from "react";

const spaces = [
  {
    number: "01",
    title: "Neftis AI",
    description: "Think further. Create without friction.",
    tag: "INTELLIGENCE",
    symbol: "✳",
    tone: "violet",
    href: "/ai",
  },
  {
    number: "02",
    title: "Tools",
    description: "Small utilities. Surprisingly big possibilities.",
    tag: "WORKSPACE",
    symbol: "⌘",
    tone: "mint",
    href: "/tools",
  },
  {
    number: "03",
    title: "Community",
    description: "Find people building things that matter.",
    tag: "CONNECTION",
    symbol: "◎",
    tone: "coral",
    href: "/community",
  },
  {
    number: "04",
    title: "Knowledge",
    description: "Explore ideas, guides, and new perspectives.",
    tag: "DISCOVERY",
    symbol: "↗",
    tone: "blue",
    href: "/learn",
  },
];

const navItems = [
  ["Explore", "#explore"],
  ["About", "#about"],
  ["Updates", "#updates"],
] as const;

export default function NeftisHome() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [activeSpace, setActiveSpace] = useState("01");

  return (
    <main className={`neftis ${theme}`} data-theme={theme}>
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />
      <div className="ambient ambient-three" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />

      <header className="topbar">
        <a className="brand" href="/" aria-label="Neftis home">
          <span className="brand-mark"><i /><i /><i /></span>
          <span>neftis<span className="brand-period">.</span></span>
        </a>

        <nav className={`nav-links ${menuOpen ? "is-open" : ""}`} aria-label="Main navigation">
          {navItems.map(([label, href]) => (
            <a key={label} href={href} onClick={() => setMenuOpen(false)}>{label}</a>
          ))}
          <a className="nav-mobile-cta" href="/login">Get started <span>↗</span></a>
        </nav>

        <div className="top-actions">
          <button
            className="theme-toggle"
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            title="Switch theme"
          >
            {theme === "dark" ? "☼" : "☾"}
          </button>
          <a className="top-cta" href="/login">Enter Neftis <span>↗</span></a>
          <button
            className={`menu-toggle ${menuOpen ? "active" : ""}`}
            type="button"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span /><span />
          </button>
        </div>
      </header>

      <section className="hero" id="about">
        <div className="hero-copy">
          <div className="eyebrow"><span className="status-dot" /> AN OPEN DIGITAL ECOSYSTEM <span className="eyebrow-line" /></div>
          <h1>Make room<br />for <span className="word-shift">what&apos;s next<span className="asterisk">✳</span></span></h1>
          <p className="hero-description">
            A connected space for intelligence, creativity, useful tools, and
            people. Explore what you need. Discover what you didn&apos;t know you needed.
          </p>
          <div className="hero-actions">
            <a className="button-primary" href="#explore">Explore the ecosystem <span>↗</span></a>
            <a className="button-quiet" href="#about-more">What is Neftis? <span>↓</span></a>
          </div>
          <div className="hero-footnote"><span className="footnote-rule" /> BUILT FOR THE CURIOUS <span>—</span> OPEN TO EVERYONE</div>
        </div>

        <div className="orbit-stage" aria-label="Abstract illustration of the Neftis digital ecosystem">
          <div className="orbit orbit-outer"><span className="orbit-label orbit-label-top">IDEAS IN MOTION</span></div>
          <div className="orbit orbit-middle" />
          <div className="orbit orbit-inner" />
          <div className="orbit-core">
            <div className="core-glow" />
            <div className="core-symbol">n<span>.</span></div>
          </div>
          <div className="orbit-node node-one"><span>✳</span></div>
          <div className="orbit-node node-two"><span>⌘</span></div>
          <div className="orbit-node node-three"><span>◎</span></div>
          <div className="orbit-node node-four"><span>↗</span></div>
          <div className="orbit-caption"><span className="caption-pulse" /> FOUR SPACES. ONE ECOSYSTEM.</div>
          <div className="orbit-coordinate">06° 12′ N<br />NEFTIS / 001</div>
        </div>
        <div className="hero-index"><span>01</span><span className="index-line" /><span>04</span></div>
      </section>

      <section className="ticker" aria-label="Neftis principles">
        <div className="ticker-track">
          {Array.from({ length: 2 }).map((_, index) => (
            <div className="ticker-group" key={index}>
              <span>THINK</span><b>✳</b><span>MAKE</span><b>✳</b><span>EXPLORE</span><b>✳</b><span>CONNECT</span><b>✳</b><span>REPEAT</span><b>✳</b>
            </div>
          ))}
        </div>
      </section>

      <section className="explore-section section-wrap" id="explore">
        <div className="section-heading">
          <div>
            <div className="eyebrow"><span className="section-number">01 /</span> FIND YOUR SPACE</div>
            <h2>One place.<br /><span>Many directions.</span></h2>
          </div>
          <p className="section-aside">Move between focused spaces, each designed around a different way to think, work, and connect.</p>
        </div>

        <div className="space-grid">
          {spaces.map((space) => (
            <a
              className={`space-card ${space.tone} ${activeSpace === space.number ? "selected" : ""}`}
              href={space.href}
              key={space.number}
              onMouseEnter={() => setActiveSpace(space.number)}
              onFocus={() => setActiveSpace(space.number)}
            >
              <div className="card-topline"><span>{space.number} — {space.tag}</span><span className="card-arrow">↗</span></div>
              <div className="card-art" aria-hidden="true">
                <div className="art-ring ring-a" /><div className="art-ring ring-b" />
                <div className="art-orb">{space.symbol}</div>
                <div className="art-cross">+</div>
              </div>
              <div className="card-copy">
                <h3>{space.title}</h3>
                <p>{space.description}</p>
              </div>
              <div className="card-bottom"><span>EXPLORE SPACE</span><span>↗</span></div>
            </a>
          ))}
        </div>
      </section>

      <section className="manifesto section-wrap" id="about-more">
        <div className="manifesto-index">02 / THE IDEA</div>
        <div className="manifesto-content">
          <p className="manifesto-kicker">THE INTERNET IS A BIG PLACE.</p>
          <h2>It should feel<br />like <span>possibility,</span><br />not noise.</h2>
          <div className="manifesto-bottom">
            <p>Neftis brings useful digital experiences into one evolving environment. Less jumping between disconnected services. More room to follow your curiosity.</p>
            <div className="manifesto-stamp"><span>N</span><small>EST. FOR<br />WHAT&apos;S NEXT</small></div>
          </div>
        </div>
      </section>

      <section className="updates-section section-wrap" id="updates">
        <div className="updates-card">
          <div className="updates-orbit" aria-hidden="true"><span>✳</span></div>
          <div className="updates-copy">
            <div className="eyebrow"><span className="status-dot" /> THE NEXT CHAPTER</div>
            <h2>Something good<br />is taking shape.</h2>
            <p>Neftis is an evolving ecosystem. New spaces and experiences will find their way here.</p>
          </div>
          <a href="/community" className="updates-link">Stay curious <span>↗</span></a>
        </div>
      </section>

      <footer className="footer section-wrap">
        <a className="brand footer-brand" href="/"><span className="brand-mark"><i /><i /><i /></span><span>neftis<span className="brand-period">.</span></span></a>
        <span className="footer-note">A WORLD OF DIGITAL POSSIBILITIES.</span>
        <span className="footer-copy">© {new Date().getFullYear()} NEFTIS</span>
      </footer>
    </main>
  );
    }
      
