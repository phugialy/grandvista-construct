import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, FileText } from "lucide-react";
import { MarketingShell } from "@/components/marketing/marketing-shell";
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
  eyebrow = "Article Space",
  posts,
  settings,
  title = "Construction thinking for business spaces",
}: BlogWidgetPageProps) {
  const enabled = Boolean(settings?.enabled);
  const embedContainerId = settings?.embed_container_id?.trim() || "soro-blog";
  const embedScriptUrl = settings?.embed_script_url?.trim() ?? "";
  const showEmbed = enabled && Boolean(embedScriptUrl);

  return (
    <MarketingShell>
      <section className="section-shell py-14 sm:py-16">
        <div className="grid gap-8 lg:grid-cols-[0.86fr_0.44fr] lg:items-end">
          <div className="max-w-4xl">
            <p className="eyebrow">{eyebrow}</p>
            <h1 className="gv-display mt-4 max-w-4xl text-5xl leading-[0.92] text-navy sm:text-6xl lg:text-7xl">
              {title}
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-steel sm:text-lg">{copy}</p>
          </div>
          <Link
            href="/start-a-project"
            className="inline-flex w-fit items-center gap-2 text-sm font-black uppercase tracking-[0.12em] text-brand-red hover:text-navy lg:justify-self-end"
          >
            Talk through a project <ArrowUpRight size={16} />
          </Link>
        </div>

        {showEmbed ? (
          <div className="grandvista-soro-frame mt-12 border border-ink/12 bg-white p-4 shadow-sm sm:p-6 lg:p-8">
            <SoroBlogEmbed containerId={embedContainerId} scriptUrl={embedScriptUrl} />
          </div>
        ) : null}

        {!showEmbed && posts.length > 0 ? (
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
        ) : null}

        {!showEmbed && posts.length === 0 ? (
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
        ) : null}
      </section>
    </MarketingShell>
  );
}
