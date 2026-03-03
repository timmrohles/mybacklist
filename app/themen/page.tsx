import { sql } from "@/lib/db";
import type { Metadata } from "next";
import Link from "next/link";
import PageBanner from "@/app/components/sections/PageBanner";

export const metadata: Metadata = {
  title: "Themen",
  description: "Bücher nach Themen entdecken – kuratierte Buchempfehlungen auf The Backlist Club.",
};

async function getTags() {
  return sql`
    SELECT t.id, t.name, t.slug, t.tag_type, COUNT(bt.book_id)::int AS book_count
    FROM tags t
    LEFT JOIN book_tags bt ON bt.tag_id = t.id AND bt.deleted_at IS NULL
    WHERE t.deleted_at IS NULL AND t.visible = true
    GROUP BY t.id ORDER BY book_count DESC, t.name
  `;
}

const tagTypeLabel: Record<string, string> = {
  topic: "Themen", genre: "Genres", audience: "Für wen?",
  feature: "Ausstattung", award_genre: "Preis-Genres",
  award_type: "Preise", publisher_cluster: "Verlagsgruppen",
};

const order = ["topic", "genre", "audience", "publisher_cluster", "feature", "award_genre", "award_type"];

export default async function ThemenPage() {
  const tags = await getTags();
  const grouped = tags.reduce<Record<string, typeof tags>>((acc, tag) => {
    const type = (tag.tag_type as string) ?? "sonstige";
    if (!acc[type]) acc[type] = [];
    acc[type].push(tag);
    return acc;
  }, {});
  const sortedGroups = order.filter((t) => grouped[t]?.length > 0);

  return (
    <>
      <PageBanner
        eyebrow="Entdecken"
        title="Bücher nach Thema"
        subtitle="Stöbere durch unsere kuratierten Themen und entdecke Bücher die zu dir passen."
      />

      <main className="max-w-6xl mx-auto px-6 py-12 pb-20 flex flex-col gap-12">
        {sortedGroups.map((type) => (
          <section key={type}>
            <h2 className="text-xs text-muted-foreground uppercase tracking-[0.12em] mb-4">
              {tagTypeLabel[type] ?? type}
            </h2>
            <div className="flex flex-wrap gap-2">
              {grouped[type].map((tag: any) => (
                <Link
                  key={tag.id}
                  href={`/themen/${tag.slug}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm text-foreground hover:border-muted-foreground hover:text-primary transition-colors"
                >
                  {tag.name as string}
                  {(tag.book_count as number) > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {(tag.book_count as number).toLocaleString("de-DE")}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </section>
        ))}
      </main>
    </>
  );
}
