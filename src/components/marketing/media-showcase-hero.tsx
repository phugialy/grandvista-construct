"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight, Maximize2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { ManagedMedia } from "./managed-media";
import type { SiteSectionMediaAsset } from "@/lib/supabase/public-data";

type HeroStat = {
  label: string;
  value: string;
};

type MediaShowcaseHeroProps = {
  copy: string;
  eyebrow: string;
  media: SiteSectionMediaAsset[];
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  stats?: HeroStat[];
  title: string;
};

export function MediaShowcaseHero({
  copy,
  eyebrow,
  media,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  stats = [],
  title,
}: MediaShowcaseHeroProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [paused, setPaused] = useState(false);
  const activeMedia = media[activeIndex] ?? media[0] ?? null;

  useEffect(() => {
    if (paused || media.length < 2 || lightboxOpen) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % media.length);
    }, 7000);

    return () => window.clearInterval(interval);
  }, [lightboxOpen, media.length, paused]);

  function move(direction: -1 | 1) {
    setActiveIndex((current) => (current + direction + media.length) % media.length);
  }

  return (
    <section
      className="border-b border-white/10 bg-ink text-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="section-shell grid gap-10 py-16 lg:grid-cols-[0.68fr_1.32fr] lg:items-center">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-5 max-w-4xl text-5xl font-black leading-[0.98] sm:text-6xl lg:text-6xl">
            {title}
          </h1>
          <p className="mt-7 max-w-2xl text-base leading-8 text-white/72 sm:text-lg">{copy}</p>
          {(primaryHref || secondaryHref) && (
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              {primaryHref && primaryLabel ? (
                <Link
                  className="inline-flex h-12 items-center justify-center gap-2 bg-brand-red px-6 text-sm font-black uppercase tracking-[0.08em] text-white transition hover:bg-white hover:text-ink"
                  href={primaryHref}
                >
                  {primaryLabel} <ArrowUpRight size={18} />
                </Link>
              ) : null}
              {secondaryHref && secondaryLabel ? (
                <Link
                  className="inline-flex h-12 items-center justify-center border border-white/28 px-6 text-sm font-black uppercase tracking-[0.08em] text-white transition hover:border-white hover:bg-white hover:text-ink"
                  href={secondaryHref}
                >
                  {secondaryLabel}
                </Link>
              ) : null}
            </div>
          )}
        </div>

        <div className="grid gap-4">
          <button
            aria-label="Enlarge selected project image"
            className="group relative min-h-[460px] overflow-hidden border border-white/14 bg-[#151925] text-left transition duration-500 hover:z-10 hover:border-white/34 hover:shadow-[0_28px_80px_rgba(0,0,0,0.42)] sm:min-h-[600px] lg:hover:scale-[1.045]"
            onClick={() => setLightboxOpen(true)}
            type="button"
          >
            {activeMedia ? (
              <>
                <ManagedMedia
                  altFallback={title}
                  className="object-cover opacity-86 transition duration-700 group-hover:scale-[1.12] group-hover:opacity-100"
                  media={activeMedia}
                  priority
                  sizes="(min-width: 1024px) 64vw, 100vw"
                />
                <div className="absolute inset-0 bg-ink/24 transition duration-500 group-hover:bg-ink/4" />
              </>
            ) : null}
            <div className="absolute right-5 top-5 grid h-12 w-12 place-items-center border border-white/22 bg-ink/72 text-white transition group-hover:bg-white group-hover:text-ink">
              <Maximize2 size={19} />
            </div>
            {stats.length > 0 ? (
              <div className="absolute inset-x-5 bottom-5 grid gap-3 sm:grid-cols-2">
                {stats.map((stat) => (
                  <div key={stat.label} className="bg-ink/88 p-5">
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-brand-red">
                      {stat.label}
                    </p>
                    <p className="mt-2 text-xl font-black">{stat.value}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </button>

          {media.length > 1 ? (
            <div className="flex items-center justify-between gap-4">
              <div className="flex gap-2">
                {media.map((item, index) => (
                  <button
                    aria-label={`Show media ${index + 1}`}
                    className={`h-2.5 w-9 ${index === activeIndex ? "bg-brand-red" : "bg-white/28 hover:bg-white/60"}`}
                    key={item.id}
                    onClick={() => setActiveIndex(index)}
                    type="button"
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  aria-label="Previous media"
                  className="grid h-11 w-11 place-items-center border border-white/24 text-white hover:bg-white hover:text-ink"
                  onClick={() => move(-1)}
                  type="button"
                >
                  <ArrowLeft size={18} />
                </button>
                <button
                  aria-label="Next media"
                  className="grid h-11 w-11 place-items-center border border-white/24 text-white hover:bg-white hover:text-ink"
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

      {lightboxOpen && activeMedia ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-ink/92 p-4 text-white sm:p-8"
          onClick={() => setLightboxOpen(false)}
          role="presentation"
        >
          <button
            aria-label="Close media preview"
            className="absolute right-5 top-5 z-10 grid h-12 w-12 place-items-center border border-white/24 bg-ink text-white hover:bg-white hover:text-ink"
            onClick={() => setLightboxOpen(false)}
            type="button"
          >
            <X size={20} />
          </button>
          <div
            className="relative h-[78vh] w-full max-w-6xl overflow-hidden border border-white/16 bg-[#151925] shadow-[0_28px_90px_rgba(0,0,0,0.55)]"
            onClick={(event) => event.stopPropagation()}
            role="presentation"
          >
            <ManagedMedia
              altFallback={title}
              className="object-contain"
              media={activeMedia}
              sizes="100vw"
              videoControls
            />
          </div>
          {media.length > 1 ? (
            <>
              <button
                aria-label="Previous enlarged media"
                className="absolute left-5 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center border border-white/24 bg-ink/86 text-white hover:bg-white hover:text-ink"
                onClick={(event) => {
                  event.stopPropagation();
                  move(-1);
                }}
                type="button"
              >
                <ArrowLeft size={18} />
              </button>
              <button
                aria-label="Next enlarged media"
                className="absolute right-5 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center border border-white/24 bg-ink/86 text-white hover:bg-white hover:text-ink"
                onClick={(event) => {
                  event.stopPropagation();
                  move(1);
                }}
                type="button"
              >
                <ArrowRight size={18} />
              </button>
            </>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
