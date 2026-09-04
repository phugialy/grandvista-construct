import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Camera } from "lucide-react";
import { AnswerBrief } from "@/components/marketing/answer-brief";
import { FinalCta } from "@/components/marketing/final-cta";
import { FeaturedProjectHeroCarousel } from "@/components/marketing/featured-project-hero-carousel";
import { ManagedMedia } from "@/components/marketing/managed-media";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { JsonLd } from "@/components/marketing/json-ld";
import { PageHero } from "@/components/marketing/page-hero";
import { ProjectStoriesGrid } from "@/components/marketing/project-stories-grid";
import { SectionMediaHeroCarousel } from "@/components/marketing/section-media-hero-carousel";
import { breadcrumbJsonLd } from "@/lib/schema";
import {
  getFeaturedProjects,
  getProjectStoryFacets,
  getPublishedProjectsPage,
  getSiteSections,
} from "@/lib/supabase/public-data";

const INITIAL_PAGE_SIZE = 6;
const FEATURED_COUNT = 3;

export const metadata: Metadata = {
  title: "Project Stories | Commercial Construction Proof | Grandvista",
  description:
    "Real commercial construction work organized around business outcomes. Project stories with intent, challenge, delivery approach, and built results — not just photo galleries.",
  alternates: {
    canonical: "/project-stories",
  },
  openGraph: {
    title: "Project Stories | Commercial Construction Proof | Grandvista",
    description:
      "Real commercial construction work organized around business outcomes. Project stories with intent, challenge, delivery approach, and built results — not just photo galleries.",
    url: "https://grandvista-construction.com/project-stories",
    siteName: "Grandvista Construction",
    type: "website",
  },
};

export default async function ProjectStoriesPage() {
  const featuredProjects = await getFeaturedProjects(FEATURED_COUNT);
  const [sections, { projects: pageProjects, totalCount: gridTotalCount }, facets] = await Promise.all([
    getSiteSections(),
    getPublishedProjectsPage({
      page: 1,
      pageSize: INITIAL_PAGE_SIZE,
      excludeIds: featuredProjects.map((project) => project.id),
    }),
    getProjectStoryFacets(),
  ]);
  const totalCount = gridTotalCount + featuredProjects.length;
  const heroSection = sections["project-stories.hero"];
  const emptySection = sections["project-stories.empty"];
  const featuredHeroProjects =
    heroSection?.content_source === "featured_project"
      ? heroSection.featured_projects.filter((project) => project.slug)
      : [];
  const manualHeroMedia =
    heroSection?.content_source === "manual"
      ? heroSection.section_media.length > 0
        ? heroSection.section_media
        : heroSection.media_assets
          ? [heroSection.media_assets]
          : []
      : [];
  const heroTitle = heroSection?.headline ?? "Built work with business purpose.";
  const heroCopy =
    heroSection?.body ??
    "The goal is not a gallery. Grandvista's proof should explain the project intent, what was at stake, the construction challenge, the delivery approach, and the built outcome.";
  return (
    <MarketingShell>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: "https://grandvista-construction.com" },
          { name: "Project Stories", url: "https://grandvista-construction.com/project-stories" },
        ]) as Record<string, unknown>}
      />
      {featuredHeroProjects.length > 0 ? (
        <FeaturedProjectHeroCarousel projects={featuredHeroProjects} />
      ) : manualHeroMedia.length > 1 ? (
        <SectionMediaHeroCarousel
          copy={heroCopy}
          media={manualHeroMedia}
          primaryHref="/start-a-project"
          primaryLabel="Talk Through a Project"
          secondaryHref="/how-we-work"
          secondaryLabel="See The Process"
          title={heroTitle}
        />
      ) : (
        <PageHero
          eyebrow="Project Stories"
          title={heroTitle}
          copy={heroCopy}
          primaryHref="/start-a-project"
          primaryLabel="Talk Through a Project"
          secondaryHref="/how-we-work"
          secondaryLabel="See The Process"
          stats={[
            { label: "Proof", value: "Intent to outcome" },
            { label: "Format", value: "Case studies over galleries" },
          ]}
          visualMedia={manualHeroMedia[0] ?? null}
        />
      )}

      <AnswerBrief
        answer="Grandvista project stories show completed work through the business purpose behind each project: what the client needed, what made the work matter, how the project was handled, and what usable outcome came from it."
        points={["Project intent", "Construction pressure", "Delivery approach", "Built outcome"]}
        question="How should Grandvista project proof be read?"
      />

      <section className="section-shell py-20">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="eyebrow">03 - Project Stories</p>
            <h2 className="gv-display mt-4 max-w-4xl text-6xl leading-[0.92] text-navy sm:text-7xl">
              Case studies
              <br />
              over galleries
            </h2>
            <p className="mt-5 max-w-2xl leading-7 text-steel">
              Real work, organized around business outcomes.
            </p>
          </div>
          <Link
            href="/start-a-project"
            className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.12em] text-brand-red hover:text-navy"
          >
            Discuss a similar project <ArrowUpRight size={16} />
          </Link>
        </div>

        {totalCount > 0 ? (
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <ProofMetric label="Stories" value={String(totalCount)} />
            <ProofMetric label="Project Types" value={String(facets.types.length || 1)} />
            <ProofMetric label="Markets" value={String(facets.markets.length || 1)} />
          </div>
        ) : null}

        {totalCount === 0 ? (
          <article className="mt-12 grid gap-8 border border-ink/12 bg-white p-8 lg:grid-cols-[0.78fr_1.22fr]">
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
        ) : (
          <div className="mt-12">
            <ProjectStoriesGrid
              featuredProjects={featuredProjects}
              initialProjects={pageProjects}
              projectTypes={facets.types}
              totalCount={gridTotalCount}
            />
          </div>
        )}
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

function ProofMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-ink/12 bg-warm-white p-5">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-steel">{label}</p>
      <p className="mt-3 text-4xl font-black text-navy">{value}</p>
    </div>
  );
}
