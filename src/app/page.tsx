import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Building2, ClipboardCheck, Compass, ShieldCheck } from "lucide-react";
import { FinalCta } from "@/components/marketing/final-cta";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import {
  buildCategories,
  confidenceAudiences,
  processPillars,
} from "@/lib/site-content";

const proofPoints = [
  { label: "Audience", value: "Owners, operators, developers" },
  { label: "Focus", value: "Commercial environments" },
  { label: "Standard", value: "Planning, field discipline, turnover" },
];

export default function Home() {
  return (
    <MarketingShell>
      <section className="border-b border-ink/10 bg-ink text-white">
        <div className="section-shell grid min-h-[720px] gap-10 py-16 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div className="max-w-3xl">
            <p className="eyebrow mb-6">Commercial construction with direction</p>
            <h1 className="max-w-4xl text-5xl font-black leading-[0.96] tracking-normal sm:text-7xl lg:text-8xl">
              Important Projects Deserve a Builder With Direction
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-8 text-white/74 sm:text-xl">
              Grandvista helps owners, operators, and project teams move from business need to
              usable built environment through clear planning, field coordination, and accountable
              execution.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/start-a-project"
                className="inline-flex h-12 items-center justify-center gap-2 bg-brand-red px-6 text-sm font-black uppercase tracking-[0.08em] text-white transition hover:bg-white hover:text-ink"
              >
                Start a Project Conversation <ArrowUpRight size={18} />
              </Link>
              <Link
                href="/how-we-work"
                className="inline-flex h-12 items-center justify-center border border-white/28 px-6 text-sm font-black uppercase tracking-[0.08em] text-white transition hover:border-white hover:bg-white hover:text-ink"
              >
                See How We Work
              </Link>
            </div>
          </div>

          <div className="relative min-h-[520px] overflow-hidden border border-white/14 bg-[#151925]">
            <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-80">
              {Array.from({ length: 36 }).map((_, index) => (
                <div key={index} className="border border-white/[0.035]" />
              ))}
            </div>
            <div className="absolute inset-x-8 top-8 h-44 bg-concrete/85" />
            <div className="absolute bottom-20 left-8 right-20 h-52 bg-white/10" />
            <div className="absolute bottom-8 left-20 right-8 h-28 bg-brand-red" />
            <div className="absolute right-8 top-28 w-28 border-t-[220px] border-l-[70px] border-t-white/22 border-l-transparent" />
            <div className="absolute left-8 top-8 max-w-xs bg-ink/88 p-6">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-red">
                Media system ready
              </p>
              <p className="mt-4 text-2xl font-black leading-tight">
                Built to carry jobsite clips, project photography, and case-study proof.
              </p>
            </div>
            <div className="absolute bottom-8 left-8 bg-white p-5 text-ink">
              <Image
                src="/grandvista-logo.jpg"
                alt="Grandvista logo"
                width={132}
                height={88}
                className="h-20 w-32 object-contain"
              />
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

      <section className="bg-navy py-20 text-white">
        <div className="section-shell grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="eyebrow">How We Work</p>
            <h2 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">
              Construction is built in the field, but won in the planning.
            </h2>
            <p className="mt-6 leading-8 text-white/72">
              Grandvista&apos;s process should make owners feel safer, architects feel respected,
              developers feel heard, and subcontractors feel coordinated.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {processPillars.map((pillar, index) => (
              <div key={pillar} className="flex items-center gap-4 border border-white/16 p-4">
                <span className="flex h-10 w-10 items-center justify-center bg-white text-sm font-black text-navy">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="font-bold">{pillar}</span>
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
