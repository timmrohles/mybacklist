import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section className="bg-[linear-gradient(135deg,#214a57_0%,#2e6d7c_50%,#457870_100%)] py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <p className="text-xs text-white/60 uppercase tracking-[0.12em] mb-6">
          Kuratierte Buchempfehlungen
        </p>
        <h1 className="font-serif text-[clamp(2.5rem,6vw,4.5rem)] text-white leading-[1.1] max-w-[18ch] mb-6">
          Bücher die wirklich bleiben.
        </h1>
        <p className="text-lg text-white/75 max-w-[38rem] leading-[1.65] mb-10">
          Handverlesene Empfehlungen von echten Lesern – keine Algorithmen, keine Bestsellerlisten.
        </p>
        <div className="flex flex-wrap gap-4">
          <Button asChild size="lg" className="bg-white text-[#0d3d3a] hover:bg-white/90 font-medium">
            <Link href="/themen">Themen entdecken</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-white/40 text-white hover:bg-white/10 bg-transparent"
          >
            <Link href="/kuratoren">Kuratoren kennenlernen</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
