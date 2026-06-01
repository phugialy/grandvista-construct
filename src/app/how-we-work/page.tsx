import { AlertTriangle, ClipboardCheck, HardHat, MessageSquareText } from "lucide-react";
import { FinalCta } from "@/components/marketing/final-cta";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { PageHero } from "@/components/marketing/page-hero";
import { processPillars } from "@/lib/site-content";

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

export default function HowWeWorkPage() {
  return (
    <MarketingShell>
      <PageHero
        eyebrow="How We Work"
        title="Construction is built in the field, but won in the planning."
        copy="Grandvista's process is designed to create confidence before the first trade mobilizes: clearer scope, better risk awareness, field accountability, and owner-focused communication."
        primaryHref="/project-stories"
        primaryLabel="Explore Project Stories"
        secondaryHref="/start-a-project"
        secondaryLabel="Start a Project"
        stats={[
          { label: "Process", value: "Planning to turnover" },
          { label: "Standard", value: "Accountable execution" },
        ]}
      />

      <section className="section-shell py-20">
        <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr]">
          <div>
            <p className="eyebrow">Delivery Workflow</p>
            <h2 className="mt-4 text-4xl font-black leading-tight">
              A serious project needs a visible operating rhythm.
            </h2>
            <p className="mt-5 leading-8 text-steel">
              This is the structure behind the build: discovery, planning, readiness, field
              execution, and turnover discipline.
            </p>
          </div>
          <div className="grid gap-3">
            {processPillars.map((pillar, index) => (
              <article key={pillar} className="grid gap-4 border border-ink/12 bg-white p-5 sm:grid-cols-[72px_1fr]">
                <span className="flex h-14 w-14 items-center justify-center bg-navy text-sm font-black text-white">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-2xl font-black">{pillar}</h3>
                  <p className="mt-2 leading-7 text-steel">
                    {getPillarCopy(pillar)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

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

function getPillarCopy(pillar: string) {
  const copy: Record<string, string> = {
    "Project Discovery": "Clarify the business need, decision stage, site context, and the practical goal behind the project.",
    "Scope Intelligence": "Identify what the project actually requires before cost, schedule, and field pressure start moving.",
    "Budget Awareness": "Surface likely cost risks early so owners can make practical choices with better context.",
    "Schedule Planning": "Think through timing, dependencies, long-lead items, and project-stage reality before execution.",
    "Permit and Inspection Readiness": "Approach the work with awareness of city process, code requirements, and documentation needs.",
    "Trade Coordination": "Manage moving parts between trades, materials, access, sequencing, and site constraints.",
    "Field Accountability": "Stay close to field activity, owner priorities, conditions, and the schedule pressure that matters.",
    "Owner Communication": "Keep conversations clear enough that issues, changes, and decisions are handled before they drift.",
    "Turnover Discipline": "Close the work with the next purpose of the space in mind, not just the last construction task.",
  };

  return copy[pillar] ?? "Support the work with clearer planning, coordination, and accountable execution.";
}
