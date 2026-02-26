import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Häufige Fragen zu The Backlist Club.",
};

const faqs = [
  {
    q: "Was ist The Backlist Club?",
    a: "The Backlist Club ist eine persönliche Buchempfehlungsplattform. Ich – Timm – teile hier Bücher die mich wirklich begeistert haben. Keine Algorithmen, keine Bestsellerlisten, nur echte Empfehlungen.",
  },
  {
    q: "Wie werden die Bücher ausgewählt?",
    a: "Jedes Buch auf dieser Seite wurde von mir persönlich gelesen und für empfehlenswert befunden. Die Auswahl basiert auf literarischer Qualität, Originalität und dem bleibenden Eindruck den das Buch hinterlässt.",
  },
  {
    q: "Was sind Affiliate-Links?",
    a: "Wenn du über einen Kauflink auf dieser Seite ein Buch kaufst, erhalte ich eine kleine Provision vom Buchhändler (Thalia oder buecher.de). Für dich entstehen dabei keine Mehrkosten – der Preis bleibt gleich.",
  },
  {
    q: "Warum heißt es 'Backlist'?",
    a: "In der Verlagswelt bezeichnet 'Backlist' Bücher die nicht neu erschienen sind, aber dauerhaft im Programm bleiben – weil sie gut sind. Genau diese Bücher wollen wir feiern: zeitlose Literatur abseits des Hype.",
  },
  {
    q: "Kann ich ein Buch vorschlagen?",
    a: "Ja! Schreib mir eine E-Mail an info@coratiert.de. Ich freue mich über Empfehlungen und lese alles – versprochen.",
  },
  {
    q: "Sind alle Bücher auf Deutsch?",
    a: "Die meisten Empfehlungen sind auf Deutsch oder in deutscher Übersetzung erhältlich. Gelegentlich empfehle ich auch englischsprachige Originale wenn sie besonders sind.",
  },
];

export default function FaqPage() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--color-background)" }}>
      <header style={{ borderBottom: "1px solid var(--color-border)", padding: "0 var(--space-6)" }}>
        <div style={{ maxWidth: "var(--max-width)", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: "56px" }}>
          <a href="/" style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", color: "var(--color-text)", letterSpacing: "-0.02em" }}>
            The Backlist Club
          </a>
          <nav style={{ display: "flex", gap: "var(--space-6)" }}>
            {[["Themen", "/themen"], ["Kuratoren", "/kuratoren"]].map(([label, href]) => (
              <a key={href} href={href} style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>{label}</a>
            ))}
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: "42rem", margin: "0 auto", padding: "var(--space-12) var(--space-6) var(--space-20)" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-3xl)", color: "var(--color-text)", marginBottom: "var(--space-8)" }}>
          Häufige Fragen
        </h1>

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
          {faqs.map((faq, i) => (
            <details key={i} style={{
              borderBottom: "1px solid var(--color-border)",
              padding: "var(--space-4) 0",
            }}>
              <summary style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-lg)",
                color: "var(--color-text)",
                cursor: "pointer",
                listStyle: "none",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                userSelect: "none",
              }}>
                {faq.q}
                <span style={{ color: "var(--color-text-subtle)", fontSize: "var(--text-xl)", fontFamily: "var(--font-body)", fontWeight: 300 }}>+</span>
              </summary>
              <p style={{
                marginTop: "var(--space-3)",
                fontSize: "var(--text-base)",
                color: "var(--color-text-muted)",
                lineHeight: 1.75,
              }}>
                {faq.a}
              </p>
            </details>
          ))}
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
