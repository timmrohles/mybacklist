import Image from "next/image";
import { neon } from "@neondatabase/serverless";

async function getFeaturedBooks() {
  const sql = neon(process.env.DATABASE_URL!);
  return sql`
    SELECT id::text, title, author, cover_url
    FROM books
    WHERE deleted_at IS NULL
      AND (isbn13 LIKE '978%' OR isbn13 LIKE '979%')
      AND cover_url IS NOT NULL AND cover_url <> ''
    ORDER BY total_score DESC
    LIMIT 24
  `;
}

function formatAuthor(raw: string | null) {
  if (!raw) return null;
  const parts = raw.split(",").map((s) => s.trim());
  return parts.length === 2 ? `${parts[1]} ${parts[0]}` : raw;
}

export default async function Home() {
  const books = await getFeaturedBooks();

  return (
    <>
      <section style={{ maxWidth: "var(--max-width)", margin: "0 auto", padding: "var(--space-16) var(--space-6) var(--space-12)" }}>
        <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-subtle)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "var(--space-4)" }}>
          Persönliche Buchempfehlungen
        </p>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 5vw, 3rem)", color: "var(--color-text)", maxWidth: "32rem", marginBottom: "var(--space-4)" }}>
          Bücher die wirklich bleiben.
        </h1>
        <p style={{ fontSize: "var(--text-lg)", color: "var(--color-text-muted)", maxWidth: "38rem", lineHeight: 1.65 }}>
          Handverlesene Empfehlungen – keine Algorithmen, keine Bestsellerlisten.
          Nur Bücher die ich selbst gelesen und geliebt habe.
        </p>
      </section>

      <section style={{ maxWidth: "var(--max-width)", margin: "0 auto", padding: "0 var(--space-6) var(--space-20)" }}>
        <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-subtle)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "var(--space-8)" }}>
          Aktuelle Empfehlungen
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "var(--space-6)" }}>
          {books.map((book: any) => (
            <a key={book.id} href={`/buch/${book.id}`} style={{ display: "block", textDecoration: "none" }} className="book-card">
              <div style={{ position: "relative", aspectRatio: "2/3", backgroundColor: "var(--color-border-muted)", borderRadius: "var(--radius)", overflow: "hidden", marginBottom: "var(--space-2)", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
                <Image
                  src={book.cover_url}
                  alt={book.title}
                  fill
                  sizes="(max-width: 480px) 42vw, (max-width: 1024px) 20vw, 160px"
                  style={{ objectFit: "cover", transition: "transform 0.3s ease" }}
                  className="book-cover-img"
                />
              </div>
              <p style={{ fontSize: "var(--text-xs)", fontWeight: 500, color: "var(--color-text)", lineHeight: 1.35, marginBottom: "var(--space-1)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {book.title}
              </p>
              {book.author && (
                <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-subtle)" }}>{formatAuthor(book.author)}</p>
              )}
            </a>
          ))}
        </div>
      </section>
      <style>{`.book-card:hover .book-cover-img { transform: scale(1.04); }`}</style>

      <div style={{ textAlign: "center", padding: "var(--space-8) var(--space-6)", borderTop: "1px solid var(--color-border-muted)" }}>
        <a href="/admin" style={{ fontSize: "var(--text-xs)", color: "var(--color-text-subtle)" }}>Admin</a>
      </div>
    </>
  );
}
