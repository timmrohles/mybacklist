import Link from "next/link";

export type Tag = {
  id: string | number;
  name: string;
  slug: string;
  color: string | null;
  book_count: number;
};

export default function ThemesSection({ tags }: { tags: Tag[] }) {
  return (
    <section className="bg-stone-50 py-16">
      <div className="max-w-6xl mx-auto px-6">
        <p className="text-xs text-muted-foreground uppercase tracking-[0.12em] mb-2">Stöbern</p>
        <h2 className="font-serif text-[clamp(1.5rem,3vw,2rem)] text-foreground mb-8">
          Bücher nach Thema
        </h2>
        <div className="flex flex-wrap gap-2 mb-6">
          {tags.map((tag) => (
            <Link
              key={String(tag.id)}
              href={`/themen/${tag.slug}`}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-opacity hover:opacity-80 ${
                !tag.color ? "bg-card border border-border text-foreground" : ""
              }`}
              style={tag.color ? { backgroundColor: tag.color, color: "#fff" } : undefined}
            >
              {tag.name}
            </Link>
          ))}
        </div>
        <Link href="/themen" className="text-sm text-primary hover:underline underline-offset-4">
          Alle Themen entdecken →
        </Link>
      </div>
    </section>
  );
}
