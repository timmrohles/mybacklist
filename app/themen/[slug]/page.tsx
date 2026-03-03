import Image from "next/image";
import { sql } from "@/lib/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import PageBanner from "@/app/components/sections/PageBanner";
import { BookCard } from "@/app/components/sections/FeaturedBooksSection";

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

  const bookCount = tag.book_count as number;
  const subtitle = [
    tag.description as string | null,
    bookCount > 0 ? `${bookCount.toLocaleString("de-DE")} Bücher` : null,
  ].filter(Boolean).join(" · ");

  return (
    <>
      <PageBanner
        eyebrow={tagTypeLabel[tag.tag_type as string] ?? (tag.tag_type as string)}
        title={tag.name as string}
        subtitle={subtitle || undefined}
        backHref="/themen"
        backLabel="← Alle Themen"
      />

      <main className="max-w-6xl mx-auto px-6 py-10 pb-20">
        {books.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-muted-foreground">Für dieses Thema sind noch keine Bücher verfügbar.</p>
            <Link href="/" className="inline-block mt-4 text-sm text-primary hover:underline">
              Zur Startseite
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
            {books.map((book: any) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
