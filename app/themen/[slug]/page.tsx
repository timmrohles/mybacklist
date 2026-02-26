import { neon } from "@neondatabase/serverless";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

async function getTag(slug: string) {
  const sql = neon(process.env.DATABASE_URL!);
  const [tag] = await sql`
    SELECT
      t.id, t.name, t.slug, t.tag_type, t.description, t.color,
      COUNT(bt.book_id)::int AS book_count
    FROM tags t
    LEFT JOIN book_tags bt
      ON bt.tag_id = t.id AND bt.deleted_at IS NULL
    WHERE t.slug = ${slug}
      AND t.deleted_at IS NULL
    GROUP BY t.id
    LIMIT 1
  `;
  return tag ?? null;
}

async function getBooksByTag(tagId: number) {
  const sql = neon(process.env.DATABASE_URL!);
  return sql`
    SELECT b.id::text, b.title, b.author, b.cover_url
    FROM books b
    JOIN book_tags bt ON bt.book_id = b.id
    WHERE bt.tag_id = ${tagId}
      AND bt.deleted_at IS NULL
      AND b.deleted_at IS NULL
      AND (b.isbn13 LIKE '978%' OR b.isbn13 LIKE '979%')
      AND b.cover_url IS NOT NULL AND b.cover_url <> ''
    ORDER BY b.total_score DESC
    LIMIT 48
  `;
}

function formatAuthor(raw: string | null) {
  if (!raw) return null;
  const parts = raw.split(",").map((s) => s.trim());
  return parts.length === 2 ? `${parts[1]} ${parts[0]}` : raw;
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const tag = await getTag(slug);
  if (!tag) return { title: "Thema nicht gefunden | The Backlist Club" };

  const count = tag.book_count as number;
  const title = `${tag.name} – Buchempfehlungen | The Backlist Club`;
  const description = count > 0
    ? `${count.toLocaleString("de-DE")} handverlesene Bücher zum Thema ${tag.name} – entdecke Empfehlungen auf The Backlist Club.`
    : `Buchempfehlungen zum Thema ${tag.name} auf The Backlist Club.`;

  return { title, description, openGraph: { title, description } };
}

const tagTypeLabel: Record<string, string> = {
  topic: "Thema",
  genre: "Genre",
  audience: "Zielgruppe",
  feature: "Ausstattung",
  award_genre: "Preis-Genre",
  award_type: "Preisart",
  publisher_cluster: "Verlagsgruppe",
};

export default async function TagPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tag = await getTag(slug);

  if (!tag) notFound();

  const books = await getBooksByTag(tag.id as number);

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

      {/* Breadcrumb */}
      <div style={{
        maxWidth: "var(--max-width)",
        margin: "0 auto",
        padding: "var(--space-4) var(--space-6) 0",
      }}>
        <a href="/themen" style={{
          fontSize: "var(--text-sm)",
          color: "var(--color-text-subtle)",
        }}>
          ← Alle Themen
        </a>
      </div>

      {/* Tag Header */}
      <section style={{
        maxWidth: "var(--max-width)",
        margin: "0 auto",
        padding: "var(--space-8) var(--space-6) var(--space-10)",
      }}>
        <p style={{
          fontSize: "var(--text-xs)",
          color: "var(--color-text-subtle)",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          marginBottom: "var(--space-3)",
        }}>
          {tagTypeLabel[tag.tag_type as string] ?? tag.tag_type as string}
        </p>
        <h1 style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
          color: "var(--color-text)",
          marginBottom: "var(--space-3)",
        }}>
          {tag.name as string}
        </h1>
        {tag.description && (
          <p style={{
            fontSize: "var(--text-lg)",
            color: "var(--color-text-muted)",
            maxWidth: "42rem",
            lineHeight: 1.65,
            marginBottom: "var(--space-3)",
          }}>
            {tag.description as string}
          </p>
        )}
        <p style={{
          fontSize: "var(--text-sm)",
          color: "var(--color-text-subtle)",
        }}>
          {(tag.book_count as number) > 0
            ? `${(tag.book_count as number).toLocaleString("de-DE")} Bücher`
            : "Noch keine Bücher zugeordnet"}
        </p>
      </section>

      {/* Book Grid */}
      <section style={{
        maxWidth: "var(--max-width)",
        margin: "0 auto",
        padding: "0 var(--space-6) var(--space-20)",
      }}>
        {books.length === 0 ? (
          <div style={{
            padding: "var(--space-16) 0",
            textAlign: "center",
          }}>
            <p style={{ color: "var(--color-text-subtle)", fontSize: "var(--text-base)" }}>
              Für dieses Thema sind noch keine Bücher verfügbar.
            </p>
            <a href="/" style={{
              display: "inline-block",
              marginTop: "var(--space-4)",
              fontSize: "var(--text-sm)",
              color: "var(--color-accent)",
            }}>
              Zur Startseite
            </a>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
            gap: "var(--space-6)",
          }}>
            {books.map((book: any) => (
              <a
                key={book.id}
                href={`/buch/${book.id}`}
                style={{ display: "block", textDecoration: "none" }}
                className="book-card"
              >
                <div style={{
                  aspectRatio: "2/3",
                  backgroundColor: "var(--color-border-muted)",
                  borderRadius: "var(--radius)",
                  overflow: "hidden",
                  marginBottom: "var(--space-2)",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                }}>
                  <img
                    src={book.cover_url}
                    alt={book.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                      transition: "transform 0.3s ease",
                    }}
                    className="book-cover-img"
                  />
                </div>
                <p style={{
                  fontSize: "var(--text-xs)",
                  fontWeight: 500,
                  color: "var(--color-text)",
                  lineHeight: 1.35,
                  marginBottom: "var(--space-1)",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}>
                  {book.title}
                </p>
                {book.author && (
                  <p style={{
                    fontSize: "var(--text-xs)",
                    color: "var(--color-text-subtle)",
                  }}>
                    {formatAuthor(book.author)}
                  </p>
                )}
              </a>
            ))}
          </div>
        )}
      </section>

      <style>{`
        .book-card:hover .book-cover-img { transform: scale(1.04); }
      `}</style>
    </div>
  );
}
