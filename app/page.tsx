import { neon } from "@neondatabase/serverless";

async function getFeaturedBooks() {
  const sql = neon(process.env.DATABASE_URL!);
  const books = await sql`
    SELECT id::text, title, author, cover_url
    FROM books
    WHERE deleted_at IS NULL
      AND (isbn13 LIKE '978%' OR isbn13 LIKE '979%')
      AND cover_url IS NOT NULL
      AND cover_url <> ''
    ORDER BY total_score DESC
    LIMIT 24
  `;
  return books;
}

function formatAuthor(raw: string | null) {
  if (!raw) return null;
  // "Nachname, Vorname" → "Vorname Nachname"
  const parts = raw.split(",").map((s) => s.trim());
  return parts.length === 2 ? `${parts[1]} ${parts[0]}` : raw;
}

export default async function Home() {
  const books = await getFeaturedBooks();

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
          <span style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-xl)",
            color: "var(--color-text)",
            letterSpacing: "-0.02em",
          }}>
            The Backlist Club
          </span>
          <nav style={{ display: "flex", gap: "var(--space-6)" }}>
            {["Themen", "Kuratoren"].map((label) => (
              <a
                key={label}
                href={`/${label.toLowerCase()}`}
                style={{
                  fontSize: "var(--text-sm)",
                  color: "var(--color-text-muted)",
                  transition: "color 0.15s",
                }}
              >
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
        padding: "var(--space-16) var(--space-6) var(--space-12)",
      }}>
        <p style={{
          fontSize: "var(--text-xs)",
          color: "var(--color-text-subtle)",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          marginBottom: "var(--space-4)",
        }}>
          Persönliche Buchempfehlungen
        </p>
        <h1 style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(2rem, 5vw, 3rem)",
          color: "var(--color-text)",
          maxWidth: "32rem",
          marginBottom: "var(--space-4)",
        }}>
          Bücher die wirklich bleiben.
        </h1>
        <p style={{
          fontSize: "var(--text-lg)",
          color: "var(--color-text-muted)",
          maxWidth: "38rem",
          lineHeight: 1.65,
        }}>
          Handverlesene Empfehlungen – keine Algorithmen, keine Bestsellerlisten.
          Nur Bücher die ich selbst gelesen und geliebt habe.
        </p>
      </section>

      {/* Book Grid */}
      <section style={{
        maxWidth: "var(--max-width)",
        margin: "0 auto",
        padding: "0 var(--space-6) var(--space-20)",
      }}>
        <p style={{
          fontSize: "var(--text-xs)",
          color: "var(--color-text-subtle)",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          marginBottom: "var(--space-8)",
        }}>
          Aktuelle Empfehlungen
        </p>

        {books.length === 0 ? (
          <p style={{ color: "var(--color-text-subtle)", fontSize: "var(--text-sm)" }}>
            Noch keine Bücher vorhanden.
          </p>
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
