import Image from "next/image";
import { neon } from "@neondatabase/serverless";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

async function getBook(id: string) {
  const sql = neon(process.env.DATABASE_URL!);
  const [book] = await sql`
    SELECT id::text, title, author, publisher, cover_url,
      description, price::text, isbn13, language, availability, is_indie
    FROM books
    WHERE id = ${id}::integer AND deleted_at IS NULL
    LIMIT 1
  `;
  return book ?? null;
}

async function getAffiliates() {
  const sql = neon(process.env.DATABASE_URL!);
  return sql`
    SELECT name, slug, link_template
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

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const book = await getBook(id);
  if (!book) return { title: "Buch nicht gefunden" };
  const author = formatAuthor(book.author as string | null);
  const title = author ? `${book.title} – ${author}` : book.title as string;
  const description = book.description
    ? (book.description as string).slice(0, 160)
    : `${book.title} – Buchempfehlung auf The Backlist Club.`;
  return {
    title,
    description,
    openGraph: { title, description, images: book.cover_url ? [{ url: book.cover_url as string }] : [] },
  };
}

export default async function BookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [book, affiliates] = await Promise.all([getBook(id), getAffiliates()]);
  if (!book) notFound();

  const author = formatAuthor(book.author as string | null);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: book.title,
    author: author ? { "@type": "Person", name: author } : undefined,
    isbn: book.isbn13,
    publisher: book.publisher ? { "@type": "Organization", name: book.publisher } : undefined,
    image: book.cover_url ?? undefined,
    description: book.description ?? undefined,
    inLanguage: book.language ?? "de",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div style={{ maxWidth: "var(--max-width)", margin: "0 auto", padding: "var(--space-4) var(--space-6) 0" }}>
        <a href="/" style={{ fontSize: "var(--text-sm)", color: "var(--color-text-subtle)" }}>← Alle Bücher</a>
      </div>

      <main style={{
        maxWidth: "var(--max-width)", margin: "0 auto",
        padding: "var(--space-8) var(--space-6) var(--space-16)",
        display: "grid", gridTemplateColumns: "220px 1fr",
        gap: "var(--space-12)", alignItems: "start",
      }} className="book-detail-layout">

        <div style={{ position: "relative", aspectRatio: "2/3", borderRadius: "var(--radius)", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.12)" }}>
          {book.cover_url ? (
            <Image src={book.cover_url as string} alt={book.title as string} fill sizes="(max-width: 640px) 90vw, 220px" style={{ objectFit: "cover" }} priority />
          ) : (
            <div style={{ width: "100%", height: "100%", backgroundColor: "var(--color-border-muted)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "var(--color-text-subtle)", fontSize: "var(--text-sm)" }}>Kein Cover</span>
            </div>
          )}
        </div>

        <div>
          {book.is_indie && (
            <span style={{ display: "inline-block", fontSize: "var(--text-xs)", color: "var(--color-accent)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "var(--space-3)" }}>Indie</span>
          )}
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.5rem, 4vw, 2.25rem)", color: "var(--color-text)", marginBottom: "var(--space-2)", lineHeight: 1.15 }}>
            {book.title as string}
          </h1>
          {author && <p style={{ fontSize: "var(--text-lg)", color: "var(--color-text-muted)", marginBottom: "var(--space-6)" }}>{author}</p>}

          <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-4)", marginBottom: "var(--space-8)", paddingBottom: "var(--space-6)", borderBottom: "1px solid var(--color-border)" }}>
            {book.publisher && <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}><span style={{ color: "var(--color-text-subtle)" }}>Verlag </span>{book.publisher as string}</span>}
            {book.isbn13 && <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}><span style={{ color: "var(--color-text-subtle)" }}>ISBN </span>{book.isbn13 as string}</span>}
            {book.availability && <span style={{ fontSize: "var(--text-sm)", color: book.availability === "lieferbar" ? "#2d7a4f" : "var(--color-text-muted)" }}>{book.availability as string}</span>}
            {book.price && <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text)" }}>{book.price} €</span>}
          </div>

          {book.isbn13 && affiliates.length > 0 && (
            <div style={{ marginBottom: "var(--space-8)" }}>
              <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-subtle)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "var(--space-3)" }}>Kaufen bei</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-3)" }}>
                {affiliates.map((aff: any) => (
                  <a key={aff.slug} href={aff.link_template.replace("{isbn13}", book.isbn13 as string)} target="_blank" rel="noopener noreferrer"
                    style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-2)", padding: "var(--space-2) var(--space-4)", backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius)", fontSize: "var(--text-sm)", color: "var(--color-text)", transition: "border-color 0.15s" }}
                    className="buy-btn">
                    {aff.name} <span style={{ color: "var(--color-text-subtle)" }}>↗</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {book.description && (
            <div>
              <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-subtle)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "var(--space-3)" }}>Beschreibung</p>
              <p style={{ fontSize: "var(--text-base)", color: "var(--color-text-muted)", lineHeight: 1.75, maxWidth: "60ch" }}>{book.description as string}</p>
            </div>
          )}
        </div>
      </main>

      <style>{`
        .buy-btn:hover { border-color: var(--color-text-muted) !important; }
        @media (max-width: 640px) {
          .book-detail-layout { grid-template-columns: 1fr !important; }
          .book-detail-layout > div:first-child { max-width: 180px; }
        }
      `}</style>
    </>
  );
}
