"use client";
import { useState } from "react";
export default function Login() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return <main className="login-shell"><form className="login-card" onSubmit={async event => {
    event.preventDefault(); setBusy(true); setError("");
    const values = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(values)) });
      const result = await response.json() as Record<string, any>;
      if (!response.ok) throw new Error(result.error);
      window.location.reload();
    } catch (e) { setError(e instanceof Error ? e.message : "Sign-in failed."); setBusy(false); }
  }}><div className="brand-mark"><span>B</span></div><span className="eyebrow">BULK PUBLISHER STUDIO</span><h1>Admin sign in</h1><p>Your publishing workspace.</p><label>Username<input name="username" autoComplete="username" required defaultValue="admin" /></label><label>Password<input name="password" type="password" autoComplete="current-password" required /></label>{error && <p role="alert" className="delivery-error">{error}</p>}<button className="button-primary" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button></form></main>;
}
