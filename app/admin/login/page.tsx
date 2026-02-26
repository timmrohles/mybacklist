"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useSearchParams();
  const from = params.get("from") ?? "/admin";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push(from);
    } else {
      setError("Falsches Passwort.");
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--color-background)" }}>
      <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: "360px", padding: "var(--space-8)", backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-2xl)", color: "var(--color-text)", marginBottom: "var(--space-6)" }}>
          Admin
        </h1>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Passwort"
          autoFocus
          style={{ width: "100%", padding: "var(--space-3) var(--space-4)", border: "1px solid var(--color-border)", borderRadius: "var(--radius)", fontSize: "var(--text-base)", backgroundColor: "var(--color-background)", color: "var(--color-text)", marginBottom: "var(--space-4)", boxSizing: "border-box" }}
        />
        {error && <p style={{ color: "var(--color-accent)", fontSize: "var(--text-sm)", marginBottom: "var(--space-3)" }}>{error}</p>}
        <button type="submit" disabled={loading} style={{ width: "100%", padding: "var(--space-3)", backgroundColor: "var(--color-text)", color: "var(--color-surface)", border: "none", borderRadius: "var(--radius)", fontSize: "var(--text-base)", fontFamily: "var(--font-body)", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
          {loading ? "…" : "Anmelden"}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}
