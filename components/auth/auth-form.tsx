"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";

type AuthFormProps = {
  mode: "login" | "register";
};

type SocialProvider = "google" | "github";

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M21.35 12.23c0-.72-.06-1.42-.18-2.1H12v3.98h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.7 2.91-4.2 2.91-7.27Z" />
      <path fill="#34A853" d="M12 21.6c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.93-3.31.93-2.55 0-4.72-1.72-5.5-4.04H3.25v2.53A9.74 9.74 0 0 0 12 21.6Z" />
      <path fill="#FBBC05" d="M6.5 13.68a5.86 5.86 0 0 1 0-3.73V7.42H3.25a9.72 9.72 0 0 0 0 8.79l3.25-2.53Z" />
      <path fill="#EA4335" d="M12 5.9c1.43 0 2.72.49 3.74 1.48l2.8-2.8C16.83 2.98 14.62 2 12 2a9.74 9.74 0 0 0-8.75 5.42L6.5 9.95C7.28 7.62 9.45 5.9 12 5.9Z" />
    </svg>
  );
}

function GithubMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.56.1.76-.24.76-.54v-2.08c-3.1.68-3.76-1.32-3.76-1.32-.5-1.29-1.24-1.63-1.24-1.63-1.01-.69.08-.68.08-.68 1.12.08 1.71 1.15 1.71 1.15.99 1.7 2.59 1.21 3.22.93.1-.72.39-1.21.7-1.49-2.48-.28-5.09-1.24-5.09-5.51 0-1.22.44-2.22 1.15-3-.12-.28-.5-1.42.11-2.96 0 0 .94-.3 3.05 1.15a10.6 10.6 0 0 1 5.55 0c2.11-1.45 3.05-1.15 3.05-1.15.61 1.54.23 2.68.11 2.96.72.78 1.15 1.78 1.15 3 0 4.28-2.62 5.23-5.11 5.5.4.35.75 1.02.75 2.06v3.05c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z" />
    </svg>
  );
}

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const isRegister = mode === "register";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);

    try {
      const result = isRegister
        ? await authClient.signUp.email({ name: name.trim(), email: email.trim(), password })
        : await authClient.signIn.email({ email: email.trim(), password });

      if (result.error) {
        setError(result.error.message || "Authentication failed. Please try again.");
        return;
      }

      router.replace("/ai");
      router.refresh();
    } catch {
      setError("Unable to connect right now. Please try again.");
    } finally {
      setPending(false);
    }
  }

  async function signInWith(provider: SocialProvider) {
    setError("");
    setPending(true);

    try {
      const result = await authClient.signIn.social({
        provider,
        callbackURL: "/ai",
      });

      if (result.error) {
        setError(result.error.message || `${provider === "google" ? "Google" : "GitHub"} sign-in could not be started.`);
        setPending(false);
      }
    } catch {
      setError(`${provider === "google" ? "Google" : "GitHub"} sign-in could not be started. Please try again.`);
      setPending(false);
    }
  }

  return (
    <main className="auth-page auth-page-v2">
      <div className="auth-atmosphere" aria-hidden="true">
        <span />
        <span />
      </div>

      <header className="auth-header">
        <Link className="auth-brand" href="/" aria-label="Neftis home">
          <span className="auth-brand-mark"><svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="1.4" opacity=".38"/><path d="M13 32V16.8c0-2.5 3.1-3.6 4.7-1.7l12.6 15.1c1.6 1.9 4.7.8 4.7-1.7V16" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="35" cy="12" r="3" fill="var(--accent)"/></svg></span>
          <span>NEFTIS</span>
        </Link>
        <Link className="auth-home-link" href="/">Back to home <span aria-hidden="true">↗</span></Link>
      </header>

      <section className="auth-layout" aria-labelledby="auth-title">
        <aside className="auth-story">
          <div className="auth-story-top">
            <span className="auth-story-label"><i /> DIGITAL COMMONS / 2026</span>
            <span className="auth-story-index">N° 001</span>
          </div>

          <div className="auth-art" aria-hidden="true">
            <div className="auth-art-grid" />
            <div className="auth-art-orbit auth-art-orbit-a" />
            <div className="auth-art-orbit auth-art-orbit-b" />
            <div className="auth-art-orbit auth-art-orbit-c" />
            <div className="auth-art-core"><span>N</span></div>
            <span className="auth-art-caption auth-art-caption-a">IDEAS IN MOTION</span>
            <span className="auth-art-caption auth-art-caption-b">01 / 03</span>
          </div>

          <div className="auth-story-copy">
            <span className="section-kicker">A SPACE TO EXPLORE</span>
            <h2>Make room for<br /><em>what’s next.</em></h2>
            <p>AI, useful tools, shared knowledge, and a community built around curiosity.</p>
          </div>

          <div className="auth-story-foot">
            <span>THINK · CREATE · DISCOVER</span>
            <span>EST. NEFTIS</span>
          </div>
        </aside>

        <div className="auth-panel">
          <div className="auth-panel-heading">
            <span className="section-kicker">{isRegister ? "YOUR JOURNEY STARTS HERE" : "GOOD TO HAVE YOU BACK"}</span>
            <span className="auth-index">{isRegister ? "02 — 02" : "01 — 02"}</span>
          </div>

          <div className="auth-heading-copy">
            <h1 id="auth-title">{isRegister ? "Create an account." : "Welcome back."}</h1>
            <p>{isRegister ? "Set up your Neftis account and make this space yours." : "Sign in to pick up where your curiosity left off."}</p>
          </div>

          <div className="auth-social-stack">
            <button className="auth-social-button auth-provider-button" type="button" onClick={() => signInWith("google")} disabled={pending}>
              <span className="auth-provider-icon"><GoogleMark /></span>
              <span>Continue with Google</span>
              <span className="auth-provider-arrow" aria-hidden="true">↗</span>
            </button>
            <button className="auth-social-button auth-provider-button" type="button" onClick={() => signInWith("github")} disabled={pending}>
              <span className="auth-provider-icon auth-provider-github"><GithubMark /></span>
              <span>Continue with GitHub</span>
              <span className="auth-provider-arrow" aria-hidden="true">↗</span>
            </button>
          </div>

          <div className="auth-divider"><span>OR CONTINUE WITH EMAIL</span></div>

          <form className="auth-fields auth-fields-v2" onSubmit={submit}>
            {isRegister && (
              <label>
                <span>Your name</span>
                <input
                  autoComplete="name"
                  placeholder="How should we call you?"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  maxLength={80}
                  required
                />
              </label>
            )}
            <label>
              <span>Email address</span>
              <input
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>
            <label>
              <span>Password</span>
              <span className="auth-password-wrap">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete={isRegister ? "new-password" : "current-password"}
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  minLength={8}
                  required
                />
                <button type="button" className="auth-password-toggle" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? "Hide" : "Show"}
                </button>
              </span>
            </label>

            {error && <p className="auth-error" role="alert">{error}</p>}

            <button className="auth-submit auth-submit-v2" type="submit" disabled={pending}>
              <span>{pending ? "Please wait…" : isRegister ? "Create account" : "Sign in"}</span>
              <span aria-hidden="true">↗</span>
            </button>
          </form>

          <p className="auth-switch">
            {isRegister ? "Already have an account?" : "New to Neftis?"}{" "}
            <Link href={isRegister ? "/login" : "/register"}>{isRegister ? "Sign in" : "Create an account"}</Link>
          </p>

          <p className="auth-legal">By continuing, you agree to use Neftis respectfully and responsibly.</p>
        </div>
      </section>

      <footer className="auth-footer auth-footer-v2">
        <span>PRIVATE BY DEFAULT</span>
        <span>NEFTIS / DIGITAL COMMONS</span>
      </footer>
    </main>
  );
}
