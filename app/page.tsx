import Image from "next/image";
import { sql } from "@/lib/db";

async function getFeaturedBooks() {
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
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-12">
        <p className="text-xs text-muted-foreground uppercase tracking-[0.12em] mb-4">
          Persönliche Buchempfehlungen
        </p>
        <h1 className="font-serif text-[clamp(2rem,5vw,3rem)] text-foreground max-w-[32rem] mb-4">
          Bücher die wirklich bleiben.
        </h1>
        <p className="text-lg text-muted-foreground max-w-[38rem] leading-[1.65]">
          Handverlesene Empfehlungen – keine Algorithmen, keine Bestsellerlisten.
          Nur Bücher die ich selbst gelesen und geliebt habe.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-20">
        <p className="text-xs text-muted-foreground uppercase tracking-[0.12em] mb-8">
          Aktuelle Empfehlungen
        </p>
        <div className="grid gap-6 [grid-template-columns:repeat(auto-fill,minmax(130px,1fr))]">
          {books.map((book: any) => (
            <a key={book.id} href={`/buch/${book.id}`} className="block group">
              <div className="relative aspect-[2/3] bg-muted rounded-lg overflow-hidden mb-2 shadow-sm">
                <Image
                  src={book.cover_url}
                  alt={book.title}
                  fill
                  sizes="(max-width: 480px) 42vw, (max-width: 1024px) 20vw, 160px"
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                />
              </div>
              <p className="text-xs font-medium text-foreground leading-snug mb-1 line-clamp-2">
                {book.title}
              </p>
              {book.author && (
                <p className="text-xs text-muted-foreground">{formatAuthor(book.author)}</p>
              )}
            </a>
          ))}
        </div>
      </section>

      <div className="text-center py-8 px-6 border-t border-border/50">
        <a href="/admin" className="text-xs text-muted-foreground/40 hover:text-muted-foreground transition-colors">
          Admin
        </a>
      </div>
    </>
  );
}
