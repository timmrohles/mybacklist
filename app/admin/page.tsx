import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

async function getStats() {
  try {
    const [books] = await sql`SELECT COUNT(*)::int FROM books WHERE deleted_at IS NULL AND (isbn13 LIKE '978%' OR isbn13 LIKE '979%')`;
    const [tags] = await sql`SELECT COUNT(*)::int FROM tags WHERE deleted_at IS NULL`;
    const [affiliates] = await sql`SELECT COUNT(*)::int FROM affiliates WHERE deleted_at IS NULL AND is_active = true`;
    const [curators] = await sql`SELECT COUNT(*)::int FROM curators WHERE deleted_at IS NULL AND visible = true`;
    return { books: books.count, tags: tags.count, affiliates: affiliates.count, curators: curators.count };
  } catch {
    return { books: 0, tags: 0, affiliates: 0, curators: 0 };
  }
}

export default async function AdminPage() {
  const stats = await getStats();

  const cards = [
    { label: "Bücher (gesamt)", value: Number(stats.books).toLocaleString("de-DE"), href: "/admin/buecher" },
    { label: "Tags", value: stats.tags, href: "/admin/tags" },
    { label: "Affiliates", value: stats.affiliates, href: "/admin/affiliates" },
    { label: "Sichtbare Kuratoren", value: stats.curators, href: "/admin/kuratoren" },
  ];

  const links = [
    ["Bücher verwalten", "/admin/buecher"],
    ["Affiliates verwalten", "/admin/affiliates"],
    ["Tags verwalten", "/admin/tags"],
    ["Kuratoren verwalten", "/admin/kuratoren"],
    ["→ Zur Website", "/"],
  ];

  return (
    <div className="min-h-screen bg-background py-8 px-6">
      <div className="max-w-[960px] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-serif text-2xl text-foreground">Admin Dashboard</h1>
          <a href="/api/admin/logout" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Abmelden
          </a>
        </div>

        <div className="grid [grid-template-columns:repeat(auto-fill,minmax(160px,1fr))] gap-4 mb-8">
          {cards.map((card) => (
            <a key={card.label} href={card.href} className="block bg-card border border-border rounded-lg p-4 hover:border-primary/40 transition-colors">
              <p className="font-serif text-2xl text-foreground mb-1">{card.value}</p>
              <p className="text-xs text-muted-foreground">{card.label}</p>
            </a>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          {links.map(([label, href]) => (
            <a key={href} href={href} className="block px-6 py-4 bg-card border border-border rounded-lg text-base text-foreground hover:border-primary/40 transition-colors">
              {label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
