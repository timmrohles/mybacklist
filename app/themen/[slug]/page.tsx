import Image from "next/image";
import { sql } from "@/lib/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

async function getTag(slug: string) {
  const [tag] = await sql`
    SELECT t.id, t.name, t.slug, t.tag_type, t.description,
           COUNT(bt.book_id)::int AS book_count
    FROM tags t
    LEFT JOIN book_tags bt ON bt.tag_id = t.id AND bt.deleted_at IS NULL
    WHERE t.slug = ${slug} AND t.deleted_at IS NULL
    GROUP BY t.id LIMIT 1
  `;
  return tag ?? null;
}

async function getBooksByTag(tagId: number) {
  return sql`
    SELECT b.id::text, b.title, b.author, b.cover_url
    FROM books b JOIN book_tags bt ON bt.book_id = b.id
    WHERE bt.tag_id = ${tagId} AND bt.deleted_at IS NULL
      AND b.deleted_at IS NULL
      AND (b.isbn13 LIKE '978%' OR b.isbn13 LIKE '979%')
      AND b.cover_url IS NOT NULL AND b.cover_url <> ''
    ORDER BY b.total_score DESC LIMIT 48
  `;
}

function formatAuthor(raw: string | null) {
  if (!raw) return null;
  const parts = raw.split(",").map((s) => s.trim());
  return parts.length === 2 ? `${parts[1]} ${parts[0]}` : raw;
}

const tagTypeLabel: Record<string, string> = {
  topic: "Thema", genre: "Genre", audience: "Zielgruppe",
  feature: "Ausstattung", award_genre: "Preis-Genre",
  award_type: "Preisart", publisher_cluster: "Verlagsgruppe",
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const tag = await getTag(slug);
  if (!tag) return { title: "Thema nicht gefunden" };
  const title = `${tag.name} – Buchempfehlungen`;
  const count = tag.book_count as number;
  return {
    title,
    description: count > 0
      ? `${count.toLocaleString("de-DE")} Bücher zum Thema ${tag.name}.`
      : `Buchempfehlungen zum Thema ${tag.name}.`,
  };
}

export default async function TagPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tag = await getTag(slug);
  if (!tag) notFound();
  const books = await getBooksByTag(tag.id as number);

  return (
    <>
      <div className="max-w-6xl mx-auto px-6 pt-4">
        <a href="/themen" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Alle Themen
        </a>
      </div>

      <section className="max-w-6xl mx-auto px-6 py-8 pb-10">
        <p className="text-xs text-muted-foreground uppercase tracking-[0.12em] mb-3">
          {tagTypeLabel[tag.tag_type as string] ?? (tag.tag_type as string)}
        </p>
        <h1 className="font-serif text-[clamp(1.75rem,4vw,2.5rem)] text-foreground mb-3">
          {tag.name as string}
        </h1>
        {tag.description && (
          <p className="text-lg text-muted-foreground max-w-[42rem] leading-[1.65] mb-3">
            {tag.description as string}
          </p>
        )}
        <p className="text-sm text-muted-foreground">
          {(tag.book_count as number) > 0
            ? `${(tag.book_count as number).toLocaleString("de-DE")} Bücher`
            : "Noch keine Bücher zugeordnet"}
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-20">
        {books.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-muted-foreground">Für dieses Thema sind noch keine Bücher verfügbar.</p>
            <a href="/" className="inline-block mt-4 text-sm text-primary hover:underline">
              Zur Startseite
            </a>
          </div>
        ) : (
          <div className="grid gap-6 [grid-template-columns:repeat(auto-fill,minmax(130px,1fr))]">
            {books.map((book: any) => (
              <a key={book.id} href={`/buch/${book.id}`} className="block group">
                <div className="relative aspect-[2/3] bg-muted rounded-lg overflow-hidden mb-2 shadow-sm">
                  <Image
                    src={book.cover_url}
                    alt={book.title}
                    fill
                    sizes="(max-width: 640px) 45vw, 160px"
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
        )}
      </section>
    </>
  );
}
