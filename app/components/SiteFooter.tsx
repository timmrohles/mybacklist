export default function SiteFooter() {
  return (
    <footer style={{
      borderTop: "1px solid var(--color-border)",
      padding: "var(--space-8) var(--space-6)",
      marginTop: "auto",
    }}>
      <div style={{
        maxWidth: "var(--max-width)", margin: "0 auto",
        display: "flex", flexWrap: "wrap",
        justifyContent: "space-between", alignItems: "center",
        gap: "var(--space-4)",
      }}>
        <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-subtle)" }}>
          © {new Date().getFullYear()} The Backlist Club
        </span>
        <nav style={{ display: "flex", gap: "var(--space-6)", flexWrap: "wrap" }}>
          {[
            ["Kurator", "/kurator"],
            ["Impressum", "/impressum"],
            ["Datenschutz", "/datenschutz"],
            ["FAQ", "/faq"],
          ].map(([label, href]) => (
            <a key={href} href={href} style={{ fontSize: "var(--text-sm)", color: "var(--color-text-subtle)" }}>
              {label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
