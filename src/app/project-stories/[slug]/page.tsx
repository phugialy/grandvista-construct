import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { MapPin } from "lucide-react";
import { Suspense } from "react";
import { connection } from "next/server";
import { Breadcrumbs } from "@/components/marketing/breadcrumbs";
import { FinalCta } from "@/components/marketing/final-cta";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { ProjectMediaCarousel } from "@/components/marketing/project-media-carousel";
import {
  getProjectPartners,
  getPublishedProjectBySlug,
  type PublishedProject,
  type ProjectMedia,
} from "@/lib/supabase/public-data";

type Params = {
  slug: string;
};

const statusBadge: Record<PublishedProject["project_status"], { label: string; className: string }> = {
  announced: { label: "Coming Soon", className: "bg-navy text-white" },
  in_progress: { label: "Under Construction", className: "bg-brand-red text-white" },
  completed: { label: "Completed", className: "bg-white text-ink" },
};

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  await connection();
  const { slug } = await params;
  const project = await getPublishedProjectBySlug(slug);

  if (!project) {
    return { title: "Project Story | Grandvista" };
  }

  const title = project.seo_title ?? buildSeoTitle(project);
  const description = project.seo_description ?? buildSeoDescription(project);
  const canonical = `/project-stories/${slug}`;
  const socialImage = getSocialImage(project);

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "Grandvista Construction",
      type: "article",
      images: socialImage
        ? [
            {
              url: socialImage.url,
              alt: socialImage.alt ?? `${project.title} project story`,
            },
          ]
        : undefined,
    },
    twitter: {
      card: socialImage ? "summary_large_image" : "summary",
      title,
      description,
      images: socialImage ? [socialImage.url] : undefined,
    },
  };
}

export default function ProjectStoryDetailPage({ params }: { params: Promise<Params> }) {
  return (
    <Suspense fallback={null}>
      <StoryPage params={params} />
    </Suspense>
  );
}

