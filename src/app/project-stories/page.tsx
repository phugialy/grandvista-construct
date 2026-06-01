import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Camera, FileText, MapPin } from "lucide-react";
import { FinalCta } from "@/components/marketing/final-cta";
import { ManagedMedia } from "@/components/marketing/managed-media";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { PageHero } from "@/components/marketing/page-hero";
import { projectStoryFields } from "@/lib/site-content";
import { getPublishedProjects, getSiteSections } from "@/lib/supabase/public-data";

const filters = [
  "Commercial Interiors",
  "Food Service",
  "Retail",
  "Office / Medical",
  "Warehouse / Industrial",
  "Ground-Up",
  "Adaptive Reuse",
];

export default async function ProjectStoriesPage() {
  const [projects, sections] = await Promise.all([getPublishedProjects(), getSiteSections()]);
  const heroSection = sections["project-stories.hero"];
  const emptySection = sections["project-stories.empty"];

  return (
    <MarketingShell>
      <PageHero
        eyebrow="Project Stories"
        title={heroSection?.headline ?? "Built work with business purpose."}
        copy={
          heroSection?.body ??
          "The goal is not a gallery. Grandvista's proof should explain the project intent, what was at stake, the construction challenge, the delivery approach, and the built outcome."
        }
        primaryHref="/start-a-project"
        primaryLabel="Talk Through a Project"
        secondaryHref="/how-we-work"
        secondaryLabel="See The Process"
        stats={[
          { label: "Proof", value: "Intent to outcome" },
          { label: "Format", value: "Case studies over galleries" },
        ]}
        visualMedia={heroSection?.media_assets}
      />

      <section className="section-shell py-20">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="eyebrow">Project Filters</p>
            <h2 className="mt-4 max-w-3xl text-4xl font-black leading-tight sm:text-5xl">
              Make completed work easier to understand by category.
            </h2>
          </div>
          <p className="max-w-md leading-7 text-steel">
            These filters will become active once published projects and media are added through
            the admin workflow.
          </p>
        </div>
        <div className="mt-10 flex flex-wrap gap-3">
          {filters.map((filter) => (
            <span
              key={filter}
              className="border border-ink/12 bg-white px-4 py-3 text-sm font-black uppercase tracking-[0.08em] text-navy"
            >
              {filter}
            </span>
          ))}
        </div>
      </section>

      <section className="border-y border-ink/10 bg-white py-20">
        <div className="section-shell">
          <p className="eyebrow">Case Study Logic</p>
          <h2 className="mt-4 max-w-3xl text-4xl font-black leading-tight">
            Every project should explain why the work mattered.
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-5">
            {projectStoryFields.map((field, index) => (
              <article key={field} className="bg-warm-white p-5">
                <p className="text-sm font-black text-brand-red">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-4 text-lg font-black leading-tight">{field}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell py-20">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="eyebrow">Built Proof</p>
            <h2 className="mt-4 max-w-3xl text-4xl font-black leading-tight sm:text-5xl">
              Project stories will become the sales proof engine.
            </h2>
          </div>
          <Link
            href="/start-a-project"
            className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.08em] text-navy hover:text-brand-red"
          >
            Discuss a similar project <ArrowUpRight size={16} />
          </Link>
        </div>

        <div className="mt-10 grid gap-5">
          {projects.length === 0 ? (
            <article className="grid gap-8 border border-ink/12 bg-white p-8 lg:grid-cols-[0.78fr_1.22fr]">
              <div className="relative min-h-64 overflow-hidden bg-ink">
                {emptySection?.media_assets ? (
                  <ManagedEmptyMedia media={emptySection.media_assets} />
                ) : (
                  <>
                    <div className="absolute inset-0 grid grid-cols-5 grid-rows-5">
                      {Array.from({ length: 25 }).map((_, index) => (
                        <div key={index} className="border border-white/[0.04]" />
                      ))}
                    </div>
                    <Camera className="absolute bottom-6 left-6 text-brand-red" size={36} />
                    <div className="absolute right-6 top-6 h-28 w-36 bg-white/14" />
                    <div className="absolute bottom-6 right-6 h-20 w-44 bg-brand-red" />
                  </>
                )}
              </div>
              <div>
                <p className="text-sm font-black uppercase tracking-[0.12em] text-brand-red">
                  Prepared for CMS content
                </p>
                <h3 className="mt-4 text-3xl font-black leading-tight">
                  {emptySection?.headline ?? "Published case studies will appear here."}
                </h3>
                <p className="mt-5 leading-8 text-steel">
                  {emptySection?.body ??
                    "Each story should reframe the work from a basic project label into a business outcome: opening readiness, operational flow, inspection coordination, field constraints, and usable built value."}
                </p>
              </div>
            </article>
          ) : null}

          {projects.map((project) => (
            <article key={project.id} className="grid gap-8 border border-ink/12 bg-white p-8 lg:grid-cols-[0.78fr_1.22fr]">
              <div className="relative min-h-64 overflow-hidden bg-ink p-6 text-white">
                {project.project_media?.find((media) => media.role === "hero" && media.media_type === "image")?.url ? (
                  <Image
                    alt={project.project_media.find((media) => media.role === "hero" && media.media_type === "image")?.alt ?? project.title}
                    className="object-cover opacity-80"
                    fill
                    sizes="(min-width: 1024px) 38vw, 100vw"
                    src={project.project_media.find((media) => media.role === "hero" && media.media_type === "image")?.url ?? ""}
                  />
                ) : project.project_media?.find((media) => media.role === "hero" && media.media_type === "video")?.url ? (
                  <video
                    className="absolute inset-0 h-full w-full object-cover opacity-80"
                    muted
                    playsInline
                    src={project.project_media.find((media) => media.role === "hero" && media.media_type === "video")?.url}
                  />
                ) : (
                  <>
                    <FileText className="text-brand-red" size={30} />
                    <p className="mt-8 text-sm font-black uppercase tracking-[0.14em] text-white/60">
                      Project Story
                    </p>
                  </>
                )}
              </div>
              <div>
                <p className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.12em] text-brand-red">
                  <MapPin size={16} /> {[project.project_type, project.location].filter(Boolean).join(" / ")}
                </p>
                <h3 className="mt-4 text-3xl font-black">{project.title}</h3>
                <p className="mt-5 leading-8 text-steel">
                  {project.summary ?? project.project_intent ?? project.stakes ?? project.built_outcome}
                </p>
                <Link
                  className="mt-7 inline-flex items-center gap-2 bg-navy px-5 py-3 text-sm font-black uppercase tracking-[0.08em] text-white hover:bg-brand-red"
                  href={`/project-stories/${project.slug}`}
                >
                  View Story <ArrowUpRight size={16} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <FinalCta
        title="Have a project that needs more than a price conversation?"
        copy="Start with the business purpose, then talk through scope, stage, risk, schedule, and the next practical decision."
        primaryHref="/start-a-project"
        primaryLabel="Start a Project Conversation"
        secondaryHref="/our-direction"
        secondaryLabel="See Our Direction"
      />
    </MarketingShell>
  );
}

function ManagedEmptyMedia({
  media,
}: {
  media: {
    public_url: string;
    media_type: "image" | "video";
    alt_text: string | null;
  };
}) {
  return (
    <>
      <ManagedMedia altFallback="Project story proof media" className="object-cover opacity-82" media={media} />
      <div className="absolute inset-0 bg-ink/26" />
    </>
  );
}
