import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Datenschutz",
  description: "Datenschutzerklärung von The Backlist Club.",
};

export default function DatenschutzPage() {
  return (
    <main className="max-w-[42rem] mx-auto px-6 py-12 pb-20">
      <h1 className="font-serif text-3xl text-foreground mb-8">Datenschutzerklärung</h1>

      <div className="flex flex-col gap-6 text-base text-muted-foreground leading-[1.75]">
        <section>
          <h2 className="font-serif text-lg text-foreground mb-2">1. Verantwortlicher</h2>
          <p>Timm Rohles, info@coratiert.de</p>
        </section>

        <section>
          <h2 className="font-serif text-lg text-foreground mb-2">2. Erhobene Daten</h2>
          <p>
            Diese Website erhebt beim Besuch automatisch technische Zugriffsdaten
            (IP-Adresse, Uhrzeit, aufgerufene Seite) im Rahmen des Hostings durch
            Vercel (vercel.com). Diese Daten werden ausschließlich zur technischen
            Bereitstellung genutzt und nicht mit Dritten geteilt.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg text-foreground mb-2">3. Schriftarten</h2>
          <p>
            Diese Website verwendet ausschließlich selbst gehostete Schriftarten
            (Inter) sowie die Systemschriftart Georgia. Es werden keine externen
            Schriftdienste wie Google Fonts eingebunden – deine IP-Adresse wird
            dabei nicht an Dritte übertragen.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg text-foreground mb-2">4. Buchcover und externe Bilder</h2>
          <p>
            Buchcover werden von externen Servern (bilder.buecher.de) geladen.
            Beim Laden dieser Bilder wird deine IP-Adresse an den jeweiligen
            Server übertragen.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg text-foreground mb-2">5. Affiliate-Links</h2>
          <p>
            Diese Website enthält Affiliate-Links zu Thalia (thalia.de) und
            buecher.de. Wenn du auf diese Links klickst und einkaufst, erhalte ich
            eine Provision. Die Preise für dich ändern sich dadurch nicht.
            Mit dem Klick auf einen Affiliate-Link verlässt du diese Website und
            es gelten die Datenschutzbestimmungen des jeweiligen Anbieters.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg text-foreground mb-2">6. Deine Rechte</h2>
          <p>
            Du hast das Recht auf Auskunft, Berichtigung, Löschung und
            Einschränkung der Verarbeitung deiner Daten sowie das Recht auf
            Datenübertragbarkeit. Kontakt: info@coratiert.de
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg text-foreground mb-2">7. Hosting</h2>
          <p>
            Diese Website wird gehostet bei Vercel Inc., 340 Pine Street Suite 701,
            San Francisco, CA 94104, USA. Vercel ist nach EU-US Data Privacy Framework
            zertifiziert. Weitere Infos: vercel.com/legal/privacy-policy
          </p>
        </section>
      </div>
    </main>
  );
}
