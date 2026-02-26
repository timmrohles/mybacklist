import { neon } from "@neondatabase/serverless";

async function getCurators() {
  const sql = neon(process.env.DATABASE_URL!);
  return sql`
    SELECT id, name, slug, bio, avatar_url, focus
    FROM curators
    WHERE deleted_at IS NULL AND visible = true
    ORDER BY display_order, name
  `;
}

function avatarSrc(url: string | null): string | null {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  // relative upload paths — not available in new app
  return null;
}

export default async function KuratorenPage() {
  const curators = await getCurators();

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--color-background)" }}>

      {/* Header */}
      <header style={{ borderBottom: "1px solid var(--color-border)", padding: "0 var(--space-6)" }}>
        <div style={{
          maxWidth: "var(--max-width)", margin: "0 auto",
          display: "flex", alignItems: "center", justifyContent: "space-between", height: "56px",
        }}>
          <a href="/" style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", color: "var(--color-text)", letterSpacing: "-0.02em" }}>
            The Backlist Club
          </a>
          <nav style={{ display: "flex", gap: "var(--space-6)" }}>
            {[["Themen", "/themen"], ["Kuratoren", "/kuratoren"]].map(([label, href]) => (
              <a key={href} href={href} style={{
                fontSize: "var(--text-sm)",
                color: href === "/kuratoren" ? "var(--color-text)" : "var(--color-text-muted)",
              }}>
                {label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section style={{ maxWidth: "var(--max-width)", margin: "0 auto", padding: "var(--space-12) var(--space-6) var(--space-10)" }}>
        <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-subtle)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "var(--space-3)" }}>
          Menschen hinter den Empfehlungen
        </p>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.75rem, 4vw, 2.5rem)", color: "var(--color-text)", marginBottom: "var(--space-3)" }}>
          Unsere Kuratoren
        </h1>
        <p style={{ fontSize: "var(--text-lg)", color: "var(--color-text-muted)", maxWidth: "38rem" }}>
          Echte Menschen mit echten Leseempfehlungen – keine Algorithmen.
        </p>
      </section>

      {/* Curator Grid */}
      <main style={{
        maxWidth: "var(--max-width)", margin: "0 auto",
        padding: "0 var(--space-6) var(--space-20)",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: "var(--space-6)",
      }}>
        {curators.map((c: any) => {
          const avatar = avatarSrc(c.avatar_url);
          return (
            <a
              key={c.id}
              href={`/kuratoren/${c.slug}`}
              style={{
                display: "block",
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-lg)",
                padding: "var(--space-6)",
                textDecoration: "none",
                transition: "border-color 0.15s",
              }}
              className="curator-card"
            >
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", marginBottom: "var(--space-4)" }}>
                {/* Avatar */}
                <div style={{
                  width: "56px", height: "56px", borderRadius: "50%", flexShrink: 0,
                  backgroundColor: "var(--color-border-muted)",
                  overflow: "hidden",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {avatar ? (
                    <img src={avatar} alt={c.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <span style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", color: "var(--color-text-muted)" }}>
                      {(c.name as string).charAt(0)}
                    </span>
                  )}
                </div>
                <div>
                  <p style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-lg)", color: "var(--color-text)", marginBottom: "2px" }}>
                    {c.name as string}
                  </p>
                  {c.focus && (
                    <p style={{ fontSize: "var(--text-xs)", color: "var(--color-accent)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      {c.focus as string}
                    </p>
                  )}
                </div>
              </div>
              {c.bio && (
                <p style={{
                  fontSize: "var(--text-sm)", color: "var(--color-text-muted)", lineHeight: 1.6,
                  display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden",
                }}>
                  {c.bio as string}
                </p>
              )}
            </a>
          );
        })}
      </main>

      <style>{`.curator-card:hover { border-color: var(--color-text-muted) !important; }`}</style>
    </div>
  );
}
