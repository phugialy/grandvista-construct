"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ManagedMedia } from "@/components/marketing/managed-media";
import type { SiteSectionMediaAsset } from "@/lib/supabase/public-data";

type SectionMediaHeroCarouselProps = {
  copy: string;
  media: SiteSectionMediaAsset[];
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
  title: string;
};

export function SectionMediaHeroCarousel({
  copy,
  media,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  title,
}: SectionMediaHeroCarouselProps) {
  const slides = useMemo(() => media.filter((asset) => asset.public_url), [media]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const activeMedia = slides[activeIndex] ?? slides[0];

  useEffect(() => {
    if (paused || slides.length < 2) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 7600);

    return () => window.clearInterval(interval);
  }, [paused, slides.length]);

  if (!activeMedia) {
    return null;
  }

  function move(direction: -1 | 1) {
    setActiveIndex((current) => (current + direction + slides.length) % slides.length);
  }

  return (
    <section
      className="bg-ink text-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="section-shell grid gap-10 py-16 lg:grid-cols-[1.06fr_0.94fr] lg:items-center">
        <div>
          <p className="eyebrow">Project Stories</p>
          <h1 className="mt-5 max-w-5xl text-5xl font-black leading-[0.98] sm:text-6xl lg:text-7xl">
            {title}
          </h1>
          <p className="mt-7 max-w-3xl text-lg leading-8 text-white/72">{copy}</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              className="inline-flex h-12 items-center justify-center gap-2 bg-brand-red px-6 text-sm font-black uppercase tracking-[0.08em] text-white transition hover:bg-white hover:text-ink"
              href={primaryHref}
            >
              {primaryLabel} <ArrowUpRight size={18} />
            </Link>
            <Link
              className="inline-flex h-12 items-center justify-center border border-white/28 px-6 text-sm font-black uppercase tracking-[0.08em] text-white transition hover:border-white hover:bg-white hover:text-ink"
              href={secondaryHref}
            >
              {secondaryLabel}
            </Link>
          </div>
        </div>

        <div className="relative min-h-[430px] overflow-hidden border border-white/14 bg-[#151925]">
          <ManagedMedia
            altFallback="Project stories hero media"
            className="object-cover"
            media={activeMedia}
            priority
            sizes="(min-width: 1024px) 48vw, 100vw"
          />
          <div className="absolute inset-0 bg-ink/34" />

          <div className="absolute inset-x-6 bottom-6 grid gap-3 sm:grid-cols-2">
            <HeroStat label="Proof" value="Intent to outcome" />
            <HeroStat label="Format" value="Case studies over galleries" />
          </div>

          {slides.length > 1 ? (
            <div className="absolute left-6 right-6 top-6 flex items-center justify-between gap-4">
              <div className="flex gap-2">
                {slides.map((asset, index) => (
                  <button
                    aria-label={`Show project stories media ${index + 1}`}
                    className={`h-2.5 w-8 ${index === activeIndex ? "bg-brand-red" : "bg-white/34 hover:bg-white/70"}`}
                    key={asset.id}
                    onClick={() => setActiveIndex(index)}
                    type="button"
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  aria-label="Previous project stories media"
                  className="grid h-11 w-11 place-items-center border border-white/24 bg-ink/70 text-white hover:bg-white hover:text-ink"
                  onClick={() => move(-1)}
                  type="button"
                >
                  <ArrowLeft size={18} />
                </button>
                <button
                  aria-label="Next project stories media"
                  className="grid h-11 w-11 place-items-center border border-white/24 bg-ink/70 text-white hover:bg-white hover:text-ink"
                  onClick={() => move(1)}
                  type="button"
                >
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-ink/88 p-5">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-brand-red">{label}</p>
      <p className="mt-2 text-xl font-black">{value}</p>
    </div>
  );
}
