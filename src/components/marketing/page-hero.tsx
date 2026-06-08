import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ManagedMedia } from "./managed-media";

type HeroStat = {
  label: string;
  value: string;
};

type PageHeroProps = {
  eyebrow: string;
  title: string;
  copy: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  stats?: HeroStat[];
  visualMedia?: {
    public_url: string;
    media_type: "image" | "video";
    alt_text: string | null;
  } | null;
};

export function PageHero({
  eyebrow,
  title,
  copy,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  stats = [],
  visualMedia,
}: PageHeroProps) {
  return (
    <section className="border-b border-white/10 bg-ink text-white">
      <div className="section-shell grid gap-10 py-16 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-5 max-w-5xl text-4xl font-black leading-[0.98] sm:text-6xl lg:text-7xl">
            {title}
          </h1>
          <p className="mt-7 max-w-3xl text-lg leading-8 text-white/72">{copy}</p>
          {(primaryHref || secondaryHref) && (
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              {primaryHref && primaryLabel ? (
                <Link
                  href={primaryHref}
                  className="inline-flex h-12 items-center justify-center gap-2 bg-brand-red px-6 text-sm font-black uppercase tracking-[0.08em] text-white transition hover:bg-white hover:text-ink"
                >
                  {primaryLabel} <ArrowUpRight size={18} />
                </Link>
              ) : null}
              {secondaryHref && secondaryLabel ? (
                <Link
                  href={secondaryHref}
                  className="inline-flex h-12 items-center justify-center border border-white/28 px-6 text-sm font-black uppercase tracking-[0.08em] text-white transition hover:border-white hover:bg-white hover:text-ink"
                >
                  {secondaryLabel}
                </Link>
              ) : null}
            </div>
          )}
        </div>

        <div className="grid gap-4">
          <div className="relative aspect-[4/3] min-h-0 overflow-hidden border border-white/14 bg-[#151925] sm:min-h-[360px] lg:min-h-[430px]">
            {visualMedia ? (
              <>
                <ManagedMedia altFallback={title} className="object-cover opacity-82" media={visualMedia} priority />
                <div className="absolute inset-0 bg-ink/34" />
              </>
            ) : (
              <>
                <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-80">
                  {Array.from({ length: 36 }).map((_, index) => (
                    <div key={index} className="border border-white/[0.035]" />
                  ))}
                </div>
                <div className="absolute left-8 right-12 top-8 h-32 bg-concrete/85" />
                <div className="absolute bottom-24 left-8 right-20 h-44 bg-white/10" />
                <div className="absolute bottom-8 left-24 right-8 h-24 bg-brand-red" />
                <div className="absolute right-8 top-24 w-24 border-t-[190px] border-l-[60px] border-t-white/22 border-l-transparent" />
              </>
            )}
            <div className="absolute inset-x-8 bottom-8 hidden gap-3 sm:grid sm:grid-cols-2">
              {stats.map((stat) => (
                <HeroStat key={stat.label} label={stat.label} value={stat.value} />
              ))}
            </div>
          </div>
          <div className="grid gap-3 sm:hidden">
            {stats.map((stat) => (
              <HeroStat key={stat.label} label={stat.label} value={stat.value} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroStat({ label, value }: HeroStat) {
  return (
    <div className="bg-ink/88 p-5">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-brand-red">{label}</p>
      <p className="mt-2 text-xl font-black">{value}</p>
    </div>
  );
}
