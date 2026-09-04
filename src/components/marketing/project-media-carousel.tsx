"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ProjectMedia } from "@/lib/supabase/public-data";

export function ProjectMediaCarousel({ items, title }: { items: ProjectMedia[]; title: string }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  function scrollByOne(direction: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    const slide = track.querySelector<HTMLElement>("[data-slide]");
    const slideWidth = (slide?.offsetWidth ?? 360) + 16;
    track.scrollBy({ left: slideWidth * direction, behavior: "smooth" });
  }

  function handleScroll() {
    const track = trackRef.current;
    if (!track) return;
    const slide = track.querySelector<HTMLElement>("[data-slide]");
    const slideWidth = (slide?.offsetWidth ?? 360) + 16;
    setActiveIndex(Math.round(track.scrollLeft / slideWidth));
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="flex items-end justify-between">
        <p className="eyebrow">Project Media</p>
        <div className="flex gap-2">
          <button
            aria-label="Previous photo"
            className="flex h-10 w-10 items-center justify-center border border-ink/14 bg-white text-ink transition hover:border-brand-red hover:text-brand-red"
            onClick={() => scrollByOne(-1)}
            type="button"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            aria-label="Next photo"
            className="flex h-10 w-10 items-center justify-center border border-ink/14 bg-white text-ink transition hover:border-brand-red hover:text-brand-red"
            onClick={() => scrollByOne(1)}
            type="button"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div
        className="mt-5 flex gap-4 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        onScroll={handleScroll}
        ref={trackRef}
        style={{ scrollSnapType: "x mandatory" }}
      >
        {items.map((media) => (
          <figure
            className="relative h-64 shrink-0 basis-[min(360px,82%)] overflow-hidden bg-ink"
            data-slide
            key={media.id}
            style={{ scrollSnapAlign: "start" }}
          >
            {media.media_type === "image" ? (
              <Image alt={media.alt ?? title} className="object-cover" fill sizes="360px" src={media.url} />
            ) : (
              <video className="h-full w-full object-cover" controls muted src={media.url} />
            )}
            {media.caption ? (
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/85 to-transparent p-4 text-sm font-bold text-white">
                {media.caption}
              </figcaption>
            ) : null}
          </figure>
        ))}
      </div>

      {items.length > 1 ? (
        <div className="mt-4 flex gap-1.5">
          {items.map((media, index) => (
            <span
              className={`h-1.5 transition-all ${index === activeIndex ? "w-5 bg-brand-red" : "w-1.5 bg-ink/20"}`}
              key={media.id}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
