"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { ManagedMedia } from "./managed-media";
import type { SiteSectionMediaAsset } from "@/lib/supabase/public-data";

export function VisionImageRail({ media }: { media: SiteSectionMediaAsset[] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (media.length < 2) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % media.length);
    }, 5200);

    return () => window.clearInterval(interval);
  }, [media.length]);

  if (media.length === 0) {
    return null;
  }

  function move(direction: -1 | 1) {
    setActiveIndex((current) => (current + direction + media.length) % media.length);
  }

  return (
    <section className="overflow-hidden border-y border-ink/10 bg-white py-16">
      <div className="section-shell">
        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr_0.72fr]">
          {media.map((item, index) => (
            <button
              aria-label={`Show direction image ${index + 1}`}
              className={`group relative min-h-[280px] overflow-hidden border bg-ink transition duration-500 sm:min-h-[360px] ${
                index === activeIndex
                  ? "border-brand-red lg:scale-[1.02]"
                  : "border-ink/12 opacity-70 hover:opacity-100"
              }`}
              key={item.id}
              onClick={() => setActiveIndex(index)}
              type="button"
            >
              <ManagedMedia
                altFallback="Grandvista construction direction image"
                className="object-cover opacity-88 transition duration-700 group-hover:scale-[1.06]"
                media={item}
                sizes="(min-width: 1024px) 40vw, 100vw"
              />
            </button>
          ))}
        </div>

        {media.length > 1 ? (
          <div className="mt-5 flex items-center justify-between gap-4">
            <div className="flex gap-2">
              {media.map((item, index) => (
                <button
                  aria-label={`Go to direction image ${index + 1}`}
                  className={`h-2.5 w-9 ${index === activeIndex ? "bg-brand-red" : "bg-ink/24 hover:bg-ink/50"}`}
                  key={item.id}
                  onClick={() => setActiveIndex(index)}
                  type="button"
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button
                aria-label="Previous direction image"
                className="grid h-11 w-11 place-items-center border border-ink/14 text-ink hover:bg-ink hover:text-white"
                onClick={() => move(-1)}
                type="button"
              >
                <ArrowLeft size={18} />
              </button>
              <button
                aria-label="Next direction image"
                className="grid h-11 w-11 place-items-center border border-ink/14 text-ink hover:bg-ink hover:text-white"
                onClick={() => move(1)}
                type="button"
              >
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        ) : null}

        {media[activeIndex] ? (
          <div className="relative mt-5 min-h-[56vw] overflow-hidden border border-ink/12 bg-ink sm:min-h-[520px]">
            <ManagedMedia
              altFallback="Grandvista construction direction feature"
              className="object-cover opacity-90"
              media={media[activeIndex]}
              sizes="100vw"
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
