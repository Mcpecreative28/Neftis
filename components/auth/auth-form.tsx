"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";

type AuthFormProps = {
  mode: "login" | "register";
};

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("Unable to connect right now. Please try again.");
    } finally {
      setPending(false);
    }
  }

  async function signInWithGoogle() {
    setError("");
    setPending(true);

    try {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      });

      if (result.error) {
        setError(result.error.message || "Google sign-in could not be started.");
        setPending(false);
      }
    } catch {
      setError("Google sign-in could not be started. Please try again.");
      setPending(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-atmosphere" aria-hidden="true">
        <span />
        <span />
      </div>
      <a className="auth-brand" href="/" aria-label="Neftis home">
        <span className="auth-brand-mark">N</span>
        <span>NEFTIS</span>
      </a>

      <section className="auth-card" aria-labelledby="auth-title">
        <div className="auth-card-top">
          <span className="section-kicker">NEFTIS / ACCOUNT</span>
          <span className="auth-index">01 — 02</span>
        </div>
        <div className="auth-symbol" aria-hidden="true">✳</div>
        <h1 id="auth-title">{isRegister ? "Create your space." : "Welcome back."}</h1>
        <p className="auth-lead">
          {isRegister
            ? "One account for your tools, conversations, and discoveries."
            : "Sign in to continue to your private Neftis workspace."}
        </p>

        <button className="auth-social-button" type="button" onClick={signInWithGoogle} disabled={pending}>
          <span className="auth-google-mark" aria-hidden="true">G</span>
          Continue with Google
          <span className="auth-button-arrow" aria-hidden="true">↗</span>
        </button>
        <button className="auth-social-button auth-social-disabled" type="button" disabled title="GitHub OAuth will be enabled after its application credentials are configured in Neon Auth.">
          <span className="auth-github-mark" aria-hidden="true">⌘</span>
          GitHub
          <span className="auth-soon">SOON</span>
        </button>

        <div className="auth-divider"><span>OR WITH EMAIL</span></div>

        <form className="auth-fields" onSubmit={submit}>
          {isRegister && (
            <label>
              <span>Display name</span>
              <input
                autoComplete="name"
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
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label>
            <span>Password</span>
            <input
              type="password"
              autoComplete={isRegister ? "new-password" : "current-password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={8}
              required
            />
          </label>

          {error && <p className="auth-error" role="alert">{error}</p>}

          <button className="auth-submit" type="submit" disabled={pending}>
            {pending ? "Please wait…" : isRegister ? "Create account" : "Sign in"}
            <span aria-hidden="true">↗</span>
          </button>
        </form>

        <p className="auth-switch">
          {isRegister ? "Already have an account?" : "New to Neftis?"}{" "}
          <a href={isRegister ? "/login" : "/register"}>
            {isRegister ? "Sign in" : "Create an account"}
          </a>
        </p>
      </section>

      <footer className="auth-footer">
        <span>PRIVATE BY DEFAULT</span>
        <span>NEFTIS / DIGITAL COMMONS</span>
      </footer>
    </main>
  );
}
