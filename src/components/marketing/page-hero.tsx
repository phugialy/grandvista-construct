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
    <section className="relative isolate overflow-hidden border-b border-white/10 bg-ink text-white">
      {visualMedia ? (
        <ManagedMedia
          altFallback={title}
          className="object-cover opacity-30"
          media={visualMedia}
          priority
          sizes="100vw"
        />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(8,9,106,0.78),transparent_34%),linear-gradient(135deg,#10131a,#08096a)]" />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/88 to-navy/62" />
      <div className="absolute inset-0 gv-grid-dark opacity-70" />
      <div className="pointer-events-none absolute right-[-2vw] top-10 hidden text-[28vw] leading-none text-white/[0.035] lg:block gv-display">
        GV
      </div>

      <div className="section-shell relative z-10 grid min-h-[520px] items-end py-14 sm:min-h-[600px] sm:py-16 lg:min-h-[650px]">
        <div className="max-w-5xl">
          <p className="eyebrow mb-7">{eyebrow}</p>
          <h1 className="gv-display max-w-5xl text-[4rem] leading-[0.9] text-white [overflow-wrap:anywhere] sm:text-[6.2rem] lg:text-[7.8rem]">
            {title}
            <span className="text-brand-red">.</span>
          </h1>
          <p className="mt-8 max-w-3xl text-base leading-8 text-white/74 sm:text-lg">{copy}</p>
          {(primaryHref || secondaryHref) ? (
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              {primaryHref && primaryLabel ? (
                <Link
                  href={primaryHref}
                  className="inline-flex h-14 items-center justify-center gap-2 bg-brand-red px-8 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-white hover:text-navy"
                >
                  {primaryLabel} <ArrowUpRight size={18} />
                </Link>
              ) : null}
              {secondaryHref && secondaryLabel ? (
                <Link
                  href={secondaryHref}
                  className="inline-flex h-14 items-center justify-center border border-white/22 px-8 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:border-brand-red hover:text-brand-red"
                >
                  {secondaryLabel}
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>

        {stats.length > 0 ? (
          <div className="mt-14 grid max-w-3xl gap-0 border-y border-white/12 sm:grid-cols-2">
            {stats.map((stat) => (
              <HeroStat key={stat.label} label={stat.label} value={stat.value} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function HeroStat({ label, value }: HeroStat) {
  return (
    <div className="border-white/12 py-5 sm:border-r sm:px-5 first:sm:pl-0 last:sm:border-r-0">
      <p className="gv-display text-3xl leading-none text-brand-red sm:text-4xl">{value}</p>
      <p className="mt-1 text-[0.68rem] font-black uppercase tracking-[0.16em] text-white/52">
        {label}
      </p>
    </div>
  );
}
