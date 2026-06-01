import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

type FinalCtaProps = {
  eyebrow?: string;
  title: string;
  copy: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
};

export function FinalCta({
  eyebrow = "Next Step",
  title,
  copy,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: FinalCtaProps) {
  return (
    <section className="bg-navy py-16 text-white">
      <div className="section-shell flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="mt-4 max-w-3xl text-4xl font-black leading-tight sm:text-5xl">{title}</h2>
          <p className="mt-5 max-w-2xl leading-8 text-white/70">{copy}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href={primaryHref}
            className="inline-flex h-12 items-center justify-center gap-2 bg-brand-red px-6 text-sm font-black uppercase tracking-[0.08em] text-white transition hover:bg-white hover:text-ink"
          >
            {primaryLabel} <ArrowUpRight size={18} />
          </Link>
          {secondaryHref && secondaryLabel ? (
            <Link
              href={secondaryHref}
              className="inline-flex h-12 items-center justify-center border border-white/24 px-6 text-sm font-black uppercase tracking-[0.08em] text-white transition hover:border-white hover:bg-white hover:text-ink"
            >
              {secondaryLabel}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
