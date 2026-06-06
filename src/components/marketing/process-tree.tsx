"use client";

import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { ManagedMedia } from "./managed-media";
import type { SiteSectionMediaAsset } from "@/lib/supabase/public-data";

type ProcessStage = {
  media?: SiteSectionMediaAsset | null;
  text: string;
  title: string;
};

export function ProcessTree({ stages }: { stages: ProcessStage[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeStage = stages[activeIndex] ?? stages[0];

  if (!activeStage) {
    return null;
  }

  return (
    <section className="section-shell py-20">
      <div className="grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
        <div className="lg:sticky lg:top-28">
          <p className="eyebrow">Delivery Workflow</p>
          <h2 className="mt-4 text-4xl font-black leading-tight">
            A serious project needs a visible operating rhythm.
          </h2>

          <div className="mt-8 border border-ink/12 bg-white p-7">
            <p className="text-sm font-black uppercase tracking-[0.14em] text-brand-red">
              Stage {String(activeIndex + 1).padStart(2, "0")}
            </p>
            <h3 className="mt-4 text-4xl font-black leading-tight">{activeStage.title}</h3>
            <p className="mt-5 leading-8 text-steel">{activeStage.text}</p>
            <div className="mt-7 flex items-center gap-3 text-sm font-black uppercase tracking-[0.08em] text-navy">
              Hover or tap another stage <ArrowRight size={17} />
            </div>
          </div>

          <div className="relative mt-5 min-h-72 overflow-hidden border border-ink/12 bg-ink">
            {activeStage.media ? (
              <>
                <ManagedMedia
                  altFallback={activeStage.title}
                  className="object-cover opacity-84"
                  media={activeStage.media}
                  sizes="(min-width: 1024px) 42vw, 100vw"
                />
                <div className="absolute inset-0 bg-ink/24" />
              </>
            ) : (
              <>
                <div className="absolute inset-0 grid grid-cols-5 grid-rows-5">
                  {Array.from({ length: 25 }).map((_, index) => (
                    <div className="border border-white/[0.04]" key={index} />
                  ))}
                </div>
                <div className="absolute left-6 right-16 top-8 h-20 bg-concrete/80" />
                <div className="absolute bottom-8 left-12 right-8 h-24 bg-brand-red" />
              </>
            )}
          </div>
        </div>

        <div className="relative">
          <div className="absolute bottom-0 left-7 top-0 hidden w-px bg-ink/12 sm:block" />
          <div className="grid gap-3">
            {stages.map((stage, index) => {
              const active = index === activeIndex;

              return (
                <button
                  className={`relative grid gap-4 border p-5 text-left transition sm:grid-cols-[64px_1fr] ${
                    active
                      ? "border-navy bg-ink text-white"
                      : "border-ink/12 bg-white hover:border-brand-red hover:bg-warm-white"
                  }`}
                  key={stage.title}
                  onClick={() => setActiveIndex(index)}
                  onMouseEnter={() => setActiveIndex(index)}
                  type="button"
                >
                  <span
                    className={`z-10 flex h-14 w-14 items-center justify-center text-sm font-black ${
                      active ? "bg-brand-red text-white" : "bg-navy text-white"
                    }`}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <span className="block text-2xl font-black">{stage.title}</span>
                    <span className={`mt-2 block leading-7 ${active ? "text-white/72" : "text-steel"}`}>
                      {stage.text}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
