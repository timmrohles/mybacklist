import { cn } from "@/lib/utils";

type ActivePage = "themen" | "kuratoren" | null;

export default function SiteHeader({ active }: { active?: ActivePage }) {
  return (
    <header className="border-b border-border px-6">
      <div className="max-w-6xl mx-auto flex items-center justify-between h-14">
        <a href="/" className="font-serif text-xl text-foreground tracking-tight">
          The Backlist Club
        </a>
        <nav className="flex gap-6">
          {([["Themen", "/themen", "themen"], ["Kuratoren", "/kuratoren", "kuratoren"]] as const).map(
            ([label, href, key]) => (
              <a
                key={href}
                href={href}
                className={cn(
                  "text-sm transition-colors",
                  active === key ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {label}
              </a>
            )
          )}
        </nav>
      </div>
    </header>
  );
}
