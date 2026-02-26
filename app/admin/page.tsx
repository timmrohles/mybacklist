import { neon } from "@neondatabase/serverless";

async function getStats() {
  const sql = neon(process.env.DATABASE_URL!);
  const [books] = await sql`SELECT COUNT(*)::int FROM books WHERE deleted_at IS NULL AND (isbn13 LIKE '978%' OR isbn13 LIKE '979%')`;
  const [featured] = await sql`SELECT COUNT(*)::int FROM books WHERE deleted_at IS NULL AND is_featured = true`;
  const [tags] = await sql`SELECT COUNT(*)::int FROM tags WHERE deleted_at IS NULL`;
  const [affiliates] = await sql`SELECT COUNT(*)::int FROM affiliates WHERE deleted_at IS NULL AND is_active = true`;
  const [curators] = await sql`SELECT COUNT(*)::int FROM curators WHERE deleted_at IS NULL AND visible = true`;
  return { books: books.count, featured: featured.count, tags: tags.count, affiliates: affiliates.count, curators: curators.count };
}

export default async function AdminPage() {
  const stats = await getStats();

  const cards = [
    { label: "Bücher (gesamt)", value: Number(stats.books).toLocaleString("de-DE"), href: "/admin/buecher" },
    { label: "Featured Bücher", value: stats.featured, href: "/admin/buecher" },
    { label: "Tags", value: stats.tags, href: "/admin/tags" },
    { label: "Affiliates", value: stats.affiliates, href: "/admin/affiliates" },
    { label: "Sichtbare Kuratoren", value: stats.curators, href: "/admin/kuratoren" },
  ];

  const links = [
    ["Bücher verwalten", "/admin/buecher"],
    ["Affiliates verwalten", "/admin/affiliates"],
    ["Tags verwalten", "/admin/tags"],
    ["Kuratoren verwalten", "/admin/kuratoren"],
    ["→ Zur Website", "/"],
  ];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f4f4f0", padding: "var(--space-8) var(--space-6)" }}>
      <div style={{ maxWidth: "960px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-8)" }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-2xl)", color: "var(--color-text)" }}>Admin Dashboard</h1>
          <a href="/api/admin/logout" style={{ fontSize: "var(--text-sm)", color: "var(--color-text-subtle)" }}>Abmelden</a>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "var(--space-4)", marginBottom: "var(--space-8)" }}>
          {cards.map((card) => (
            <div key={card.label} style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius)", padding: "var(--space-4)" }}>
              <p style={{ fontSize: "var(--text-2xl)", fontFamily: "var(--font-display)", color: "var(--color-text)", marginBottom: "var(--space-1)" }}>{card.value}</p>
              <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-subtle)" }}>{card.label}</p>
            </div>
          ))}
        </div>

        {/* Nav */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          {links.map(([label, href]) => (
            <a key={href} href={href} style={{ display: "block", padding: "var(--space-4) var(--space-6)", backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius)", fontSize: "var(--text-base)", color: "var(--color-text)", textDecoration: "none" }}>
              {label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
