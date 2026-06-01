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

export default function StartProjectPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string }>;
}) {
  const statusPromise = searchParams ?? Promise.resolve({});

  return (
    <main className="min-h-screen bg-warm-white text-ink">
      <section className="section-shell grid gap-12 py-20 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="eyebrow">Start a Project</p>
          <h1 className="mt-4 text-5xl font-black leading-tight">Start a project conversation.</h1>
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
    </main>
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
