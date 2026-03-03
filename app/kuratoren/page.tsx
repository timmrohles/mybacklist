import Image from "next/image";
import { sql } from "@/lib/db";
import type { Metadata } from "next";
import Link from "next/link";
import PageBanner from "@/app/components/sections/PageBanner";

export const metadata: Metadata = {
  title: "Kuratoren",
  description: "Echte Menschen mit echten Leseempfehlungen – die Kuratoren von The Backlist Club.",
};

async function getCurators() {
  return sql`
    SELECT id, name, slug, bio, avatar_url, focus
    FROM curators
    WHERE deleted_at IS NULL AND visible = true
    ORDER BY display_order, name
  `;
}

export default async function KuratorenPage() {
  const curators = await getCurators();

  return (
    <>
      <PageBanner
        eyebrow="Menschen hinter den Empfehlungen"
        title="Unsere Kuratoren"
        subtitle="Echte Menschen mit echten Leseempfehlungen – keine Algorithmen."
      />

      <main className="max-w-6xl mx-auto px-6 py-12 pb-20 grid gap-6 [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))] items-start">
        {curators.map((c: any) => {
          const avatarUrl = (c.avatar_url as string)?.startsWith("http") ? (c.avatar_url as string) : null;
          return (
            <Link
              key={c.id}
              href={`/kuratoren/${c.slug}`}
              className="block bg-card border border-border rounded-lg p-6 hover:border-muted-foreground transition-colors"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="relative w-14 h-14 rounded-full shrink-0 bg-muted overflow-hidden flex items-center justify-center">
                  {avatarUrl ? (
                    <Image src={avatarUrl} alt={c.name} fill sizes="56px" className="object-cover" />
                  ) : (
                    <span className="font-serif text-xl text-muted-foreground">
                      {(c.name as string).charAt(0)}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-serif text-lg text-foreground mb-0.5">{c.name as string}</p>
                  {c.focus && (
                    <p className="text-xs text-primary uppercase tracking-[0.08em]">{c.focus as string}</p>
                  )}
                </div>
              </div>
              {c.bio && (
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                  {c.bio as string}
                </p>
              )}
            </Link>
          );
        })}
      </main>
    </>
  );
}
