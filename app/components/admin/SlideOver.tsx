"use client";

import { useEffect, useRef } from "react";

interface SlideOverProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function SlideOver({ open, onClose, title, children }: SlideOverProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", justifyContent: "flex-end" }}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.35)" }}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "480px",
          height: "100%",
          backgroundColor: "var(--color-surface)",
          boxShadow: "-4px 0 24px rgba(0,0,0,0.12)",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "var(--space-6)",
          borderBottom: "1px solid var(--color-border)",
          position: "sticky",
          top: 0,
          backgroundColor: "var(--color-surface)",
          zIndex: 1,
        }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", color: "var(--color-text)", margin: 0 }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "var(--text-lg)",
              color: "var(--color-text-subtle)",
              lineHeight: 1,
              padding: "var(--space-1)",
            }}
            aria-label="Schließen"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: "var(--space-6)", flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
