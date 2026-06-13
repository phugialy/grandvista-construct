import type { Metadata } from "next";
import { Suspense } from "react";
import { BriefcaseBusiness, HardHat, MessagesSquare, Route, UsersRound } from "lucide-react";
import { FinalCta } from "@/components/marketing/final-cta";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { PageHero } from "@/components/marketing/page-hero";
import { getSectionPrimaryMedia, getSiteSections } from "@/lib/supabase/public-data";
import { submitCompanyMessage } from "./actions";

export const metadata: Metadata = {
  title: "Company | About Grandvista Commercial Construction",
  description:
    "Grandvista is a commercial construction company grounded in planning, field coordination, and ownership-minded communication. Building toward larger commercial responsibility.",
  openGraph: {
    title: "Company | About Grandvista Commercial Construction",
    description:
      "Grandvista is a commercial construction company grounded in planning, field coordination, and ownership-minded communication. Building toward larger commercial responsibility.",
    url: "https://grandvista-construction.com/company",
    siteName: "Grandvista Construction",
    type: "website",
  },
};

const values = [
  "Plan before the field is under pressure.",
  "Communicate before problems grow.",
  "Respect the business behind the build.",
  "Coordinate trades with accountability.",
  "Treat each project as a step toward larger responsibility.",
];

const audiences = [
  {
    icon: BriefcaseBusiness,
    title: "Owners",
    text: "Business leaders who need a usable space, clearer planning, and a construction partner who understands cost and timing pressure.",
  },
  {
    icon: UsersRound,
    title: "Operators",
    text: "Teams that need spaces to support customers, staff movement, production, storage, and daily function.",
  },
  {
    icon: Route,
    title: "Developers",
    text: "Project teams thinking about schedule, site readiness, market timing, and repeatable coordination.",
  },
  {
    icon: MessagesSquare,
    title: "Architects and Designers",
    text: "Partners who need design intent respected while field realities and constructability are handled clearly.",
  },
];

