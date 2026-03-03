import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Impressum",
  description: "Impressum von The Backlist Club.",
};

export default function ImpressumPage() {
  return (
    <main className="max-w-[42rem] mx-auto px-6 py-12 pb-20">
      <h1 className="font-serif text-3xl text-foreground mb-8">Impressum</h1>

      <div className="flex flex-col gap-6 text-base text-muted-foreground leading-[1.75]">
        <section>
          <h2 className="font-serif text-lg text-foreground mb-2">Angaben gemäß § 5 TMG</h2>
          <p>
            Timm Rohles<br />
            [Straße und Hausnummer]<br />
            [PLZ] [Stadt]<br />
            Deutschland
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg text-foreground mb-2">Kontakt</h2>
          <p>E-Mail: info@coratiert.de</p>
        </section>

        <section>
          <h2 className="font-serif text-lg text-foreground mb-2">Hinweis zu Affiliate-Links</h2>
          <p>
            Diese Website enthält Affiliate-Links zu Thalia und buecher.de.
            Beim Kauf über diese Links erhalte ich eine kleine Provision –
            für dich entstehen keine Mehrkosten.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg text-foreground mb-2">Haftung für Inhalte</h2>
          <p>
            Als Diensteanbieter bin ich gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten
            nach den allgemeinen Gesetzen verantwortlich. Buchbeschreibungen und Coverdaten
            stammen aus Verlagsdaten und werden ohne Gewähr angezeigt.
          </p>
        </section>
      </div>
    </main>
  );
}
