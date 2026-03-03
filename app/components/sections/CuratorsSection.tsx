import Image from "next/image";
import Link from "next/link";

export type Curator = {
  id: string | number;
  name: string;
  slug: string;
  bio: string | null;
  avatar_url: string | null;
  focus: string | null;
};

export function CuratorCard({ curator }: { curator: Curator }) {
  const avatarUrl =
    typeof curator.avatar_url === "string" && curator.avatar_url.startsWith("http")
      ? curator.avatar_url
      : null;

  return (
    <Link
      href={`/kuratoren/${curator.slug}`}
      className="flex flex-col bg-card border border-border rounded-lg p-6 hover:border-muted-foreground transition-colors shrink-0 w-72 md:w-auto"
    >
      <div className="flex items-center gap-4 mb-3">
        <div className="relative w-12 h-12 rounded-full shrink-0 bg-muted overflow-hidden flex items-center justify-center">
          {avatarUrl ? (
            <Image src={avatarUrl} alt={curator.name} fill sizes="48px" className="object-cover" />
          ) : (
            <span className="font-serif text-lg text-muted-foreground">
              {curator.name.charAt(0)}
            </span>
          )}
        </div>
        <div>
          <p className="font-serif text-base text-foreground leading-tight">{curator.name}</p>
          {curator.focus && (
            <p className="text-xs text-primary uppercase tracking-[0.08em] mt-0.5">
              {curator.focus}
            </p>
          )}
        </div>
      </div>
      {curator.bio && (
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{curator.bio}</p>
      )}
    </Link>
  );
}

export default function CuratorsSection({ curators }: { curators: Curator[] }) {
  return (
    <section className="py-16 bg-secondary/50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-baseline justify-between mb-8">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-[0.12em] mb-2">
              Menschen hinter den Empfehlungen
            </p>
            <h2 className="font-serif text-[clamp(1.5rem,3vw,2rem)] text-foreground">
              Unsere Kuratoren
            </h2>
          </div>
          <Link
            href="/kuratoren"
            className="text-sm text-primary hover:underline underline-offset-4 shrink-0 ml-8"
          >
            Alle Kuratoren →
          </Link>
        </div>
        {/* Mobile: horizontal scroll; md+: grid */}
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 md:mx-0 md:px-0 md:grid md:grid-cols-3 md:overflow-visible md:pb-0">
          {curators.map((curator) => (
            <CuratorCard key={String(curator.id)} curator={curator} />
          ))}
        </div>
      </div>
    </section>
  );
}
