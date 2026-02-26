import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Datenschutz",
  description: "Datenschutzerklärung von The Backlist Club.",
};

export default function DatenschutzPage() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--color-background)" }}>
      <header style={{ borderBottom: "1px solid var(--color-border)", padding: "0 var(--space-6)" }}>
        <div style={{ maxWidth: "var(--max-width)", margin: "0 auto", display: "flex", alignItems: "center", height: "56px" }}>
          <a href="/" style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", color: "var(--color-text)", letterSpacing: "-0.02em" }}>
            The Backlist Club
          </a>
        </div>
      </header>

      <main style={{ maxWidth: "42rem", margin: "0 auto", padding: "var(--space-12) var(--space-6) var(--space-20)" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-3xl)", color: "var(--color-text)", marginBottom: "var(--space-8)" }}>
          Datenschutzerklärung
        </h1>

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)", color: "var(--color-text-muted)", fontSize: "var(--text-base)", lineHeight: 1.75 }}>

          <section>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-lg)", color: "var(--color-text)", marginBottom: "var(--space-2)" }}>
              1. Verantwortlicher
            </h2>
            <p>Timm Rohles, info@coratiert.de</p>
          </section>

          <section>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-lg)", color: "var(--color-text)", marginBottom: "var(--space-2)" }}>
              2. Erhobene Daten
            </h2>
            <p>
              Diese Website erhebt beim Besuch automatisch technische Zugriffsdaten
              (IP-Adresse, Uhrzeit, aufgerufene Seite) im Rahmen des Hostings durch
              Vercel (vercel.com). Diese Daten werden ausschließlich zur technischen
              Bereitstellung genutzt und nicht mit Dritten geteilt.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-lg)", color: "var(--color-text)", marginBottom: "var(--space-2)" }}>
              3. Schriftarten
            </h2>
            <p>
              Diese Website verwendet ausschließlich selbst gehostete Schriftarten
              (Fjalla One, Inter). Es werden keine externen Schriftdienste wie
              Google Fonts eingebunden – deine IP-Adresse wird dabei nicht an Dritte übertragen.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-lg)", color: "var(--color-text)", marginBottom: "var(--space-2)" }}>
              4. Buchcover und externe Bilder
            </h2>
            <p>
              Buchcover werden von externen Servern (bilder.buecher.de) geladen.
              Beim Laden dieser Bilder wird deine IP-Adresse an den jeweiligen
              Server übertragen.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-lg)", color: "var(--color-text)", marginBottom: "var(--space-2)" }}>
              5. Affiliate-Links
            </h2>
            <p>
              Diese Website enthält Affiliate-Links zu Thalia (thalia.de) und
              buecher.de. Wenn du auf diese Links klickst und einkaufst, erhalte ich
              eine Provision. Die Preise für dich ändern sich dadurch nicht.
              Mit dem Klick auf einen Affiliate-Link verlässt du diese Website und
              es gelten die Datenschutzbestimmungen des jeweiligen Anbieters.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-lg)", color: "var(--color-text)", marginBottom: "var(--space-2)" }}>
              6. Deine Rechte
            </h2>
            <p>
              Du hast das Recht auf Auskunft, Berichtigung, Löschung und
              Einschränkung der Verarbeitung deiner Daten sowie das Recht auf
              Datenübertragbarkeit. Kontakt: info@coratiert.de
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-lg)", color: "var(--color-text)", marginBottom: "var(--space-2)" }}>
              7. Hosting
            </h2>
            <p>
              Diese Website wird gehostet bei Vercel Inc., 340 Pine Street Suite 701,
              San Francisco, CA 94104, USA. Vercel ist nach EU-US Data Privacy Framework
              zertifiziert. Weitere Infos: vercel.com/legal/privacy-policy
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
