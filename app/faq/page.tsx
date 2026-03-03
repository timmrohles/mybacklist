import type { Metadata } from "next";
import PageBanner from "@/app/components/sections/PageBanner";

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
    <>
      <PageBanner title="Häufige Fragen" />

      <main className="max-w-[42rem] mx-auto px-6 py-12 pb-20">
        <div className="flex flex-col gap-1">
          {faqs.map((faq, i) => (
            <details key={i} className="border-b border-border py-4 group">
              <summary className="font-serif text-lg text-foreground cursor-pointer list-none flex justify-between items-center select-none">
                {faq.q}
                <span className="text-muted-foreground text-xl font-light ml-4 shrink-0">+</span>
              </summary>
              <p className="mt-3 text-base text-muted-foreground leading-[1.75]">{faq.a}</p>
            </details>
          ))}
        </div>
      </main>
    </>
  );
}
