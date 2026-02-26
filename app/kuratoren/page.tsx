import Image from "next/image";
import { neon } from "@neondatabase/serverless";
import type { Metadata } from "next";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";

export const metadata: Metadata = {
  title: "Kuratoren",
  description: "Echte Menschen mit echten Leseempfehlungen – die Kuratoren von The Backlist Club.",
};

async function getCurators() {
  const sql = neon(process.env.DATABASE_URL!);
  return sql`
    SELECT id, name, slug, bio, avatar_url, focus
    FROM curators
    WHERE deleted_at IS NULL AND visible = true
    ORDER BY display_order, name
  `;
}

export default async function KuratorenPage() {
  const curators = await getCurators();

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--color-background)", display: "flex", flexDirection: "column" }}>
      <SiteHeader active="kuratoren" />

      <section style={{ maxWidth: "var(--max-width)", margin: "0 auto", padding: "var(--space-12) var(--space-6) var(--space-10)", width: "100%" }}>
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

      <main style={{ maxWidth: "var(--max-width)", margin: "0 auto", padding: "0 var(--space-6) var(--space-12)", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "var(--space-6)", flex: 1, width: "100%", alignContent: "start" }}>
        {curators.map((c: any) => {
          const avatarUrl = (c.avatar_url as string)?.startsWith("http") ? c.avatar_url as string : null;
          return (
            <a key={c.id} href={`/kuratoren/${c.slug}`} style={{ display: "block", backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "var(--space-6)", textDecoration: "none", transition: "border-color 0.15s" }} className="curator-card">
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", marginBottom: "var(--space-4)" }}>
                <div style={{ width: "56px", height: "56px", borderRadius: "50%", flexShrink: 0, backgroundColor: "var(--color-border-muted)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                  {avatarUrl ? (
                    <Image src={avatarUrl} alt={c.name} fill sizes="56px" style={{ objectFit: "cover" }} />
                  ) : (
                    <span style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", color: "var(--color-text-muted)" }}>{(c.name as string).charAt(0)}</span>
                  )}
                </div>
                <div>
                  <p style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-lg)", color: "var(--color-text)", marginBottom: "2px" }}>{c.name as string}</p>
                  {c.focus && <p style={{ fontSize: "var(--text-xs)", color: "var(--color-accent)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{c.focus as string}</p>}
                </div>
              </div>
              {c.bio && (
                <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{c.bio as string}</p>
              )}
            </a>
          );
        })}
      </main>

      <SiteFooter />
      <style>{`.curator-card:hover { border-color: var(--color-text-muted) !important; }`}</style>
    </div>
  );
}
