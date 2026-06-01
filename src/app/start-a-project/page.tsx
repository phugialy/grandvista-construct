import { ClipboardCheck, FileSearch, MessageSquareText } from "lucide-react";
import { FinalCta } from "@/components/marketing/final-cta";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { PageHero } from "@/components/marketing/page-hero";
import { submitProjectInquiry } from "./actions";

const projectTypes = [
  "Commercial Interior",
  "Restaurant / Food Service",
  "Retail",
  "Salon / Wellness",
  "Medical / Office",
  "Warehouse / Industrial",
  "Ground-Up Construction",
  "Tilt-Wall / Shell",
  "Building Improvement",
  "Other Commercial Project",
];

const currentStages = [
  "Exploring Ideas",
  "Site Selected",
  "Plans in Progress",
  "Permit Stage",
  "Ready to Bid",
  "Ready to Build",
  "Existing Project Needs Help",
];

const timelineOptions = ["0-3 months", "3-6 months", "6-12 months", "12+ months"];

const budgetOptions = [
  "Under $100k",
  "$100k-$250k",
  "$250k-$500k",
  "$500k-$1M",
  "$1M+",
  "Not sure yet",
];

const fieldClass =
  "min-h-12 border border-ink/14 bg-white p-4 text-base text-ink outline-none transition placeholder:text-steel/70 focus:border-navy";

const nextSteps = [
  {
    icon: FileSearch,
    title: "Project review",
    text: "Grandvista reviews project type, location, stage, budget range, timeline, and current constraints.",
  },
  {
    icon: MessageSquareText,
    title: "Clarifying conversation",
    text: "The first conversation should tighten scope, risk, decision points, and what the space needs to make possible.",
  },
  {
    icon: ClipboardCheck,
    title: "Practical next step",
    text: "From there, the next move may be scope review, site conversation, plans discussion, or a more formal project path.",
  },
];

export default function StartProjectPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string }>;
}) {
  const statusPromise = searchParams ?? Promise.resolve({});

  return (
    <MarketingShell>
      <PageHero
        eyebrow="Start a Project"
        title="Start with the project behind the project."
        copy="This is not a free-estimate form. It is a project intake built to understand the business need, current stage, schedule pressure, budget context, and practical next decision."
        secondaryHref="/how-we-work"
        secondaryLabel="Review The Process"
        stats={[
          { label: "Captures", value: "Scope and stage" },
          { label: "Purpose", value: "Better first conversation" },
        ]}
      />

      <section className="section-shell grid gap-12 py-20 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="eyebrow">Start a Project</p>
          <h2 className="mt-4 text-5xl font-black leading-tight">Share the context that matters.</h2>
          <p className="mt-6 text-lg leading-8 text-steel">
            This form is structured to qualify serious commercial opportunities and help Grandvista
            understand project stage, scope, schedule, and risk before the first call.
          </p>
          <div className="mt-8 border-l-4 border-brand-red bg-white p-6">
            <p className="text-sm font-black uppercase tracking-[0.12em] text-navy">
              What this captures
            </p>
            <p className="mt-3 leading-7 text-steel">
              Project type, current stage, schedule, budget range, permit context, and the business
              need behind the work.
            </p>
          </div>
        </div>
        <form action={submitProjectInquiry} className="grid gap-4 border border-ink/12 bg-white p-6">
          <StatusMessage statusPromise={statusPromise} />
          <div className="grid gap-4 md:grid-cols-2">
            <input className={fieldClass} name="name" placeholder="Name" required />
            <input className={fieldClass} name="company" placeholder="Company" />
            <input className={fieldClass} name="email" placeholder="Email" required type="email" />
            <input className={fieldClass} name="phone" placeholder="Phone" type="tel" />
          </div>
          <input className={fieldClass} name="project_location" placeholder="Project location" />
          <select className={fieldClass} defaultValue="" name="project_type" required>
            <option value="" disabled>
              Project type
            </option>
            {projectTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <div className="grid gap-4 md:grid-cols-2">
            <select className={fieldClass} defaultValue="" name="construction_context">
              <option value="" disabled>
                New construction or existing space?
              </option>
              <option>New Construction</option>
              <option>Existing Space</option>
              <option>Not Sure Yet</option>
            </select>
            <select className={fieldClass} defaultValue="" name="current_stage">
              <option value="" disabled>
                Current stage
              </option>
              {currentStages.map((stage) => (
                <option key={stage}>{stage}</option>
              ))}
            </select>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <select className={fieldClass} defaultValue="" name="estimated_timeline">
              <option value="" disabled>
                Estimated timeline
              </option>
              {timelineOptions.map((timeline) => (
                <option key={timeline}>{timeline}</option>
              ))}
            </select>
            <select className={fieldClass} defaultValue="" name="estimated_budget_range">
              <option value="" disabled>
                Estimated budget range
              </option>
              {budgetOptions.map((budget) => (
                <option key={budget}>{budget}</option>
              ))}
            </select>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <select className={fieldClass} defaultValue="" name="architect_involved">
              <option value="" disabled>
                Architect/designer involved?
              </option>
              <option>Yes</option>
              <option>No</option>
              <option>In Progress</option>
              <option>Not Sure</option>
            </select>
            <select className={fieldClass} defaultValue="" name="permit_status">
              <option value="" disabled>
                Permit status
              </option>
              <option>Not Started</option>
              <option>In Progress</option>
              <option>Submitted</option>
              <option>Approved</option>
              <option>Not Sure</option>
            </select>
          </div>
          <textarea
            className={`${fieldClass} min-h-36 resize-y`}
            name="description"
            placeholder="Short project description"
          />
          <input name="utm_source" type="hidden" />
          <input name="utm_medium" type="hidden" />
          <input name="utm_campaign" type="hidden" />
          <button
            type="submit"
            className="bg-navy px-6 py-4 text-sm font-black uppercase tracking-[0.08em] text-white hover:bg-brand-red"
          >
            Submit Project Review
          </button>
        </form>
      </section>

      <section className="border-y border-ink/10 bg-white py-20">
        <div className="section-shell">
          <p className="eyebrow">What Happens Next</p>
          <h2 className="mt-4 max-w-3xl text-4xl font-black leading-tight sm:text-5xl">
            A stronger first conversation starts before the call.
          </h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {nextSteps.map((step) => (
              <article key={step.title} className="bg-warm-white p-7">
                <step.icon className="text-brand-red" size={26} />
                <h3 className="mt-6 text-2xl font-black">{step.title}</h3>
                <p className="mt-4 leading-7 text-steel">{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <FinalCta
        title="Still comparing how Grandvista thinks?"
        copy="Review the process and build categories before submitting if you need more context."
        primaryHref="/how-we-work"
        primaryLabel="See How We Work"
        secondaryHref="/what-we-build"
        secondaryLabel="What We Build"
      />
    </MarketingShell>
  );
}

async function StatusMessage({
  statusPromise,
}: {
  statusPromise: Promise<{ status?: string }>;
}) {
  const { status } = await statusPromise;

  if (!status) {
    return null;
  }

  if (status === "missing") {
    return (
      <p className="border border-brand-red/30 bg-brand-red/8 p-4 text-sm font-bold text-brand-red">
        Please include your name, email, and project type before submitting.
      </p>
    );
  }

  if (status === "error") {
    return (
      <p className="border border-brand-red/30 bg-brand-red/8 p-4 text-sm font-bold text-brand-red">
        Something went wrong while sending the inquiry. Please try again.
      </p>
    );
  }

  return null;
}
