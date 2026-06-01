import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";
import Link from "next/link";
import { FinalCta } from "@/components/marketing/final-cta";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { getPublishedProjectBySlug } from "@/lib/supabase/public-data";

type Params = {
  slug: string;
};

export const revalidate = 300;

export default async function ProjectStoryDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const project = await getPublishedProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const hero = project.project_media?.find((media) => media.role === "hero");
  const gallery = project.project_media?.filter((media) => media.role !== "hero") ?? [];

  return (
    <MarketingShell>
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
              <p className="mt-6 flex items-center gap-2 text-sm font-black uppercase tracking-[0.12em] text-brand-red">
                <MapPin size={16} /> {[project.project_type, project.location].filter(Boolean).join(" / ")}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Fact label="Client Type" value={project.client_type} />
              <Fact label="Project Type" value={project.project_type} />
              <Fact label="Location" value={project.location} />
              <Fact label="Status" value={project.featured ? "Featured story" : "Published story"} />
            </div>
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
              <video className="absolute inset-0 h-full w-full object-cover" controls muted playsInline src={hero.url} />
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

      <section className="section-shell py-20">
        <div className="grid gap-5 lg:grid-cols-2">
          <StoryBlock title="Project Summary" text={project.summary ?? project.project_intent} />
          <StoryBlock title="Client Goal" text={project.client_goal} />
          <StoryBlock title="Project Pressure" text={joinSignals(project.project_pressures) ?? project.stakes} />
          <StoryBlock title="Construction Challenge" text={project.challenge} />
          <StoryBlock title="Delivery Approach" text={project.delivery_approach} />
          <StoryBlock title="Built Outcome" text={joinSignals(project.built_outcomes) ?? project.built_outcome} wide />
        </div>
      </section>

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
                      <video className="absolute inset-0 h-full w-full object-cover" controls muted playsInline src={media.url} />
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
      <p className="mt-2 text-xl font-black">{value || "Not listed"}</p>
    </div>
  );
}

function StoryBlock({ title, text, wide = false }: { title: string; text: string | null; wide?: boolean }) {
  return (
    <article className={`border border-ink/12 bg-white p-7 ${wide ? "lg:col-span-2" : ""}`}>
      <p className="text-sm font-black uppercase tracking-[0.12em] text-brand-red">{title}</p>
      <p className="mt-4 text-lg leading-8 text-steel">
        {text || "This part of the project story is being prepared."}
      </p>
    </article>
  );
}

function joinSignals(items: string[] | null) {
  return items && items.length > 0 ? items.join(", ") : null;
}
