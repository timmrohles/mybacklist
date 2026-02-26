import { neon } from "@neondatabase/serverless";
import { notFound } from "next/navigation";

async function getBook(id: string) {
  const sql = neon(process.env.DATABASE_URL!);
  const [book] = await sql`
    SELECT
      id::text, title, author, publisher, cover_url,
      description, price::text, isbn13, language,
      availability, is_indie, total_score
    FROM books
    WHERE id = ${id}::integer
      AND deleted_at IS NULL
    LIMIT 1
  `;
  return book ?? null;
}

async function getAffiliates() {
  const sql = neon(process.env.DATABASE_URL!);
  return sql`
    SELECT name, slug, link_template, favicon_url
    FROM affiliates
    WHERE deleted_at IS NULL AND is_active = true
    ORDER BY display_order
  `;
}

function formatAuthor(raw: string | null) {
  if (!raw) return null;
  const parts = raw.split(",").map((s) => s.trim());
  return parts.length === 2 ? `${parts[1]} ${parts[0]}` : raw;
}

function buildAffiliateUrl(template: string, isbn13: string) {
  return template.replace("{isbn13}", isbn13);
}

export default async function BookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [book, affiliates] = await Promise.all([getBook(id), getAffiliates()]);

  if (!book) notFound();

  const author = formatAuthor(book.author as string | null);

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
                color: "var(--color-text-muted)",
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
        <a href="/" style={{
          fontSize: "var(--text-sm)",
          color: "var(--color-text-subtle)",
        }}>
          ← Alle Bücher
        </a>
      </div>

      {/* Main Content */}
      <main style={{
        maxWidth: "var(--max-width)",
        margin: "0 auto",
        padding: "var(--space-8) var(--space-6) var(--space-20)",
        display: "grid",
        gridTemplateColumns: "240px 1fr",
        gap: "var(--space-12)",
        alignItems: "start",
      }}
        className="book-detail-layout"
      >
        {/* Cover */}
        <div>
          {book.cover_url ? (
            <img
              src={book.cover_url as string}
              alt={book.title as string}
              style={{
                width: "100%",
                aspectRatio: "2/3",
                objectFit: "cover",
                borderRadius: "var(--radius)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
                display: "block",
              }}
            />
          ) : (
            <div style={{
              width: "100%",
              aspectRatio: "2/3",
              backgroundColor: "var(--color-border-muted)",
              borderRadius: "var(--radius)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <span style={{ color: "var(--color-text-subtle)", fontSize: "var(--text-sm)" }}>
                Kein Cover
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {book.is_indie && (
            <span style={{
              display: "inline-block",
              fontSize: "var(--text-xs)",
              color: "var(--color-accent)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: "var(--space-3)",
            }}>
              Indie
            </span>
          )}

          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.5rem, 4vw, 2.25rem)",
            color: "var(--color-text)",
            marginBottom: "var(--space-2)",
            lineHeight: 1.15,
          }}>
            {book.title as string}
          </h1>

          {author && (
            <p style={{
              fontSize: "var(--text-lg)",
              color: "var(--color-text-muted)",
              marginBottom: "var(--space-6)",
            }}>
              {author}
            </p>
          )}

          {/* Meta */}
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "var(--space-4)",
            marginBottom: "var(--space-8)",
            paddingBottom: "var(--space-6)",
            borderBottom: "1px solid var(--color-border)",
          }}>
            {book.publisher && (
              <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>
                <span style={{ color: "var(--color-text-subtle)" }}>Verlag </span>
                {book.publisher as string}
              </span>
            )}
            {book.isbn13 && (
              <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>
                <span style={{ color: "var(--color-text-subtle)" }}>ISBN </span>
                {book.isbn13 as string}
              </span>
            )}
            {book.availability && (
              <span style={{
                fontSize: "var(--text-sm)",
                color: book.availability === "lieferbar" ? "#2d7a4f" : "var(--color-text-muted)",
              }}>
                {book.availability as string}
              </span>
            )}
            {book.price && (
              <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text)" }}>
                {book.price} €
              </span>
            )}
          </div>

          {/* Buy Links */}
          {book.isbn13 && affiliates.length > 0 && (
            <div style={{ marginBottom: "var(--space-8)" }}>
              <p style={{
                fontSize: "var(--text-xs)",
                color: "var(--color-text-subtle)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: "var(--space-3)",
              }}>
                Kaufen bei
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-3)" }}>
                {affiliates.map((aff: any) => (
                  <a
                    key={aff.slug}
                    href={buildAffiliateUrl(aff.link_template, book.isbn13 as string)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "var(--space-2)",
                      padding: "var(--space-2) var(--space-4)",
                      backgroundColor: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--radius)",
                      fontSize: "var(--text-sm)",
                      color: "var(--color-text)",
                      transition: "border-color 0.15s",
                    }}
                    className="buy-btn"
                  >
                    {aff.name}
                    <span style={{ color: "var(--color-text-subtle)" }}>↗</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {book.description && (
            <div>
              <p style={{
                fontSize: "var(--text-xs)",
                color: "var(--color-text-subtle)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: "var(--space-3)",
              }}>
                Beschreibung
              </p>
              <p style={{
                fontSize: "var(--text-base)",
                color: "var(--color-text-muted)",
                lineHeight: 1.75,
                maxWidth: "60ch",
              }}>
                {book.description as string}
              </p>
            </div>
          )}
        </div>
      </main>

      <style>{`
        .buy-btn:hover { border-color: var(--color-text-muted) !important; }
        @media (max-width: 640px) {
          .book-detail-layout {
            grid-template-columns: 1fr !important;
          }
          .book-detail-layout > div:first-child {
            max-width: 200px;
          }
        }
      `}</style>
    </div>
  );
}