async function StoryPage({ params }: { params: Promise<Params> }) {
  await connection();
  const { slug } = await params;
  const project = await getPublishedProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const hero = project.project_media?.find((media) => media.role === "hero") ?? null;
  const gallery = project.project_media?.filter((media) => media.role !== "hero") ?? [];
  const partners = getProjectPartners(project);
  const kicker = [project.project_type, project.location].filter(Boolean).join(" / ");
  const facts = [
    { label: "Client Type", value: project.client_type },
    { label: "Project Type", value: project.project_type },
    { label: "Location", value: project.location },
  ].filter((fact) => hasContent(fact.value));
  const badge = statusBadge[project.project_status];
  const introParagraphs = formatParagraphs(project.project_intent ?? project.intention ?? project.summary);
  const buildParagraphs = formatParagraphs(project.story_body);
  const outcomeParagraphs = formatParagraphs(project.built_outcome);
  const jsonLd = buildProjectJsonLd(project, slug, partners);

  return (
    <MarketingShell>
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
        type="application/ld+json"
      />

      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Project Stories", href: "/project-stories" },
          { name: project.title, href: `/project-stories/${slug}` },
        ]}
      />

      <section className="relative h-[clamp(26rem,52vw,35rem)] overflow-hidden text-white">
        <HeroMedia hero={hero} title={project.title} />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/15" />
        <div className="section-shell absolute inset-x-0 bottom-0 pb-10 pt-16">
          <span className={`inline-flex px-3 py-1.5 text-[0.62rem] font-black uppercase tracking-[0.1em] ${badge.className}`}>
            {badge.label}
          </span>
          <p className="eyebrow mt-4" style={{ color: "#ff5a70" }}>
            Project Story
          </p>
          <h1 className="mt-2 max-w-4xl text-[clamp(2.2rem,4.6vw,3.6rem)] font-black leading-[0.96]" style={{ textWrap: "balance" }}>
            {project.title}
          </h1>
          {kicker ? (
            <p className="mt-4 flex items-center gap-2 text-sm font-black uppercase tracking-[0.1em] text-white/80">
              <MapPin size={16} /> {kicker}
            </p>
          ) : null}
          {facts.length > 0 ? (
            <div className="mt-6 flex flex-wrap gap-6">
              {facts.map((fact) => (
                <div key={fact.label}>
                  <p className="text-[0.6rem] font-black uppercase tracking-[0.06em] text-white/60">{fact.label}</p>
                  <p className="mt-1 text-sm font-black">{fact.value}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="section-shell grid gap-10 py-14 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div>
          {introParagraphs.length > 0 ? (
            <div className="mb-7 max-w-[60ch]">
              {introParagraphs.map((paragraph) => (
                <p className="text-xl font-bold leading-[1.5] text-ink" key={paragraph}>
                  {paragraph}
                </p>
              ))}
            </div>
          ) : null}

          {buildParagraphs.length > 0 ? (
            <div className="mb-7 grid gap-4">
              {buildParagraphs.map((paragraph) => (
                <p className="max-w-[62ch] text-base leading-8 text-steel" key={paragraph}>
                  {paragraph}
                </p>
              ))}
            </div>
          ) : null}

          {outcomeParagraphs.length > 0 ? (
            <div className="border-l-4 border-brand-red py-1 pl-6">
              {outcomeParagraphs.map((paragraph) => (
                <p className="max-w-[58ch] text-lg font-bold leading-[1.65] text-ink" key={paragraph}>
                  {paragraph}
                </p>
              ))}
            </div>
          ) : null}
        </div>

        <aside className="grid content-start gap-6">
          {partners.length > 0 ? (
            <div className="border border-ink/12 bg-white p-5">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-brand-red">Built With</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {partners.map((partner) => (
                  <span className="border border-ink/14 px-3 py-1.5 text-sm font-bold" key={partner.id}>
                    {partner.name}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="border border-ink/12 bg-white p-5">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-brand-red">Talk Through a Project</p>
            <p className="mt-3 text-sm leading-6 text-steel">
              Have a project with similar pressure — schedule, site context, opening date?
            </p>
            <a
              className="mt-5 flex h-12 items-center justify-center bg-navy px-4 text-xs font-black uppercase tracking-[0.08em] text-white transition hover:bg-brand-red"
              href="/start-a-project"
            >
              Start a Conversation
            </a>
          </div>
        </aside>
      </section>

      {gallery.length > 0 ? (
        <section className="border-t border-ink/10 bg-white py-16">
          <div className="section-shell">
            <ProjectMediaCarousel items={gallery} title={project.title} />
          </div>
        </section>
      ) : null}

      <FinalCta
        title="Have a project with similar pressure?"
        copy="Talk through the project type, stage, site context, schedule, and what the built outcome needs to make possible."
        primaryHref="/start-a-project"
        primaryLabel="Start a Project Conversation"
        secondaryHref="/how-we-work"
        secondaryLabel="See How We Work"
      />
    </MarketingShell>
  );
}

function HeroMedia({ hero, title }: { hero: ProjectMedia | null; title: string }) {
  if (hero?.url && hero.media_type === "image") {
    return <Image alt={hero.alt ?? title} className="object-cover" fill priority sizes="100vw" src={hero.url} />;
  }

  if (hero?.url && hero.media_type === "video") {
    return <video autoPlay className="absolute inset-0 h-full w-full object-cover" loop muted playsInline src={hero.url} />;
  }

  return (
    <div className="absolute inset-0 bg-ink">
      <div className="absolute inset-0 grid grid-cols-6 grid-rows-6">
        {Array.from({ length: 36 }).map((_, index) => (
          <div key={index} className="border border-white/[0.04]" />
        ))}
      </div>
    </div>
  );
}

function hasContent(value?: string | null) {
  return Boolean(value?.trim());
}

function formatParagraphs(value?: string | null) {
  if (!value?.trim()) {
    return [];
  }

  return value
    .replace(/\*\*/g, "")
    .split(/\r?\n{2,}|\r?\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function buildSeoTitle(project: PublishedProject) {
  const context = [project.project_type, project.location].filter(Boolean).join(" / ");
  return context
    ? `${project.title} | ${context} | Grandvista`
    : `${project.title} | Grandvista Project Story`;
}

function buildSeoDescription(project: PublishedProject) {
  const source =
    project.project_intent ??
    project.intention ??
    project.summary ??
    project.story_body ??
    [project.title, project.project_type, project.location].filter(Boolean).join(" / ");

  return cleanText(source).slice(0, 156) || undefined;
}

function getSocialImage(project: PublishedProject): ProjectMedia | null {
  return (
    project.project_media?.find((media) => media.role === "hero" && media.media_type === "image") ??
    project.project_media?.find((media) => media.media_type === "image") ??
    null
  );
}

function buildProjectJsonLd(
  project: PublishedProject,
  slug: string,
  partners: Array<{ id: string; slug: string; name: string }>,
) {
  const url = `https://grandvista-construction.com/project-stories/${slug}`;
  const image = getSocialImage(project);
  const description = buildSeoDescription(project);

  return [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: project.title,
      description,
      image: image?.url,
      url,
      mainEntityOfPage: url,
      dateModified: project.updated_at,
      author: {
        "@type": "Organization",
        name: "Grandvista Construction",
        url: "https://grandvista-construction.com",
      },
      publisher: {
        "@type": "Organization",
        name: "Grandvista Construction",
        url: "https://grandvista-construction.com",
      },
      about: [
        project.project_type,
        project.location,
        "Commercial construction",
        "Construction project story",
      ].filter(Boolean),
      mentions: partners.map((partner) => ({
        "@type": "Organization",
        name: partner.name,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://grandvista-construction.com",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Project Stories",
          item: "https://grandvista-construction.com/project-stories",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: project.title,
          item: url,
        },
      ],
    },
  ];
}

function cleanText(value: string) {
  return value
    .replace(/\*\*/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
