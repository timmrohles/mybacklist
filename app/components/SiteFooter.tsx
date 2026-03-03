export default function SiteFooter() {
  return (
    <footer className="border-t border-border py-8 px-6 mt-auto">
      <div className="max-w-6xl mx-auto flex flex-wrap justify-between items-center gap-4">
        <span className="text-sm text-muted-foreground/60">
          © {new Date().getFullYear()} The Backlist Club
        </span>
        <nav className="flex gap-6 flex-wrap">
          {[
            ["Kurator", "/kurator"],
            ["Impressum", "/impressum"],
            ["Datenschutz", "/datenschutz"],
            ["FAQ", "/faq"],
          ].map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="text-sm text-muted-foreground/60 hover:text-foreground transition-colors"
            >
              {label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
