import Link from "next/link";

interface PageBannerProps {
  title: string;
  eyebrow?: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
}

export default function PageBanner({
  title,
  eyebrow,
  subtitle,
  backHref,
  backLabel,
}: PageBannerProps) {
  return (
    <section className="bg-[linear-gradient(135deg,#214a57_0%,#2e6d7c_50%,#457870_100%)] pt-28 pb-10 px-6">
      <div className="max-w-6xl mx-auto">
        {backHref && (
          <Link
            href={backHref}
            className="inline-block text-sm text-white/70 hover:text-white transition-colors mb-6"
          >
            {backLabel ?? "← Zurück"}
          </Link>
        )}
        {eyebrow && (
          <p className="text-xs text-white/60 uppercase tracking-[0.12em] mb-3">{eyebrow}</p>
        )}
        <h1 className="font-serif text-[clamp(1.75rem,4vw,2.75rem)] text-white leading-[1.15] max-w-[36ch]">
          {title}
        </h1>
        {subtitle && (
          <p className="text-base text-white/75 max-w-[48ch] leading-[1.65] mt-3">{subtitle}</p>
        )}
      </div>
    </section>
  );
}
