import { BriefcaseBusiness, HardHat, MessagesSquare, Route, UsersRound } from "lucide-react";
import { FinalCta } from "@/components/marketing/final-cta";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { PageHero } from "@/components/marketing/page-hero";
import { getSectionPrimaryMedia, getSiteSections } from "@/lib/supabase/public-data";

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

export default async function CompanyPage() {
  const sections = await getSiteSections();
  const heroSection = sections["company.hero"];

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
