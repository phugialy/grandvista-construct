import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { FinalCta } from "@/components/marketing/final-cta";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { getPublishedProjectBySlug, type PublishedProject, type ProjectMedia } from "@/lib/supabase/public-data";

type Params = {
  slug: string;
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

  const hero = project.project_media?.find((media) => media.role === "hero");
  const gallery = project.project_media?.filter((media) => media.role !== "hero") ?? [];
  const kicker = [project.project_type, project.location].filter(Boolean).join(" / ");
  const facts = [
    { label: "Client Type", value: project.client_type },
    { label: "Project Type", value: project.project_type },
    { label: "Location", value: project.location },
  ].filter((fact) => hasContent(fact.value));
  const storyParagraphs = formatStoryParagraphs(
    project.story_body ?? project.summary ?? project.project_intent,
  );
  const jsonLd = buildProjectJsonLd(project, slug);

  return (
    <MarketingShell>
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
        type="application/ld+json"
      />
      <section className="bg-ink text-white">
        <div className="section-shell py-16">
          <Link
            href="/project-stories"
            className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.08em] text-white/70 hover:text-white"
          >
            <ArrowLeft size={16} /> Back to Project Stories
          </Link>
          <div className="mt-10 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <div>
              <p className="eyebrow">Project Story</p>
              <h1 className="mt-5 max-w-5xl text-5xl font-black leading-[0.98] sm:text-6xl lg:text-7xl">
                {project.title}
              </h1>
              {kicker ? (
                <p className="mt-6 flex items-center gap-2 text-sm font-black uppercase tracking-[0.12em] text-brand-red">
                  <MapPin size={16} /> {kicker}
                </p>
              ) : null}
            </div>
            {facts.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {facts.map((fact) => (
                  <Fact key={fact.label} label={fact.label} value={fact.value} />
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="section-shell py-10">
          <div className="relative min-h-[420px] overflow-hidden bg-ink">
            {hero?.url && hero.media_type === "image" ? (
              <Image
                alt={hero.alt ?? project.title}
                className="object-cover"
                fill
                priority
                sizes="100vw"
                src={hero.url}
              />
            ) : hero?.url && hero.media_type === "video" ? (
              <video autoPlay className="absolute inset-0 h-full w-full object-cover" controls loop muted playsInline src={hero.url} />
            ) : (
              <div className="absolute inset-0 grid grid-cols-6 grid-rows-6">
                {Array.from({ length: 36 }).map((_, index) => (
                  <div key={index} className="border border-white/[0.04]" />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {storyParagraphs.length > 0 ? (
        <section className="section-shell py-14">
          <article className="mx-auto max-w-4xl border border-ink/12 bg-white p-8 lg:p-12">
            <p className="text-sm font-black uppercase tracking-[0.12em] text-brand-red">
              Project Story
            </p>
            <div className="mt-6 grid gap-5 text-lg leading-9 text-steel">
              {storyParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </article>
        </section>
      ) : null}

      {gallery.length > 0 ? (
        <section className="border-y border-ink/10 bg-white py-20">
          <div className="section-shell">
            <p className="eyebrow">Project Media</p>
            <h2 className="mt-4 max-w-3xl text-4xl font-black leading-tight">
              Visual proof that supports the project story.
            </h2>
            <div className="mt-10 grid gap-5 md:grid-cols-2">
              {gallery.map((media) => (
                <figure key={media.id} className="border border-ink/12 bg-warm-white p-4">
                  <div className="relative min-h-80 overflow-hidden bg-ink">
                    {media.media_type === "image" ? (
                      <Image
                        alt={media.alt ?? project.title}
                        className="object-cover"
                        fill
                        sizes="(min-width: 768px) 50vw, 100vw"
                        src={media.url}
                      />
                    ) : (
                      <video autoPlay className="absolute inset-0 h-full w-full object-cover" controls loop muted playsInline src={media.url} />
                    )}
                  </div>
                  {media.caption ? (
                    <figcaption className="mt-4 text-sm font-bold text-steel">{media.caption}</figcaption>
                  ) : null}
                </figure>
              ))}
            </div>
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

function Fact({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="bg-white/8 p-5">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-brand-red">{label}</p>
      <p className="mt-2 text-xl font-black">{value}</p>
    </div>
  );
}

function hasContent(value?: string | null) {
  return Boolean(value?.trim());
}

function formatStoryParagraphs(value?: string | null) {
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
    project.summary ??
    project.story_body ??
    project.project_intent ??
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

function buildProjectJsonLd(project: PublishedProject, slug: string) {
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
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Project Stories",
          item: "https://grandvista-construction.com/project-stories",
        },
        {
          "@type": "ListItem",
          position: 2,
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
