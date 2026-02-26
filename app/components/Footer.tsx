export default function Footer() {
  return (
    <footer style={{
      borderTop: "1px solid var(--color-border)",
      backgroundColor: "var(--color-surface)",
      padding: "var(--space-12) var(--space-6)",
      marginTop: "var(--space-12)",
    }}>
      <div style={{
        maxWidth: "var(--max-width)", margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "1fr auto",
        gap: "var(--space-8)",
        alignItems: "start",
      }} className="footer-grid">
        {/* Brand */}
        <div>
          <a href="/" style={{
            fontFamily: "var(--font-display)", fontSize: "var(--text-xl)",
            color: "var(--color-text)", letterSpacing: "-0.02em", textDecoration: "none",
            display: "block", marginBottom: "var(--space-3)",
          }}>
            The Backlist Club
          </a>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)", maxWidth: "32ch", lineHeight: 1.6 }}>
            Handverlesene Buchempfehlungen – keine Algorithmen, keine Bestsellerlisten.
          </p>
        </div>

        {/* Links */}
        <nav style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", textAlign: "right" }}>
          {[["Kurator", "/kurator"], ["Themen", "/themen"], ["Impressum", "/impressum"], ["Datenschutz", "/datenschutz"], ["FAQ", "/faq"]].map(([label, href]) => (
            <a key={href} href={href} style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)", textDecoration: "none" }}>{label}</a>
          ))}
        </nav>
      </div>

      <div style={{
        maxWidth: "var(--max-width)", margin: "var(--space-8) auto 0",
        paddingTop: "var(--space-6)", borderTop: "1px solid var(--color-border)",
        fontSize: "var(--text-xs)", color: "var(--color-text-subtle)",
      }}>
        © {new Date().getFullYear()} The Backlist Club · Affiliate-Links zu Thalia und buecher.de
      </div>

      <style>{`
        @media (max-width: 480px) {
          .footer-grid { grid-template-columns: 1fr !important; }
          .footer-grid nav { text-align: left !important; }
        }
      `}</style>
    </footer>
  );
}
