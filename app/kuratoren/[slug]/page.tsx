import Image from "next/image";
import { sql } from "@/lib/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

async function getCurator(slug: string) {
  const [c] = await sql`
    SELECT id, name, slug, bio, avatar_url, focus, website_url, instagram_url, podcast_url
    FROM curators WHERE slug = ${slug} AND deleted_at IS NULL AND visible = true LIMIT 1
  `;
  return c ?? null;
}

async function getCurations(curatorId: number) {
  return sql`
    SELECT c.id, c.title, c.rationale
    FROM curations c
    WHERE c.curator_id = ${curatorId} AND c.deleted_at IS NULL AND c.status = 'published'
    ORDER BY c.sort_order, c.created_at
  `;
}

async function getCurationBooks(curatorId: number) {
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

  const avatarUrl = (curator.avatar_url as string)?.startsWith("http") ? (curator.avatar_url as string) : null;
  const validWebsite = curator.website_url && !["www", ""].includes(curator.website_url as string)
    ? (curator.website_url as string) : null;
  const validInstagram = curator.instagram_url && !["e", ""].includes(curator.instagram_url as string)
    ? (curator.instagram_url as string) : null;

  return (
    <>
      <div className="max-w-6xl mx-auto px-6 pt-4">
        <a href="/kuratoren" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Alle Kuratoren
        </a>
      </div>

      <section className="max-w-6xl mx-auto px-6 py-8 pb-10 grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-8 items-start">
        <div className="relative w-24 h-24 rounded-full bg-muted overflow-hidden shrink-0 shadow-md flex items-center justify-center">
          {avatarUrl ? (
            <Image src={avatarUrl} alt={curator.name as string} fill sizes="100px" className="object-cover" />
          ) : (
            <span className="font-serif text-4xl text-muted-foreground">
              {(curator.name as string).charAt(0)}
            </span>
          )}
        </div>
        <div>
          {curator.focus && (
            <p className="text-xs text-primary uppercase tracking-[0.1em] mb-2">{curator.focus as string}</p>
          )}
          <h1 className="font-serif text-[clamp(1.5rem,4vw,2.25rem)] text-foreground mb-3">
            {curator.name as string}
          </h1>
          {curator.bio && (
            <p className="text-base text-muted-foreground leading-[1.7] max-w-[52ch] mb-4">
              {curator.bio as string}
            </p>
          )}
          <div className="flex gap-4 flex-wrap">
            {validWebsite && (
              <a href={validWebsite} target="_blank" rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Website ↗
              </a>
            )}
            {validInstagram && (
              <a href={validInstagram} target="_blank" rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Instagram ↗
              </a>
            )}
            {curator.podcast_url && (
              <a href={curator.podcast_url as string} target="_blank" rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Podcast ↗
              </a>
            )}
          </div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-6 pb-20">
        {curations.length > 0 && (
          <section className="mb-12">
            <p className="text-xs text-muted-foreground uppercase tracking-[0.12em] mb-6">
              Buchempfehlungen
            </p>
            <div className="flex flex-col gap-3">
              {curations.map((c: any) => (
                <div key={c.id} className="px-6 py-4 bg-card border border-border rounded-lg">
                  <p className="font-serif text-lg text-foreground">{c.title as string}</p>
                  {c.rationale && (
                    <p className="text-sm text-muted-foreground mt-1">{c.rationale as string}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {books.length > 0 && (
          <section>
            <p className="text-xs text-muted-foreground uppercase tracking-[0.12em] mb-6">
              Empfohlene Bücher
            </p>
            <div className="grid gap-6 [grid-template-columns:repeat(auto-fill,minmax(130px,1fr))]">
              {books.map((book: any) => (
                <a key={book.id} href={`/buch/${book.id}`} className="block group">
                  <div className="relative aspect-[2/3] bg-muted rounded-lg overflow-hidden mb-2 shadow-sm">
                    <Image
                      src={book.cover_url}
                      alt={book.title}
                      fill
                      sizes="160px"
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
        )}

        {curations.length === 0 && books.length === 0 && (
          <p className="text-muted-foreground pt-8">Noch keine Empfehlungen vorhanden.</p>
        )}
      </main>
    </>
  );
}
