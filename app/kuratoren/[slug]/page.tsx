import Image from "next/image";
import { sql } from "@/lib/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { BookCard } from "@/app/components/sections/FeaturedBooksSection";

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
      {/* Gradient banner with curator identity */}
      <section className="bg-[linear-gradient(135deg,#214a57_0%,#2e6d7c_50%,#457870_100%)] pt-28 pb-10 px-6">
        <div className="max-w-6xl mx-auto">
          <Link
            href="/kuratoren"
            className="inline-block text-sm text-white/70 hover:text-white transition-colors mb-8"
          >
            ← Alle Kuratoren
          </Link>
          <div className="flex items-center gap-6">
            <div className="relative w-20 h-20 rounded-full shrink-0 overflow-hidden bg-white/20 shadow-md flex items-center justify-center">
              {avatarUrl ? (
                <Image src={avatarUrl} alt={curator.name as string} fill sizes="80px" className="object-cover" />
              ) : (
                <span className="font-serif text-3xl text-white/80">
                  {(curator.name as string).charAt(0)}
                </span>
              )}
            </div>
            <div>
              {curator.focus && (
                <p className="text-xs text-white/60 uppercase tracking-[0.1em] mb-1">
                  {curator.focus as string}
                </p>
              )}
              <h1 className="font-serif text-[clamp(1.5rem,4vw,2.25rem)] text-white leading-tight">
                {curator.name as string}
              </h1>
            </div>
          </div>
        </div>
      </section>

      {/* Bio + social */}
      {(curator.bio || validWebsite || validInstagram || curator.podcast_url) && (
        <div className="max-w-6xl mx-auto px-6 pt-8 pb-2">
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
      )}

      <main className="max-w-6xl mx-auto px-6 py-8 pb-20">
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
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
              {books.map((book: any) => (
                <BookCard key={book.id} book={book} />
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
