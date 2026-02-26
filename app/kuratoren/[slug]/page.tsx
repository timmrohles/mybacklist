import Image from "next/image";
import { neon } from "@neondatabase/serverless";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

async function getCurator(slug: string) {
  const sql = neon(process.env.DATABASE_URL!);
  const [c] = await sql`
    SELECT id, name, slug, bio, avatar_url, focus, website_url, instagram_url, podcast_url
    FROM curators WHERE slug = ${slug} AND deleted_at IS NULL AND visible = true LIMIT 1
  `;
  return c ?? null;
}

async function getCurations(curatorId: number) {
  const sql = neon(process.env.DATABASE_URL!);
  return sql`
    SELECT c.id, c.title, c.rationale
    FROM curations c
    WHERE c.curator_id = ${curatorId} AND c.deleted_at IS NULL AND c.status = 'published'
    ORDER BY c.sort_order, c.created_at
  `;
}

async function getCurationBooks(curatorId: number) {
  const sql = neon(process.env.DATABASE_URL!);
  return sql`
    SELECT DISTINCT ON (b.id) b.id::text, b.title, b.author, b.cover_url
    FROM books b
    JOIN curation_books cb ON cb.book_id = b.id
    JOIN curations cu ON cu.id = cb.curation_id
    WHERE cu.curator_id = ${curatorId} AND cb.deleted_at IS NULL AND cu.deleted_at IS NULL
      AND b.deleted_at IS NULL AND (b.isbn13 LIKE '978%' OR b.isbn13 LIKE '979%')
      AND b.cover_url IS NOT NULL AND b.cover_url <> ''
    ORDER BY b.id, cb.sort_order LIMIT 24
  `;
}

function formatAuthor(raw: string | null) {
  if (!raw) return null;
  const parts = raw.split(",").map((s) => s.trim());
  return parts.length === 2 ? `${parts[1]} ${parts[0]}` : raw;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = await getCurator(slug);
  if (!c) return { title: "Kurator nicht gefunden" };
  return {
    title: `${c.name} – Kurator`,
    description: c.bio ? (c.bio as string).slice(0, 160) : `Buchempfehlungen von ${c.name}.`,
  };
}

export default async function CuratorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const curator = await getCurator(slug);
  if (!curator) notFound();

  const [curations, books] = await Promise.all([
    getCurations(curator.id as number),
    getCurationBooks(curator.id as number),
  ]);

  const avatarUrl = (curator.avatar_url as string)?.startsWith("http") ? curator.avatar_url as string : null;
  const validWebsite = curator.website_url && !["www", ""].includes(curator.website_url as string) ? curator.website_url as string : null;
  const validInstagram = curator.instagram_url && !["e", ""].includes(curator.instagram_url as string) ? curator.instagram_url as string : null;

  return (
    <>
      <div style={{ maxWidth: "var(--max-width)", margin: "0 auto", padding: "var(--space-4) var(--space-6) 0" }}>
        <a href="/kuratoren" style={{ fontSize: "var(--text-sm)", color: "var(--color-text-subtle)" }}>← Alle Kuratoren</a>
      </div>

      <section style={{ maxWidth: "var(--max-width)", margin: "0 auto", padding: "var(--space-8) var(--space-6) var(--space-10)", display: "grid", gridTemplateColumns: "auto 1fr", gap: "var(--space-8)", alignItems: "start" }} className="curator-header">
        <div style={{ width: "100px", height: "100px", borderRadius: "50%", backgroundColor: "var(--color-border-muted)", overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          {avatarUrl ? (
            <Image src={avatarUrl} alt={curator.name as string} fill sizes="100px" style={{ objectFit: "cover" }} />
          ) : (
            <span style={{ fontFamily: "var(--font-display)", fontSize: "2.5rem", color: "var(--color-text-muted)" }}>{(curator.name as string).charAt(0)}</span>
          )}
        </div>
        <div>
          {curator.focus && <p style={{ fontSize: "var(--text-xs)", color: "var(--color-accent)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "var(--space-2)" }}>{curator.focus as string}</p>}
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.5rem, 4vw, 2.25rem)", color: "var(--color-text)", marginBottom: "var(--space-3)" }}>{curator.name as string}</h1>
          {curator.bio && <p style={{ fontSize: "var(--text-base)", color: "var(--color-text-muted)", lineHeight: 1.7, maxWidth: "52ch", marginBottom: "var(--space-4)" }}>{curator.bio as string}</p>}
          <div style={{ display: "flex", gap: "var(--space-4)", flexWrap: "wrap" }}>
            {validWebsite && <a href={validWebsite} target="_blank" rel="noopener noreferrer" style={{ fontSize: "var(--text-sm)", color: "var(--color-text-subtle)" }}>Website ↗</a>}
            {validInstagram && <a href={validInstagram} target="_blank" rel="noopener noreferrer" style={{ fontSize: "var(--text-sm)", color: "var(--color-text-subtle)" }}>Instagram ↗</a>}
            {curator.podcast_url && <a href={curator.podcast_url as string} target="_blank" rel="noopener noreferrer" style={{ fontSize: "var(--text-sm)", color: "var(--color-text-subtle)" }}>Podcast ↗</a>}
          </div>
        </div>
      </section>

      <main style={{ maxWidth: "var(--max-width)", margin: "0 auto", padding: "0 var(--space-6) var(--space-20)" }}>
        {curations.length > 0 && (
          <section style={{ marginBottom: "var(--space-12)" }}>
            <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-subtle)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "var(--space-6)" }}>Buchempfehlungen</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              {curations.map((c: any) => (
                <div key={c.id} style={{ padding: "var(--space-4) var(--space-6)", backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius)" }}>
                  <p style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-lg)", color: "var(--color-text)" }}>{c.title as string}</p>
                  {c.rationale && <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)", marginTop: "var(--space-1)" }}>{c.rationale as string}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {books.length > 0 && (
          <section>
            <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-subtle)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "var(--space-6)" }}>Empfohlene Bücher</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "var(--space-6)" }}>
              {books.map((book: any) => (
                <a key={book.id} href={`/buch/${book.id}`} style={{ display: "block", textDecoration: "none" }} className="book-card">
                  <div style={{ position: "relative", aspectRatio: "2/3", backgroundColor: "var(--color-border-muted)", borderRadius: "var(--radius)", overflow: "hidden", marginBottom: "var(--space-2)", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
                    <Image src={book.cover_url} alt={book.title} fill sizes="160px" style={{ objectFit: "cover", transition: "transform 0.3s ease" }} className="book-cover-img" />
                  </div>
                  <p style={{ fontSize: "var(--text-xs)", fontWeight: 500, color: "var(--color-text)", lineHeight: 1.35, marginBottom: "var(--space-1)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{book.title}</p>
                  {book.author && <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-subtle)" }}>{formatAuthor(book.author)}</p>}
                </a>
              ))}
            </div>
          </section>
        )}
        {curations.length === 0 && books.length === 0 && (
          <p style={{ color: "var(--color-text-subtle)", paddingTop: "var(--space-8)" }}>Noch keine Empfehlungen vorhanden.</p>
        )}
      </main>

      <style>{`.book-card:hover .book-cover-img { transform: scale(1.04); }
        @media (max-width: 600px) { .curator-header { grid-template-columns: 1fr !important; } }`}</style>
    </>
  );
}
