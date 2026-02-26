import { neon } from "@neondatabase/serverless";

async function getTags() {
  const sql = neon(process.env.DATABASE_URL!);
  return sql`
    SELECT
      t.id, t.name, t.slug, t.tag_type, t.color,
      COUNT(bt.book_id)::int AS book_count
    FROM tags t
    LEFT JOIN book_tags bt
      ON bt.tag_id = t.id AND bt.deleted_at IS NULL
    WHERE t.deleted_at IS NULL
      AND t.visible = true
    GROUP BY t.id
    ORDER BY book_count DESC, t.name
  `;
}

const tagTypeLabel: Record<string, string> = {
  topic: "Themen",
  genre: "Genres",
  audience: "Für wen?",
  feature: "Ausstattung",
  award_genre: "Preis-Genres",
  award_type: "Preise",
  publisher_cluster: "Verlagsgruppen",
};

export default async function ThemenPage() {
  const tags = await getTags();

  // Group by tag_type
  const grouped = tags.reduce<Record<string, typeof tags>>((acc, tag) => {
    const type = tag.tag_type as string ?? "sonstige";
    if (!acc[type]) acc[type] = [];
    acc[type].push(tag);
    return acc;
  }, {});

  const order = ["topic", "genre", "audience", "publisher_cluster", "feature", "award_genre", "award_type"];
  const sortedGroups = order.filter((t) => grouped[t]?.length > 0);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--color-background)" }}>

      {/* Header */}
      <header style={{
        borderBottom: "1px solid var(--color-border)",
        padding: "0 var(--space-6)",
      }}>
        <div style={{
          maxWidth: "var(--max-width)",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "56px",
        }}>
          <a href="/" style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-xl)",
            color: "var(--color-text)",
            letterSpacing: "-0.02em",
          }}>
            The Backlist Club
          </a>
          <nav style={{ display: "flex", gap: "var(--space-6)" }}>
            {["Themen", "Kuratoren"].map((label) => (
              <a key={label} href={`/${label.toLowerCase()}`} style={{
                fontSize: "var(--text-sm)",
                color: label === "Themen" ? "var(--color-text)" : "var(--color-text-muted)",
              }}>
                {label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section style={{
        maxWidth: "var(--max-width)",
        margin: "0 auto",
        padding: "var(--space-12) var(--space-6) var(--space-10)",
      }}>
        <p style={{
          fontSize: "var(--text-xs)",
          color: "var(--color-text-subtle)",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          marginBottom: "var(--space-3)",
        }}>
          Entdecken
        </p>
        <h1 style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
          color: "var(--color-text)",
          marginBottom: "var(--space-3)",
        }}>
          Bücher nach Thema
        </h1>
        <p style={{
          fontSize: "var(--text-lg)",
          color: "var(--color-text-muted)",
          maxWidth: "38rem",
        }}>
          Stöbere durch unsere kuratierten Themen und entdecke Bücher die zu dir passen.
        </p>
      </section>

      {/* Tag Groups */}
      <main style={{
        maxWidth: "var(--max-width)",
        margin: "0 auto",
        padding: "0 var(--space-6) var(--space-20)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-12)",
      }}>
        {sortedGroups.map((type) => (
          <section key={type}>
            <h2 style={{
              fontSize: "var(--text-xs)",
              color: "var(--color-text-subtle)",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              marginBottom: "var(--space-4)",
            }}>
              {tagTypeLabel[type] ?? type}
            </h2>
            <div style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "var(--space-2)",
            }}>
              {grouped[type].map((tag: any) => (
                <a
                  key={tag.id}
                  href={`/themen/${tag.slug}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "var(--space-2)",
                    padding: "var(--space-2) var(--space-4)",
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-lg)",
                    fontSize: "var(--text-sm)",
                    color: "var(--color-text)",
                    transition: "border-color 0.15s, color 0.15s",
                    textDecoration: "none",
                  }}
                  className="tag-chip"
                >
                  {tag.name as string}
                  {(tag.book_count as number) > 0 && (
                    <span style={{
                      fontSize: "var(--text-xs)",
                      color: "var(--color-text-subtle)",
                    }}>
                      {(tag.book_count as number).toLocaleString("de-DE")}
                    </span>
                  )}
                </a>
              ))}
            </div>
          </section>
        ))}
      </main>

      <style>{`
        .tag-chip:hover {
          border-color: var(--color-text-muted) !important;
          color: var(--color-accent) !important;
        }
      `}</style>
    </div>
  );
}
