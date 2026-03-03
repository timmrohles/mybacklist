export default function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-12 py-12 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-8 items-start">
        <div>
          <a href="/" className="font-serif text-xl text-foreground tracking-tight block mb-3">
            The Backlist Club
          </a>
          <p className="text-sm text-muted-foreground max-w-[32ch] leading-relaxed">
            Handverlesene Buchempfehlungen – keine Algorithmen, keine Bestsellerlisten.
          </p>
        </div>

        <nav className="flex flex-col gap-3 sm:text-right">
          {[
            ["Kurator", "/kurator"],
            ["Themen", "/themen"],
            ["Impressum", "/impressum"],
            ["Datenschutz", "/datenschutz"],
            ["FAQ", "/faq"],
          ].map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {label}
            </a>
          ))}
        </nav>
      </div>

      <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-border text-xs text-muted-foreground/60">
        © {new Date().getFullYear()} The Backlist Club · Affiliate-Links zu Thalia und buecher.de
      </div>
    </footer>
  );
}
