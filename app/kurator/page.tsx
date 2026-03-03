import Image from "next/image";
import { sql } from "@/lib/db";
import Link from "next/link";
import { BookCard } from "@/app/components/sections/FeaturedBooksSection";

const MY_CURATOR_SLUG = "timm-rohles-2";

async function getMyCurator() {
  const [curator] = await sql`
    SELECT id, name, slug, bio, avatar_url, focus, website_url, instagram_url, podcast_url
    FROM curators
    WHERE slug = ${MY_CURATOR_SLUG} AND deleted_at IS NULL
    LIMIT 1
  `;
  return curator ?? null;
}

async function getMyCurationBooks(curatorId: number) {
  const curationBooks = await sql`
    SELECT DISTINCT ON (b.id) b.id::text, b.title, b.author, b.cover_url
    FROM books b
    JOIN curation_books cb ON cb.book_id = b.id
    JOIN curations cu ON cu.id = cb.curation_id
    WHERE cu.curator_id = ${curatorId}
      AND cb.deleted_at IS NULL AND cu.deleted_at IS NULL AND b.deleted_at IS NULL
      AND (b.isbn13 LIKE '978%' OR b.isbn13 LIKE '979%')
      AND b.cover_url IS NOT NULL AND b.cover_url <> ''
    ORDER BY b.id, cb.sort_order LIMIT 24
  `;
  if (curationBooks.length > 0) return curationBooks;

  return sql`
    SELECT id::text, title, author, cover_url
    FROM books
    WHERE deleted_at IS NULL
      AND (isbn13 LIKE '978%' OR isbn13 LIKE '979%')
      AND cover_url IS NOT NULL AND cover_url <> ''
    ORDER BY total_score DESC LIMIT 24
  `;
}

async function getMyCurations(curatorId: number) {
  return sql`
    SELECT id, title, rationale, status
    FROM curations
    WHERE curator_id = ${curatorId} AND deleted_at IS NULL AND status = 'published'
    ORDER BY sort_order, created_at
  `;
}

function formatAuthor(raw: string | null) {
  if (!raw) return null;
  const parts = raw.split(",").map((s) => s.trim());
  return parts.length === 2 ? `${parts[1]} ${parts[0]}` : raw;
}

export const metadata = {
  title: "Kurator | The Backlist Club",
  description: "Meine persönlichen Buchempfehlungen – handverlesen, keine Algorithmen.",
};

export default async function KuratorPage() {
  const curator = await getMyCurator();

  if (!curator) {
    return (
      <div className="py-20 text-center">
        <p className="text-muted-foreground">Kurator-Profil nicht gefunden.</p>
      </div>
    );
  }

  const [books, curations] = await Promise.all([
    getMyCurationBooks(curator.id as number),
    getMyCurations(curator.id as number),
  ]);

  const avatarUrl = (curator.avatar_url as string | null)?.startsWith("http")
    ? (curator.avatar_url as string)
    : null;

  return (
    <>
      {/* Gradient banner */}
      <section className="bg-[linear-gradient(135deg,#214a57_0%,#2e6d7c_50%,#457870_100%)] pt-28 pb-10 px-6">
        <div className="max-w-6xl mx-auto">
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
      {(curator.bio || curator.website_url || curator.instagram_url || curator.podcast_url) && (
        <div className="max-w-6xl mx-auto px-6 pt-8 pb-2">
          {curator.bio && curator.bio !== "Lorem ipsum" && curator.bio !== "Mein Bücherstore" && (
            <p className="text-base text-muted-foreground leading-[1.75] max-w-[54ch] mb-4">
              {curator.bio as string}
            </p>
          )}
          <div className="flex gap-4 flex-wrap">
            {curator.website_url && !["www", "", null].includes(curator.website_url as string) && (
              <a href={curator.website_url as string} target="_blank" rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Website ↗
              </a>
            )}
            {curator.instagram_url && !["e", "", null].includes(curator.instagram_url as string) && (
              <a href={curator.instagram_url as string} target="_blank" rel="noopener noreferrer"
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
              Meine Listen
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

        <section>
          <p className="text-xs text-muted-foreground uppercase tracking-[0.12em] mb-6">
            {curations.length > 0 ? "Empfohlene Bücher" : "Aktuelle Empfehlungen"}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
            {books.map((book: any) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
