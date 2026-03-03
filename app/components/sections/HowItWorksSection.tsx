import { Users, BookOpen, ShoppingBag } from "lucide-react";

const steps = [
  {
    icon: Users,
    title: "Kurator entdecken",
    description:
      "Wähle einen Kurator dem du vertraust – echte Menschen mit persönlichem Geschmack statt Algorithmen.",
  },
  {
    icon: BookOpen,
    title: "Buch finden",
    description:
      "Stöbere durch handverlesene Empfehlungen und entdecke dein nächstes Lieblingsbuch.",
  },
  {
    icon: ShoppingBag,
    title: "Kaufen & unterstützen",
    description:
      "Kaufe bei Thalia oder bücher.de – der Kurator erhält einen fairen Teil der Affiliate-Provision.",
  },
];

export default function HowItWorksSection() {
  return (
    <section className="py-16 bg-[#f5f0e8]">
      <div className="max-w-6xl mx-auto px-6">
        <p className="text-xs text-foreground/50 uppercase tracking-[0.12em] mb-2">
          So funktioniert's
        </p>
        <h2 className="text-[clamp(1.5rem,3vw,2rem)] text-foreground mb-12 font-bold">
          Bücher finden. Bücher teilen.
        </h2>
        <div className="grid gap-10 md:grid-cols-3">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-foreground/40 font-mono tabular-nums">
                    0{i + 1}
                  </span>
                  <Icon className="w-5 h-5 text-foreground/60" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl text-foreground font-semibold">{step.title}</h3>
                <p className="text-sm text-foreground/65 leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
