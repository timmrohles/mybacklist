"use client";

import { useState } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header style={{
        borderBottom: "1px solid var(--color-border)",
        backgroundColor: "var(--color-surface)",
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <div style={{
          maxWidth: "var(--max-width)", margin: "0 auto",
          padding: "0 var(--space-6)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          height: "56px",
        }}>
          <a href="/" style={{
            fontFamily: "var(--font-display)", fontSize: "var(--text-xl)",
            color: "var(--color-text)", letterSpacing: "-0.02em", textDecoration: "none",
          }}>
            The Backlist Club
          </a>

          {/* Desktop Nav */}
          <nav className="desktop-nav" style={{ display: "flex", gap: "var(--space-6)" }}>
            <a href="/themen" style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)", textDecoration: "none" }}>Themen</a>
            <a href="/kuratoren" style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)", textDecoration: "none" }}>Kuratoren</a>
            <a href="/kurator" style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)", textDecoration: "none" }}>Kurator</a>
          </nav>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setOpen(!open)}
            aria-label="Menü öffnen"
            className="hamburger"
            style={{
              display: "none", background: "none", border: "none",
              cursor: "pointer", padding: "var(--space-2)", color: "var(--color-text)",
            }}
          >
            {open ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {open && (
        <div className="mobile-menu" style={{
          position: "fixed", top: "56px", left: 0, right: 0, bottom: 0,
          backgroundColor: "var(--color-surface)", zIndex: 40,
          padding: "var(--space-8) var(--space-6)",
          display: "flex", flexDirection: "column", gap: "var(--space-4)",
        }}>
          {[["Themen", "/themen"], ["Kuratoren", "/kuratoren"], ["Kurator", "/kurator"], ["Impressum", "/impressum"], ["Datenschutz", "/datenschutz"]].map(([label, href]) => (
            <a key={href} href={href} onClick={() => setOpen(false)} style={{
              fontSize: "var(--text-xl)", fontFamily: "var(--font-display)",
              color: "var(--color-text)", textDecoration: "none",
              paddingBottom: "var(--space-4)", borderBottom: "1px solid var(--color-border)",
            }}>
              {label}
            </a>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .desktop-nav { display: none !important; }
          .hamburger { display: flex !important; }
        }
      `}</style>
    </>
  );
}
