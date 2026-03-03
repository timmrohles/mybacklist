import Image from "next/image";
import { sql } from "@/lib/db";

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
      <section className="max-w-6xl mx-auto px-6 py-12 pb-10 grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-8 items-start">
        <div className="relative w-28 h-28 rounded-full bg-muted overflow-hidden shrink-0 shadow-md flex items-center justify-center">
          {avatarUrl ? (
            <Image src={avatarUrl} alt={curator.name as string} fill sizes="120px" className="object-cover" />
          ) : (
            <span className="font-serif text-5xl text-muted-foreground">
              {(curator.name as string).charAt(0)}
            </span>
          )}
        </div>

        <div>
          {curator.focus && (
            <p className="text-xs text-primary uppercase tracking-[0.1em] mb-2">
              {curator.focus as string}
            </p>
          )}
          <h1 className="font-serif text-[clamp(1.75rem,4vw,2.5rem)] text-foreground mb-3">
            {curator.name as string}
          </h1>
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
      </section>

      <main className="max-w-6xl mx-auto px-6 pb-20">
        {curations.length > 0 && (
          <section className="mb-12">
            <p className="text-xs text-muted-foreground uppercase tracking-[0.12em] mb-6">
              Meine Listen
            </p>
            <div className="flex flex-col gap-3">
              {curations.map((c: any) => (
                <div key={c.id} className="px-6 py-4 bg-card border border-border rounded-lg">
                  <p className="font-serif text-lg text-foreground">
                    {c.title as string}
                  </p>
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
          <div className="grid gap-6 [grid-template-columns:repeat(auto-fill,minmax(140px,1fr))]">
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
      </main>
    </>
  );
}
