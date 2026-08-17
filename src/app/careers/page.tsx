import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, UserPlus } from "lucide-react";
import { FinalCta } from "@/components/marketing/final-cta";
import { JsonLd } from "@/components/marketing/json-ld";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { PageHero } from "@/components/marketing/page-hero";
import { breadcrumbJsonLd } from "@/lib/schema";
import { getPublishedJobPostings } from "@/lib/supabase/public-data";

export const metadata: Metadata = {
  title: "Careers | Join Grandvista Construction",
  description:
    "Careers at Grandvista Construction. Build commercial and industrial projects across Plano, Dallas, and Fort Worth as we grow into larger work.",
  alternates: {
    canonical: "/careers",
  },
  openGraph: {
    title: "Careers | Join Grandvista Construction",
    description:
      "Careers at Grandvista Construction. Build commercial and industrial projects across Plano, Dallas, and Fort Worth as we grow into larger work.",
    url: "https://grandvista-construction.com/careers",
    siteName: "Grandvista Construction",
    type: "website",
  },
};

const values = [
  {
    title: "Field-first",
    text: "Coordination decisions get made close to the work, not three layers removed from it.",
  },
  {
    title: "Plan hard",
    text: "Problems get caught in planning meetings, not discovered mid-inspection.",
  },
  {
    title: "Room to grow",
    text: "A growing project pipeline means more scope, sooner, for people who are ready for it.",
  },
];

const hiringSteps = [
  {
    step: "01",
    title: "Apply",
    text: "Submit your resume directly on the role. Takes a few minutes, no login required.",
  },
  {
    step: "02",
    title: "We review",
    text: "A real person on our team looks at every application against the role.",
  },
  {
    step: "03",
    title: "A conversation",
    text: "If it's a fit, we reach out directly to set up a real conversation, not a form letter.",
  },
  {
    step: "04",
    title: "Decision",
    text: "You hear from us either way — an offer, or a straight answer if it isn't a fit right now.",
  },
];

export default async function CareersPage() {
  const postings = await getPublishedJobPostings();

  return (
    <MarketingShell>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", url: "https://grandvista-construction.com" },
            { name: "Careers", url: "https://grandvista-construction.com/careers" },
          ]) as Record<string, unknown>,
        ]}
      />

      <PageHero
        copy="Every project here ends with something standing. We're growing into bigger commercial and industrial work across DFW, and we need people who plan hard and hold the field accountable to it."
        eyebrow="Careers"
        primaryHref="/careers/login"
        primaryLabel="Apply"
        secondaryHref="/company"
        secondaryLabel="About Grandvista"
        stats={[
          { label: "Where", value: "Plano, Dallas, Fort Worth" },
          { label: "Focus", value: "Commercial & industrial" },
        ]}
        title="Build something you can point at"
        visualMedia={null}
      />

      <section className="border-y border-ink/10 bg-white py-20">
        <div className="section-shell grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="eyebrow">Where We&apos;re Headed</p>
            <h2 className="mt-4 text-4xl font-black leading-tight">
              Bigger work. Same discipline.
            </h2>
            <p className="mt-5 leading-8 text-steel">
              We&apos;re building toward larger commercial, corporate, and industrial environments
              &mdash; not by cutting corners to grow faster, but by getting stronger at the
              fundamentals. That&apos;s the real reason to build a career here instead of somewhere
              bigger: you&apos;re joining while the standard is still being set, not maintaining one
              that&apos;s already fixed.
            </p>
          </div>
          <div className="grid gap-4">
            {values.map((item) => (
              <article key={item.title} className="border-l-4 border-brand-red bg-warm-white p-6">
                <h3 className="text-2xl font-black">{item.title}</h3>
                <p className="mt-3 leading-7 text-steel">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell py-20" id="open-roles">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="eyebrow">Open Roles</p>
            <h2 className="mt-4 max-w-3xl text-4xl font-black leading-tight sm:text-5xl">
              Where we need you right now.
            </h2>
          </div>
          <p className="max-w-md leading-7 text-steel">
            Every posting we publish is live and current &mdash; nothing sits stale here.
          </p>
        </div>

        {postings.length > 0 ? (
          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {postings.map((posting) => (
              <article className="flex flex-col gap-4 border border-ink/12 bg-white p-6" key={posting.id}>
                <div className="flex flex-wrap gap-2">
                  {posting.employment_type ? (
                    <span className="border border-ink/12 px-3 py-1 text-[0.62rem] font-black uppercase tracking-[0.1em] text-navy">
                      {posting.employment_type}
                    </span>
                  ) : null}
                  {posting.location ? (
                    <span className="border border-ink/12 px-3 py-1 text-[0.62rem] font-black uppercase tracking-[0.1em] text-navy">
                      {posting.location}
                    </span>
                  ) : null}
                </div>
                <h3 className="text-2xl font-black leading-tight">{posting.title}</h3>
                <p className="flex-1 leading-7 text-steel">{posting.summary}</p>
                <Link
                  className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.1em] text-brand-red hover:text-navy"
                  href={`/careers/${posting.slug}`}
                >
                  View &amp; Apply <ArrowUpRight size={16} />
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-12 border border-ink/12 bg-white p-8">
            <p className="text-sm font-black uppercase tracking-[0.14em] text-brand-red">
              Currently Not Available
            </p>
            <h3 className="mt-4 text-3xl font-black leading-tight">
              We&apos;re between openings right now.
            </h3>
            <p className="mt-4 max-w-3xl leading-8 text-steel">
              New openings go up here as active projects call for them. Leave your profile with
              us and we&apos;ll reach out when something opens that fits.
            </p>
            <Link
              className="mt-7 inline-flex items-center gap-2 bg-navy px-5 py-4 text-sm font-black uppercase tracking-[0.08em] text-white transition hover:bg-brand-red"
              href="/careers/signup"
            >
              <UserPlus size={16} /> Create Your Profile
            </Link>
          </div>
        )}
      </section>

      <section className="border-y border-ink/10 bg-white py-20">
        <div className="section-shell">
          <p className="eyebrow">How Hiring Works</p>
          <h2 className="mt-4 max-w-3xl text-4xl font-black leading-tight sm:text-5xl">
            No black box. Here&apos;s the process.
          </h2>
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {hiringSteps.map((item) => (
              <article key={item.step} className="border border-ink/12 bg-warm-white p-6">
                <p className="gv-display text-2xl leading-none text-brand-red">{item.step}</p>
                <h3 className="mt-5 text-xl font-black">{item.title}</h3>
                <p className="mt-4 leading-7 text-steel">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <FinalCta
        copy="New roles get posted here as our project pipeline calls for them. Create a profile now and we'll keep you in mind for what's coming."
        primaryHref="/careers/signup"
        primaryLabel="Create Your Profile"
        secondaryHref="/company"
        secondaryLabel="About Grandvista"
        title="Don't see the right role yet?"
      />
    </MarketingShell>
  );
}
