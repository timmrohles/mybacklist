type ActivePage = "themen" | "kuratoren" | null;

export default function SiteHeader({ active }: { active?: ActivePage }) {
  return (
    <header style={{ borderBottom: "1px solid var(--color-border)", padding: "0 var(--space-6)" }}>
      <div style={{
        maxWidth: "var(--max-width)", margin: "0 auto",
        display: "flex", alignItems: "center", justifyContent: "space-between", height: "56px",
      }}>
        <a href="/" style={{
          fontFamily: "var(--font-display)", fontSize: "var(--text-xl)",
          color: "var(--color-text)", letterSpacing: "-0.02em",
        }}>
          The Backlist Club
        </a>
        <nav style={{ display: "flex", gap: "var(--space-6)" }}>
          {([["Themen", "/themen", "themen"], ["Kuratoren", "/kuratoren", "kuratoren"]] as const).map(([label, href, key]) => (
            <a key={href} href={href} style={{
              fontSize: "var(--text-sm)",
              color: active === key ? "var(--color-text)" : "var(--color-text-muted)",
            }}>
              {label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
