import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, FileText } from "lucide-react";
import { FinalCta } from "@/components/marketing/final-cta";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { PageHero } from "@/components/marketing/page-hero";
import { SoroBlogEmbed } from "@/components/marketing/soro-blog-embed";
import type { BlogIntegrationSettings, PublishedBlogPost } from "@/lib/supabase/public-data";

type BlogWidgetPageProps = {
  settings: BlogIntegrationSettings | null;
  posts: PublishedBlogPost[];
  eyebrow?: string;
  title?: string;
  copy?: string;
};

export function BlogWidgetPage({
  copy = "Notes on planning, project readiness, field coordination, and the decisions that help commercial spaces move from idea to usable built environment.",
  eyebrow = "Insights",
  posts,
  settings,
  title = "Construction thinking for business spaces.",
}: BlogWidgetPageProps) {
  const enabled = Boolean(settings?.enabled);
  const embedContainerId = settings?.embed_container_id?.trim() || "soro-blog";
  const embedScriptUrl = settings?.embed_script_url?.trim() ?? "";
  const showEmbed = enabled && Boolean(embedScriptUrl);

  return (
    <MarketingShell>
      <PageHero
        eyebrow={eyebrow}
        title={title}
        copy={copy}
        primaryHref="/start-a-project"
        primaryLabel="Start a Project Conversation"
        secondaryHref="/project-stories"
        secondaryLabel="See Project Stories"
        stats={[
          { label: "Focus", value: "Useful project context" },
          { label: "Format", value: "Brief notes over noise" },
        ]}
      />

      <section className="section-shell py-20">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="eyebrow">Article Space</p>
            <h2 className="gv-display mt-4 max-w-4xl text-6xl leading-[0.92] text-navy sm:text-7xl">
              Built to support
              <br />
              better first calls
            </h2>
            <p className="mt-5 max-w-2xl leading-7 text-steel">
              This page is ready to receive approved articles from the admin blog widget workflow.
              The best posts should help owners, operators, architects, and project teams
              understand what matters before work is already moving.
            </p>
          </div>
          <Link
            href="/start-a-project"
            className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.12em] text-brand-red hover:text-navy"
          >
            Talk through a project <ArrowUpRight size={16} />
          </Link>
        </div>

        {showEmbed ? (
          <div className="mt-12 border border-ink/12 bg-white p-6">
            <SoroBlogEmbed containerId={embedContainerId} scriptUrl={embedScriptUrl} />
          </div>
        ) : null}

        {posts.length > 0 ? (
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {posts.map((post) => (
              <article
                className="group border border-ink/12 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                key={post.id}
              >
                <div className="relative min-h-56 overflow-hidden bg-ink p-6 text-white">
                  {post.hero_image_url ? (
                    <Image
                      alt={post.hero_image_alt ?? post.title}
                      className="object-cover opacity-74 transition duration-500 group-hover:scale-105 group-hover:opacity-88"
                      fill
                      sizes="(min-width: 1024px) 33vw, 100vw"
                      src={post.hero_image_url}
                    />
                  ) : (
                    <>
                      <FileText className="text-brand-red" size={30} />
                      <p className="mt-8 text-sm font-black uppercase tracking-[0.14em] text-white/60">
                        Grandvista Insight
                      </p>
                    </>
                  )}
                  <div className="absolute bottom-4 left-4 bg-navy px-3 py-2 text-[0.62rem] font-black uppercase tracking-[0.16em] text-white">
                    {(post.tags ?? [])[0] ?? "Construction Insight"}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="gv-display text-3xl leading-none text-navy">{post.title}</h3>
                  <p className="mt-5 min-h-24 text-sm leading-7 text-steel">
                    {post.excerpt ?? "A short construction note from Grandvista."}
                  </p>
                  <Link
                    className="mt-7 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-brand-red hover:text-navy"
                    href={`/insights/${post.slug}`}
                  >
                    Read Insight <ArrowUpRight size={14} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-12 border border-ink/12 bg-white p-8">
            <p className="text-sm font-black uppercase tracking-[0.14em] text-brand-red">
              {enabled ? "Ready for posts" : "Blog widget disabled"}
            </p>
            <h3 className="mt-4 text-3xl font-black leading-tight">
              Published articles will appear here once the team approves them.
            </h3>
            <p className="mt-4 max-w-3xl leading-8 text-steel">
              Soro or another content partner can feed drafts into the admin hub. Grandvista can
              review, publish, hide, or feature posts before they become public.
            </p>
          </div>
        )}
      </section>

      <FinalCta
        title="Have a project question behind the article?"
        copy="Use the project intake to share the context, stage, timeline, and practical decision you are trying to make next."
        primaryHref="/start-a-project"
        primaryLabel="Start a Project Conversation"
        secondaryHref="/how-we-work"
        secondaryLabel="See How We Work"
      />
    </MarketingShell>
  );
}
