import Link from "next/link";
import { ArrowUpRight, Building2, Factory, Store, UsersRound } from "lucide-react";
import { FinalCta } from "@/components/marketing/final-cta";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { PageHero } from "@/components/marketing/page-hero";
import { getProjectCategories } from "@/lib/supabase/public-data";

const stakes = [
  {
    title: "Customer-facing space",
    text: "Opening dates, guest flow, finish durability, staff movement, and brand experience all sit behind the scope.",
  },
  {
    title: "Operational space",
    text: "Movement, storage, safety, equipment, access, and daily productivity matter as much as the square footage.",
  },
  {
    title: "Site-driven work",
    text: "Existing conditions, utilities, city processes, weather, sequencing, and trade availability shape the path forward.",
  },
];

const buyerPaths = [
  {
    icon: Store,
    title: "Owners",
    text: "Move from business idea to usable space with better clarity around budget, schedule, and project readiness.",
  },
  {
    icon: UsersRound,
    title: "Operators",
    text: "Build spaces that support staff flow, customer experience, production needs, and daily business function.",
  },
  {
    icon: Factory,
    title: "Developers",
    text: "Work with a construction partner thinking about site realities, turnover, market readiness, and coordination.",
  },
  {
    icon: Building2,
    title: "Architects",
    text: "Partner with a field-minded team that respects design intent and understands constructability pressure.",
  },
];

export default async function WhatWeBuildPage() {
  const categories = await getProjectCategories();

  return (
    <MarketingShell>
      <PageHero
        eyebrow="What We Build"
        title="Commercial environments built around business use."
        copy="Grandvista builds spaces where businesses operate, serve customers, move products, support teams, and prepare for growth. The work starts with a construction scope, but the pressure behind it is business-critical."
        primaryHref="/how-we-work"
        primaryLabel="See How We Work"
        secondaryHref="/start-a-project"
        secondaryLabel="Discuss Your Build"
        stats={[
          { label: "Work Type", value: "Commercial spaces" },
          { label: "Focus", value: "Use, flow, readiness" },
        ]}
      />

      <section className="section-shell py-20">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="eyebrow">Build Categories</p>
            <h2 className="mt-4 max-w-3xl text-4xl font-black leading-tight sm:text-5xl">
              Work organized by the business purpose behind the space.
            </h2>
          </div>
          <p className="max-w-md leading-7 text-steel">
            Each category is designed to grow into project stories, coordination notes, and stronger
            SEO pages as Grandvista builds proof.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => (
            <article key={category.slug} className="group border border-ink/12 bg-white p-7">
              <Building2 className="text-brand-red" size={26} />
              <h3 className="mt-6 text-2xl font-black leading-tight">{category.title}</h3>
              <p className="mt-4 min-h-28 leading-7 text-steel">{category.summary}</p>
              <Link
                href="/start-a-project"
                className="mt-6 inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.08em] text-navy transition group-hover:text-brand-red"
              >
                Talk through this scope <ArrowUpRight size={16} />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-ink/10 bg-white py-20">
        <div className="section-shell grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="eyebrow">What Is At Stake</p>
            <h2 className="mt-4 text-4xl font-black leading-tight">
              The label is never the whole project.
            </h2>
            <p className="mt-5 leading-8 text-steel">
              A serious commercial builder should understand the pressure behind the work before
              talking only about labor, materials, and finish schedules.
            </p>
          </div>
          <div className="grid gap-4">
            {stakes.map((item) => (
              <article key={item.title} className="border-l-4 border-brand-red bg-warm-white p-6">
                <h3 className="text-2xl font-black">{item.title}</h3>
                <p className="mt-3 leading-7 text-steel">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell py-20">
        <p className="eyebrow">Buyer Pathways</p>
        <h2 className="mt-4 max-w-3xl text-4xl font-black leading-tight sm:text-5xl">
          Different buyers bring different pressure.
        </h2>
        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {buyerPaths.map((path) => (
            <article key={path.title} className="border border-ink/12 bg-white p-6">
              <path.icon className="text-brand-red" size={24} />
              <h3 className="mt-6 text-xl font-black">{path.title}</h3>
              <p className="mt-4 leading-7 text-steel">{path.text}</p>
            </article>
          ))}
        </div>
      </section>

      <FinalCta
        title="Now see how the work gets managed."
        copy="The type of project matters, but confidence comes from how planning, communication, field coordination, and turnover are handled."
        primaryHref="/how-we-work"
        primaryLabel="See How We Work"
        secondaryHref="/project-stories"
        secondaryLabel="Explore Project Stories"
      />
    </MarketingShell>
  );
}
