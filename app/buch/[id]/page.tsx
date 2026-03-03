import Image from "next/image";
import { sql } from "@/lib/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

async function getBook(id: string) {
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

      <div className="max-w-6xl mx-auto px-6 pt-4">
        <a href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Alle Bücher
        </a>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-8 pb-16 grid grid-cols-1 sm:grid-cols-[220px_1fr] gap-12 items-start">
        {/* Cover */}
        <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-lg max-w-[220px]">
          {book.cover_url ? (
            <Image
              src={book.cover_url as string}
              alt={book.title as string}
              fill
              sizes="(max-width: 640px) 90vw, 220px"
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-sm text-muted-foreground">Kein Cover</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {book.is_indie && (
            <Badge variant="outline" className="text-primary border-primary/40 mb-3">
              Indie
            </Badge>
          )}
          <h1 className="font-serif text-[clamp(1.5rem,4vw,2.25rem)] text-foreground mb-2 leading-tight">
            {book.title as string}
          </h1>
          {author && (
            <p className="text-lg text-muted-foreground mb-6">{author}</p>
          )}

          <div className="flex flex-wrap gap-4 mb-8 pb-6 border-b border-border">
            {book.publisher && (
              <span className="text-sm text-muted-foreground">
                <span className="text-muted-foreground/60">Verlag </span>
                {book.publisher as string}
              </span>
            )}
            {book.isbn13 && (
              <span className="text-sm text-muted-foreground">
                <span className="text-muted-foreground/60">ISBN </span>
                {book.isbn13 as string}
              </span>
            )}
            {book.availability && (
              <span className={`text-sm ${book.availability === "lieferbar" ? "text-primary" : "text-muted-foreground"}`}>
                {book.availability as string}
              </span>
            )}
            {book.price && (
              <span className="text-sm text-foreground">{book.price} €</span>
            )}
          </div>

          {book.isbn13 && affiliates.length > 0 && (
            <div className="mb-8">
              <p className="text-xs text-muted-foreground uppercase tracking-[0.1em] mb-3">Kaufen bei</p>
              <div className="flex flex-wrap gap-3">
                {affiliates.map((aff: any) => (
                  <Button key={aff.slug} variant="outline" size="sm" asChild>
                    <a
                      href={aff.link_template.replace("{isbn13}", book.isbn13 as string)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {aff.name} <span className="text-muted-foreground ml-1">↗</span>
                    </a>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {book.description && (
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-[0.1em] mb-3">Beschreibung</p>
              <p className="text-base text-muted-foreground leading-[1.75] max-w-[60ch]">
                {book.description as string}
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
