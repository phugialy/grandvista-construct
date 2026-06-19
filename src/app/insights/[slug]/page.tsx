import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Suspense } from "react";
import { connection } from "next/server";
import { FinalCta } from "@/components/marketing/final-cta";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { stripHtml } from "@/lib/blog";
import { getPublishedBlogPostBySlug } from "@/lib/supabase/public-data";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  await connection();
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Insight Not Found | Grandvista",
    };
  }

  const title = post.seo_title ?? `${post.title} | Grandvista Insights`;
  const description =
    post.seo_description ?? post.excerpt ?? "Commercial construction insight from Grandvista Construction.";

  return {
    title,
    description,
    alternates: {
      canonical: `/insights/${post.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://grandvista-construction.com/insights/${post.slug}`,
      siteName: "Grandvista Construction",
      type: "article",
      images: post.hero_image_url ? [{ url: post.hero_image_url, alt: post.hero_image_alt ?? post.title }] : undefined,
    },
  };
}

export default function InsightPostPage({ params }: PageProps) {
  return (
    <Suspense fallback={null}>
      <InsightPostContent params={params} />
    </Suspense>
  );
}

async function InsightPostContent({ params }: PageProps) {
  await connection();
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const bodyText = stripHtml(post.body ?? post.excerpt ?? "");
  const paragraphs = bodyText
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <MarketingShell>
      <section className="bg-ink text-white">
        <div className="section-shell py-16">
          <Link
            href="/insights"
            className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.12em] text-white/64 hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to Insights
          </Link>
          <div className="mt-10 grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-end">
            <div>
              <p className="eyebrow">Grandvista Insight</p>
              <h1 className="mt-5 max-w-4xl text-4xl font-black leading-[0.98] sm:text-6xl">
                {post.title}
              </h1>
              {post.excerpt ? (
                <p className="mt-7 max-w-3xl text-lg leading-8 text-white/72">{post.excerpt}</p>
              ) : null}
              {(post.tags ?? []).length > 0 ? (
                <div className="mt-7 flex flex-wrap gap-2">
                  {(post.tags ?? []).map((tag) => (
                    <span
                      className="border border-white/16 px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-white/70"
                      key={tag}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="relative min-h-72 overflow-hidden border border-white/14 bg-[#151925]">
              {post.hero_image_url ? (
                <>
                  <Image
                    alt={post.hero_image_alt ?? post.title}
                    className="object-cover opacity-82"
                    fill
                    priority
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    src={post.hero_image_url}
                  />
                  <div className="absolute inset-0 bg-ink/28" />
                </>
              ) : (
                <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-80">
                  {Array.from({ length: 36 }).map((_, index) => (
                    <div key={index} className="border border-white/[0.035]" />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <article className="section-shell py-16">
        <div className="max-w-3xl">
          {paragraphs.length > 0 ? (
            paragraphs.map((paragraph) => (
              <p className="mb-7 text-lg leading-9 text-steel" key={paragraph}>
                {paragraph}
              </p>
            ))
          ) : (
            <p className="text-lg leading-9 text-steel">This insight is being prepared.</p>
          )}

          <Link
            href="/start-a-project"
            className="mt-6 inline-flex items-center gap-2 bg-brand-red px-5 py-4 text-sm font-black uppercase tracking-[0.08em] text-white hover:bg-navy"
          >
            Discuss a Similar Project <ArrowUpRight size={18} />
          </Link>
        </div>
      </article>

      <FinalCta
        title="Use the insight as a starting point."
        copy="Every project still needs its own context. Share the site, stage, schedule, and business goal so the next conversation starts with better information."
        primaryHref="/start-a-project"
        primaryLabel="Start a Project Conversation"
        secondaryHref="/project-stories"
        secondaryLabel="See Project Stories"
      />
    </MarketingShell>
  );
}
