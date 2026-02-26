import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Impressum",
  description: "Impressum von The Backlist Club.",
};

export default function ImpressumPage() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--color-background)" }}>
      <header style={{ borderBottom: "1px solid var(--color-border)", padding: "0 var(--space-6)" }}>
        <div style={{ maxWidth: "var(--max-width)", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: "56px" }}>
          <a href="/" style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", color: "var(--color-text)", letterSpacing: "-0.02em" }}>
            The Backlist Club
          </a>
        </div>
      </header>

      <main style={{ maxWidth: "42rem", margin: "0 auto", padding: "var(--space-12) var(--space-6) var(--space-20)" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-3xl)", color: "var(--color-text)", marginBottom: "var(--space-8)" }}>
          Impressum
        </h1>

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)", color: "var(--color-text-muted)", fontSize: "var(--text-base)", lineHeight: 1.75 }}>
          <section>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-lg)", color: "var(--color-text)", marginBottom: "var(--space-2)" }}>
              Angaben gemäß § 5 TMG
            </h2>
            <p>Timm Rohles<br />
            {/* BITTE AUSFÜLLEN: Straße, PLZ, Stadt */}
            [Straße und Hausnummer]<br />
            [PLZ] [Stadt]<br />
            Deutschland</p>
          </section>

          <section>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-lg)", color: "var(--color-text)", marginBottom: "var(--space-2)" }}>
              Kontakt
            </h2>
            <p>E-Mail: info@coratiert.de</p>
          </section>

          <section>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-lg)", color: "var(--color-text)", marginBottom: "var(--space-2)" }}>
              Hinweis zu Affiliate-Links
            </h2>
            <p>
              Diese Website enthält Affiliate-Links zu Thalia und buecher.de.
              Beim Kauf über diese Links erhalte ich eine kleine Provision –
              für dich entstehen keine Mehrkosten.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-lg)", color: "var(--color-text)", marginBottom: "var(--space-2)" }}>
              Haftung für Inhalte
            </h2>
            <p>
              Als Diensteanbieter bin ich gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten
              nach den allgemeinen Gesetzen verantwortlich. Buchbeschreibungen und Coverdaten
              stammen aus Verlagsdaten und werden ohne Gewähr angezeigt.
            </p>
          </section>
        </div>
      </main>

      <footer style={{ borderTop: "1px solid var(--color-border)", padding: "var(--space-6)", textAlign: "center" }}>
        <nav style={{ display: "flex", justifyContent: "center", gap: "var(--space-6)" }}>
          {[["Impressum", "/impressum"], ["Datenschutz", "/datenschutz"], ["FAQ", "/faq"]].map(([label, href]) => (
            <a key={href} href={href} style={{ fontSize: "var(--text-sm)", color: "var(--color-text-subtle)" }}>{label}</a>
          ))}
        </nav>
      </footer>
    </div>
  );
}