export default async function CompanyPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string }>;
}) {
  const sections = await getSiteSections();
  const heroSection = sections["company.hero"];
  const statusPromise: Promise<{ status?: string }> = searchParams ?? Promise.resolve({});

  return (
    <MarketingShell>
      <PageHero
        eyebrow="Company"
        title={heroSection?.headline ?? "A commercial builder with direction."}
        copy={
          heroSection?.body ??
          "Grandvista is building a commercial construction company grounded in planning, field coordination, and ownership-minded communication. The company is serious about today's work and structured for tomorrow's growth."
        }
        primaryHref="/start-a-project"
        primaryLabel="Start a Project"
        secondaryHref="/our-direction"
        secondaryLabel="See Our Direction"
        stats={[
          { label: "Mindset", value: "Builder-minded" },
          { label: "Promise", value: "Accountable execution" },
        ]}
        visualMedia={getSectionPrimaryMedia(heroSection)}
      />

      <section className="section-shell py-20">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="eyebrow">Company Story</p>
            <h2 className="mt-4 text-4xl font-black leading-tight">
              Grandvista is not trying to sound bigger than its proof. It is building toward bigger responsibility.
            </h2>
          </div>
          <div className="grid gap-6 text-lg leading-8 text-steel">
            <p>
              Commercial construction is tied to business pressure: opening dates, customer
              experience, staff flow, inspections, operations, and long-term use. Grandvista&apos;s brand
              should make that understanding visible.
            </p>
            <p>
              The company should feel practical and field-proven, but also growth-minded. That
              balance is what separates a serious emerging builder from a local contractor template.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="section-shell">
          <p className="eyebrow">Operating Values</p>
          <h2 className="mt-4 max-w-3xl text-4xl font-black leading-tight sm:text-5xl">
            Standards that belong to construction, not generic brand language.
          </h2>
          <div className="mt-10 grid gap-4">
            {values.map((value, index) => (
              <article key={value} className="flex items-center gap-5 border border-ink/12 bg-warm-white p-5">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center bg-navy text-sm font-black text-white">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="text-2xl font-black leading-tight">{value}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell py-20">
        <p className="eyebrow">Who We Work With</p>
        <h2 className="mt-4 max-w-3xl text-4xl font-black leading-tight sm:text-5xl">
          The site should speak to the people behind the project.
        </h2>
        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {audiences.map((audience) => (
            <article key={audience.title} className="border border-ink/12 bg-white p-6">
              <audience.icon className="text-brand-red" size={26} />
              <h3 className="mt-6 text-xl font-black">{audience.title}</h3>
              <p className="mt-4 leading-7 text-steel">{audience.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-ink/10 bg-ink py-20 text-white">
        <div className="section-shell grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <HardHat className="text-brand-red" size={32} />
            <h2 className="mt-6 text-4xl font-black leading-tight">Future credibility pages</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {["Safety & Quality", "Partners", "Careers", "Insights"].map((item) => (
              <div key={item} className="border border-white/14 p-6 text-xl font-black">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="company-message" className="section-shell py-20">
        <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr]">
          <div>
            <p className="eyebrow">Company Contact</p>
            <h2 className="mt-4 text-4xl font-black leading-tight">
              Send a message without starting a full project intake.
            </h2>
            <p className="mt-5 leading-8 text-steel">
              This path is for introductions, partner conversations, general questions, and early
              company contact. Project-ready conversations can still use the full intake.
            </p>
          </div>
          <form action={submitCompanyMessage} className="border border-ink/12 bg-white p-6">
            <Suspense fallback={null}>
              <CompanyFormStatus statusPromise={statusPromise} />
            </Suspense>
            <div className="grid gap-4 md:grid-cols-2">
              <CompanyInput label="Name" name="name" required />
              <CompanyInput label="Email" name="email" required type="email" />
              <CompanyInput label="Company" name="company" />
              <CompanyInput label="Phone" name="phone" type="tel" />
            </div>
            <label className="mt-4 block">
              <span className="text-xs font-black uppercase tracking-[0.12em] text-navy">
                Message Type
              </span>
              <select
                className="mt-2 h-12 w-full border border-ink/12 bg-warm-white px-4 font-bold text-ink outline-none focus:border-navy"
                name="reason"
              >
                <option>General message</option>
                <option>Partner or subcontractor introduction</option>
                <option>Owner or developer conversation</option>
                <option>Architect or designer coordination</option>
                <option>Company or media question</option>
              </select>
            </label>
            <label className="mt-4 block">
              <span className="text-xs font-black uppercase tracking-[0.12em] text-navy">
                Message
              </span>
              <textarea
                className="mt-2 min-h-36 w-full border border-ink/12 bg-warm-white px-4 py-3 leading-7 text-ink outline-none focus:border-navy"
                name="message"
                required
              />
            </label>
            <button
              className="mt-5 h-12 bg-navy px-6 text-sm font-black uppercase tracking-[0.08em] text-white transition hover:bg-brand-red"
              type="submit"
            >
              Send Message
            </button>
          </form>
        </div>
      </section>

      <FinalCta
        title="Ready to move from interest to project context?"
        copy="Grandvista's intake is built to understand the project type, stage, schedule, budget range, permit context, and what is at stake behind the work."
        primaryHref="/start-a-project"
        primaryLabel="Start a Project Conversation"
        secondaryHref="/how-we-work"
        secondaryLabel="See How We Work"
      />
    </MarketingShell>
  );
}

async function CompanyFormStatus({
  statusPromise,
}: {
  statusPromise: Promise<{ status?: string }>;
}) {
  const { status } = await statusPromise;

  if (status === "message-sent") {
    return (
      <div className="mb-6 border-l-4 border-brand-red bg-warm-white p-4 font-bold text-ink">
        Message received. The Grandvista team will review it and follow up if needed.
      </div>
    );
  }

  if (status === "missing") {
    return (
      <div className="mb-6 border-l-4 border-brand-red bg-warm-white p-4 font-bold text-ink">
        Please include your name, email, and message.
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="mb-6 border-l-4 border-brand-red bg-warm-white p-4 font-bold text-ink">
        Something went wrong while sending. Please try again.
      </div>
    );
  }

  return null;
}

function CompanyInput({
  label,
  name,
  required = false,
  type = "text",
}: {
  label: string;
  name: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-[0.12em] text-navy">{label}</span>
      <input
        className="mt-2 h-12 w-full border border-ink/12 bg-warm-white px-4 font-bold text-ink outline-none focus:border-navy"
        name={name}
        required={required}
        type={type}
      />
    </label>
  );
}
