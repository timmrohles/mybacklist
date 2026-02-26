import { neon } from "@neondatabase/serverless";
import type { Metadata } from "next";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";

export const metadata: Metadata = {
  title: "Themen",
  description: "Bücher nach Themen entdecken – kuratierte Buchempfehlungen auf The Backlist Club.",
};

async function getTags() {
  const sql = neon(process.env.DATABASE_URL!);
  return sql`
    SELECT t.id, t.name, t.slug, t.tag_type, COUNT(bt.book_id)::int AS book_count
    FROM tags t
    LEFT JOIN book_tags bt ON bt.tag_id = t.id AND bt.deleted_at IS NULL
    WHERE t.deleted_at IS NULL AND t.visible = true
    GROUP BY t.id ORDER BY book_count DESC, t.name
  `;
}

const tagTypeLabel: Record<string, string> = {
  topic: "Themen", genre: "Genres", audience: "Für wen?",
  feature: "Ausstattung", award_genre: "Preis-Genres",
  award_type: "Preise", publisher_cluster: "Verlagsgruppen",
};

const order = ["topic", "genre", "audience", "publisher_cluster", "feature", "award_genre", "award_type"];

export default async function ThemenPage() {
  const tags = await getTags();
  const grouped = tags.reduce<Record<string, typeof tags>>((acc, tag) => {
    const type = tag.tag_type as string ?? "sonstige";
    if (!acc[type]) acc[type] = [];
    acc[type].push(tag);
    return acc;
  }, {});
  const sortedGroups = order.filter((t) => grouped[t]?.length > 0);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--color-background)", display: "flex", flexDirection: "column" }}>
      <SiteHeader active="themen" />

      <section style={{ maxWidth: "var(--max-width)", margin: "0 auto", padding: "var(--space-12) var(--space-6) var(--space-10)", width: "100%" }}>
        <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-subtle)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "var(--space-3)" }}>Entdecken</p>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.75rem, 4vw, 2.5rem)", color: "var(--color-text)", marginBottom: "var(--space-3)" }}>Bücher nach Thema</h1>
        <p style={{ fontSize: "var(--text-lg)", color: "var(--color-text-muted)", maxWidth: "38rem" }}>
          Stöbere durch unsere kuratierten Themen und entdecke Bücher die zu dir passen.
        </p>
      </section>

      <main style={{ maxWidth: "var(--max-width)", margin: "0 auto", padding: "0 var(--space-6) var(--space-12)", display: "flex", flexDirection: "column", gap: "var(--space-12)", flex: 1, width: "100%" }}>
        {sortedGroups.map((type) => (
          <section key={type}>
            <h2 style={{ fontSize: "var(--text-xs)", color: "var(--color-text-subtle)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "var(--space-4)" }}>
              {tagTypeLabel[type] ?? type}
            </h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>
              {grouped[type].map((tag: any) => (
                <a key={tag.id} href={`/themen/${tag.slug}`} style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-2)", padding: "var(--space-2) var(--space-4)", backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", fontSize: "var(--text-sm)", color: "var(--color-text)", textDecoration: "none", transition: "border-color 0.15s, color 0.15s" }} className="tag-chip">
                  {tag.name as string}
                  {(tag.book_count as number) > 0 && (
                    <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-subtle)" }}>{(tag.book_count as number).toLocaleString("de-DE")}</span>
                  )}
                </a>
              ))}
            </div>
          </section>
        ))}
      </main>

      <SiteFooter />
      <style>{`.tag-chip:hover { border-color: var(--color-text-muted) !important; color: var(--color-accent) !important; }`}</style>
    </div>
  );
}
