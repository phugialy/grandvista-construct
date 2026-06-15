import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Building2, ClipboardCheck, Compass, ShieldCheck } from "lucide-react";
import { FinalCta } from "@/components/marketing/final-cta";
import { ManagedMedia } from "@/components/marketing/managed-media";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import {
  buildCategories,
  confidenceAudiences,
  processPillars,
} from "@/lib/site-content";
import { getSectionPrimaryMedia, getSiteSections } from "@/lib/supabase/public-data";

export const metadata: Metadata = {
  title: "Important Projects Deserve a Builder With Direction | Grandvista",
  description:
    "Grandvista helps commercial property owners, operators, and developers move from business need to usable built environment through clear planning, field coordination, and accountable execution.",
  openGraph: {
    title: "Important Projects Deserve a Builder With Direction | Grandvista",
    description:
      "Grandvista helps commercial property owners, operators, and developers move from business need to usable built environment through clear planning, field coordination, and accountable execution.",
    url: "https://grandvista-construction.com",
    siteName: "Grandvista Construction",
    type: "website",
  },
};

const proofPoints = [
  { label: "Audience", value: "Owners, operators, developers" },
  { label: "Focus", value: "Commercial environments" },
  { label: "Standard", value: "Planning, field discipline, turnover" },
];

export default async function Home() {
  const sections = await getSiteSections();
  const heroSection = sections["home.hero"];
  const heroMedia = getSectionPrimaryMedia(heroSection);

  return (
    <MarketingShell>
      <section className="relative isolate min-h-[calc(100vh-5rem)] overflow-hidden bg-ink text-white">
        {heroMedia ? (
          <ManagedMedia
            altFallback={heroSection?.label ?? "Grandvista hero media"}
            className="object-cover opacity-36"
            media={heroMedia}
            priority
            sizes="100vw"
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(8,9,106,0.78),transparent_35%),linear-gradient(135deg,#10131a,#08096a)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/86 to-navy/68" />
        <div className="absolute inset-0 gv-grid-dark opacity-70" />
        <div className="pointer-events-none absolute right-[-2vw] top-20 hidden text-[31vw] leading-none text-white/[0.035] lg:block gv-display">
          GV
        </div>
        <div className="section-shell relative z-10 grid min-h-[calc(100vh-5rem)] items-end pb-12 pt-16">
          <div className="max-w-5xl">
            <p className="eyebrow mb-7">Commercial general contractor - Texas</p>
            <h1 className="gv-display max-w-4xl text-[4.5rem] leading-[0.9] text-white sm:text-[7rem] lg:text-[9rem]">
              America&apos;s
              <span className="block text-transparent [-webkit-text-stroke:2px_var(--red)]">
                Commercial
              </span>
              Builder<span className="text-brand-red">.</span>
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-8 text-white/74">
              {heroSection?.body ??
                "A growth-minded commercial construction partner building business environments with clear planning, field coordination, and accountable execution."}
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/start-a-project"
                className="inline-flex h-14 items-center justify-center gap-2 bg-brand-red px-8 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-white hover:text-navy"
              >
                Start a Project <ArrowUpRight size={18} />
              </Link>
              <Link
                href="/what-we-build"
                className="inline-flex h-14 items-center justify-center border border-white/22 px-8 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:border-brand-red hover:text-brand-red"
              >
                What We Build
              </Link>
            </div>
            <div className="mt-14 grid max-w-3xl gap-0 border-y border-white/12 sm:grid-cols-3">
              {[
                ["09", "Build Categories"],
                ["09", "Step Delivery Process"],
                ["TX", "Plano - Dallas - Houston"],
              ].map(([value, label]) => (
                <div key={label} className="border-white/12 py-5 sm:border-r sm:px-5 first:sm:pl-0 last:sm:border-r-0">
                  <p className="gv-display text-4xl text-brand-red">{value}</p>
                  <p className="mt-1 text-[0.68rem] font-black uppercase tracking-[0.16em] text-white/52">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell py-20">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <p className="eyebrow">Confidence layer</p>
            <h2 className="mt-4 max-w-xl text-4xl font-black leading-tight sm:text-5xl">
              We understand what is at stake behind every project.
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {confidenceAudiences.map((item) => (
              <article key={item.audience} className="border border-ink/12 bg-white p-6">
                <p className="text-sm font-black uppercase tracking-[0.12em] text-navy">
                  {item.audience}
                </p>
                <h3 className="mt-4 text-xl font-black leading-snug">{item.question}</h3>
                <p className="mt-4 leading-7 text-steel">{item.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-ink/10 bg-white py-18">
        <div className="section-shell grid gap-5 md:grid-cols-3">
          {proofPoints.map((point) => (
            <div key={point.label} className="border-l-4 border-brand-red bg-warm-white p-6">
              <p className="text-sm font-black uppercase tracking-[0.12em] text-steel">
                {point.label}
              </p>
              <p className="mt-3 text-2xl font-black text-ink">{point.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section-shell py-20">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="eyebrow">What We Build</p>
            <h2 className="mt-4 max-w-2xl text-4xl font-black leading-tight sm:text-5xl">
              Commercial environments with business purpose.
            </h2>
          </div>
          <Link href="/what-we-build" className="font-black text-navy hover:text-brand-red">
            Explore build categories
          </Link>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {buildCategories.map((category) => (
            <article key={category.title} className="min-h-64 border border-ink/12 bg-white p-6">
              <Building2 className="text-brand-red" size={24} />
              <h3 className="mt-6 text-xl font-black leading-tight">{category.title}</h3>
              <p className="mt-4 text-sm leading-6 text-steel">{category.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-ink py-20 text-white">
        <div className="section-shell grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="eyebrow">How We Work</p>
            <h2 className="gv-display mt-4 text-6xl leading-[0.95] sm:text-7xl">
              Nine steps.
              <br />
              Zero guesswork.
            </h2>
            <p className="mt-6 leading-8 text-white/72">
              Grandvista&apos;s process should make owners feel safer, architects feel respected,
              developers feel heard, and subcontractors feel coordinated.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {processPillars.map((pillar, index) => (
              <div key={pillar} className="border border-white/14 p-5 transition hover:border-brand-red hover:bg-white/5">
                <span className="gv-display text-4xl text-brand-red">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="mt-3 font-black">{pillar}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell py-20">
        <div className="grid gap-8 lg:grid-cols-3">
          {[
            {
              icon: Compass,
              title: "Built for What Comes Next",
              text: "The site frames Grandvista as a company building systems and partnerships for larger commercial responsibility.",
            },
            {
              icon: ClipboardCheck,
              title: "Project Stories Over Galleries",
              text: "Every project can explain intent, challenge, approach, and outcome instead of sitting as a loose photo set.",
            },
            {
              icon: ShieldCheck,
              title: "Scalable From Day One",
              text: "Public pages stay cached and media stays CDN-ready so the site can grow without stressing the backend.",
            },
          ].map((item) => (
            <article key={item.title} className="border-t-4 border-navy bg-white p-7">
              <item.icon className="text-brand-red" size={26} />
              <h3 className="mt-6 text-2xl font-black">{item.title}</h3>
              <p className="mt-4 leading-7 text-steel">{item.text}</p>
            </article>
          ))}
        </div>
      </section>
      <FinalCta
        title="Bring the project behind the project into focus."
        copy="Start with what the space needs to make possible, then build toward scope, schedule, coordination, and turnover with more clarity."
        primaryHref="/start-a-project"
        primaryLabel="Start a Project Conversation"
        secondaryHref="/what-we-build"
        secondaryLabel="Explore What We Build"
      />
    </MarketingShell>
  );
}
