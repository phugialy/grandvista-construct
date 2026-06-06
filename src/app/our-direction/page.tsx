import { BarChart3, Handshake, Layers3, ShieldCheck } from "lucide-react";
import { FinalCta } from "@/components/marketing/final-cta";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { PageHero } from "@/components/marketing/page-hero";
import { VisionImageRail } from "@/components/marketing/vision-image-rail";
import { getSectionPrimaryMedia, getSiteSections } from "@/lib/supabase/public-data";

const today = [
  "Commercial interiors",
  "Business build-outs",
  "Operational spaces",
  "Building improvements",
  "Ground-up opportunities",
];

const tomorrow = [
  "Larger commercial environments",
  "Corporate spaces",
  "Industrial projects",
  "More technical scopes",
  "Stronger systems and partnerships",
];

const standards = [
  {
    icon: Layers3,
    title: "Documentation habits",
    text: "Better project information, clearer records, and stronger handoff discipline support larger responsibility.",
  },
  {
    icon: Handshake,
    title: "Partnership depth",
    text: "Growth depends on owners, architects, developers, trade partners, and teams that can work with trust.",
  },
  {
    icon: ShieldCheck,
    title: "Field standards",
    text: "Safety, quality awareness, site accountability, and turnover expectations need to scale with the company.",
  },
  {
    icon: BarChart3,
    title: "Preconstruction thinking",
    text: "Larger work requires better planning before the project is under field pressure.",
  },
];

export default async function OurDirectionPage() {
  const sections = await getSiteSections();
  const heroSection = sections["our-direction.hero"];
  const directionMedia =
    heroSection?.section_media.length && heroSection.content_source !== "fallback"
      ? heroSection.section_media
      : [];

  return (
    <MarketingShell>
      <PageHero
        eyebrow="Our Direction"
        title={heroSection?.headline ?? "Built for today's commercial projects. Structured for tomorrow's growth."}
        copy={
          heroSection?.body ??
          "Grandvista is building more than a project list. The company is building the systems, partnerships, documentation habits, and field discipline required for larger commercial, corporate, industrial, and technically demanding environments."
        }
        primaryHref="/company"
        primaryLabel="Learn About the Company"
        secondaryHref="/start-a-project"
        secondaryLabel="Start a Project"
        stats={[
          { label: "Today", value: "Commercial focus" },
          { label: "Tomorrow", value: "Larger responsibility" },
        ]}
        visualMedia={getSectionPrimaryMedia(heroSection)}
      />

      <VisionImageRail media={directionMedia} />

      <section className="section-shell py-20">
        <div className="grid gap-8 lg:grid-cols-2">
          <article className="border border-ink/12 bg-white p-8">
            <p className="eyebrow">Today</p>
            <h2 className="mt-4 text-4xl font-black leading-tight">
              The present work builds the company&apos;s foundation.
            </h2>
            <div className="mt-8 grid gap-3">
              {today.map((item) => (
                <div key={item} className="border-l-4 border-brand-red bg-warm-white p-4 font-black">
                  {item}
                </div>
              ))}
            </div>
          </article>
          <article className="border border-ink/12 bg-ink p-8 text-white">
            <p className="eyebrow">Tomorrow</p>
            <h2 className="mt-4 text-4xl font-black leading-tight">
              The direction is larger commercial responsibility.
            </h2>
            <div className="mt-8 grid gap-3">
              {tomorrow.map((item) => (
                <div key={item} className="border-l-4 border-brand-red bg-white/8 p-4 font-black">
                  {item}
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="border-y border-ink/10 bg-white py-20">
        <div className="section-shell">
          <p className="eyebrow">Growth Standards</p>
          <h2 className="mt-4 max-w-3xl text-4xl font-black leading-tight sm:text-5xl">
            Ambition needs operating standards behind it.
          </h2>
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {standards.map((standard) => (
              <article key={standard.title} className="bg-warm-white p-6">
                <standard.icon className="text-brand-red" size={26} />
                <h3 className="mt-6 text-xl font-black">{standard.title}</h3>
                <p className="mt-4 leading-7 text-steel">{standard.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell py-20">
        <div className="border-l-4 border-brand-red bg-white p-8">
          <p className="eyebrow">Vision Without Overclaiming</p>
          <p className="mt-5 max-w-4xl text-3xl font-black leading-tight">
            We are not building a company around one project type. We are building the discipline
            to take on larger responsibility over time.
          </p>
          <p className="mt-6 max-w-3xl leading-8 text-steel">
            That means stronger documentation, stronger subcontractor relationships, clearer
            preconstruction habits, and field standards that can support the next stage of work.
          </p>
        </div>
      </section>

      <FinalCta
        title="The company story should feel grounded and serious."
        copy="The next page explains who Grandvista is, what the company stands for, and why the growth direction matters."
        primaryHref="/company"
        primaryLabel="Learn About Grandvista"
        secondaryHref="/start-a-project"
        secondaryLabel="Start a Project"
      />
    </MarketingShell>
  );
}
