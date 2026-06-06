import { ManagedMedia } from "./managed-media";
import type { SiteSectionMediaAsset } from "@/lib/supabase/public-data";

export function VisionImageRail({ media }: { media: SiteSectionMediaAsset[] }) {
  if (media.length === 0) {
    return null;
  }

  const railMedia = [...media, ...media];

  return (
    <section className="overflow-hidden border-y border-ink/10 bg-white py-16">
      <div className="section-shell mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <p className="eyebrow">Direction In Motion</p>
          <h2 className="mt-4 max-w-3xl text-4xl font-black leading-tight">
            Visual proof should support the vision, not distract from it.
          </h2>
        </div>
        <p className="max-w-md leading-7 text-steel">
          Images selected here should feel related to growth, field standards, built environments,
          and the kind of larger responsibility Grandvista is moving toward.
        </p>
      </div>
      <div className="flex w-max gap-4 motion-safe:animate-[visionRail_44s_linear_infinite]">
        {railMedia.map((item, index) => (
          <div
            className="relative h-64 w-[78vw] shrink-0 overflow-hidden border border-ink/12 bg-ink sm:w-[420px]"
            key={`${item.id}-${index}`}
          >
            <ManagedMedia
              altFallback="Grandvista construction vision media"
              className="object-cover opacity-86"
              media={item}
              sizes="(min-width: 640px) 420px, 78vw"
            />
          </div>
        ))}
      </div>
      <style>{`
        @keyframes visionRail {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
