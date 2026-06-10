import type { Metadata } from "next";
import { AlertTriangle, ClipboardCheck, HardHat, MessageSquareText } from "lucide-react";
import { FinalCta } from "@/components/marketing/final-cta";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { PageHero } from "@/components/marketing/page-hero";
import { ProcessTree } from "@/components/marketing/process-tree";
import { processWorkflowStages } from "@/lib/site-content";
import { getSectionPrimaryMedia, getSiteSections } from "@/lib/supabase/public-data";

export const metadata: Metadata = {
  title: "How We Work | Construction Process | Grandvista",
  description:
    "Grandvista's 9-stage process covers project discovery through turnover discipline. Construction is built in the field, but won in the planning.",
  openGraph: {
    title: "How We Work | Construction Process | Grandvista",
    description:
      "Grandvista's 9-stage process covers project discovery through turnover discipline. Construction is built in the field, but won in the planning.",
    url: "https://grandvista-construction.com/how-we-work",
    siteName: "Grandvista Construction",
    type: "website",
  },
};

const risks = [
  "Scope gaps before pricing",
  "Permit or inspection timing",
  "Trade overlap and sequencing",
  "Material lead times",
  "Owner decision points",
  "Field conditions that change the plan",
];

const communication = [
  {
    title: "Clear project conversations",
    text: "Before work accelerates, Grandvista works to understand the business goal, stage, scope, and constraints.",
  },
  {
    title: "Practical field updates",
    text: "The communication standard should make schedule, site conditions, and coordination needs easier to understand.",
  },
  {
    title: "Turnover expectations",
    text: "Completion is treated as the moment a space is ready for its next business purpose, not just the end of construction activity.",
  },
];

const audiences = [
  "Owners get clearer project readiness.",
  "Architects get design intent respected in the field.",
  "Developers get a partner thinking about site, schedule, and turnover.",
  "Subcontractors get cleaner coordination and fewer avoidable surprises.",
];

export default async function HowWeWorkPage() {
  const sections = await getSiteSections();
  const heroSection = sections["how-we-work.hero"];
  const processStages = processWorkflowStages.map((stage) => {
    const stageSection = sections[stage.sectionKey];

    return {
      media: getSectionPrimaryMedia(stageSection),
      text: stageSection?.body ?? stage.text,
      title: stageSection?.headline ?? stage.title,
    };
  });

  return (
    <MarketingShell>
      <PageHero
        eyebrow="How We Work"
        title={heroSection?.headline ?? "Construction is built in the field, but won in the planning."}
        copy={
          heroSection?.body ??
          "Grandvista's process is designed to create confidence before the first trade mobilizes: clearer scope, better risk awareness, field accountability, and owner-focused communication."
        }
        primaryHref="/project-stories"
        primaryLabel="Explore Project Stories"
        secondaryHref="/start-a-project"
        secondaryLabel="Start a Project"
        stats={[
          { label: "Process", value: "Planning to turnover" },
          { label: "Standard", value: "Accountable execution" },
        ]}
        visualMedia={getSectionPrimaryMedia(heroSection)}
      />

      <ProcessTree stages={processStages} />

      <section className="bg-white py-20">
        <div className="section-shell grid gap-10 lg:grid-cols-[1fr_1fr]">
          <div className="border-t-4 border-brand-red bg-warm-white p-8">
            <AlertTriangle className="text-brand-red" size={28} />
            <h2 className="mt-6 text-4xl font-black leading-tight">Risk is easier to manage when it is named early.</h2>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {risks.map((risk) => (
                <div key={risk} className="border border-ink/10 bg-white p-4 font-bold text-ink">
                  {risk}
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-4">
            {communication.map((item) => (
              <article key={item.title} className="border border-ink/12 bg-white p-6">
                <MessageSquareText className="text-brand-red" size={24} />
                <h3 className="mt-5 text-2xl font-black">{item.title}</h3>
                <p className="mt-3 leading-7 text-steel">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell py-20">
        <p className="eyebrow">Who The Process Helps</p>
        <h2 className="mt-4 max-w-3xl text-4xl font-black leading-tight">
          Good coordination makes every stakeholder feel less exposed.
        </h2>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {audiences.map((audience, index) => (
            <article key={audience} className="flex gap-5 border border-ink/12 bg-white p-6">
              {index % 2 === 0 ? (
                <ClipboardCheck className="shrink-0 text-brand-red" size={24} />
              ) : (
                <HardHat className="shrink-0 text-brand-red" size={24} />
              )}
              <p className="text-xl font-black leading-snug">{audience}</p>
            </article>
          ))}
        </div>
      </section>

      <FinalCta
        title="Now see how project proof should be presented."
        copy="Grandvista's work should not live as a loose gallery. Each project should explain intent, pressure, challenge, approach, and outcome."
        primaryHref="/project-stories"
        primaryLabel="Explore Project Stories"
        secondaryHref="/what-we-build"
        secondaryLabel="Back to What We Build"
      />
    </MarketingShell>
  );
}
