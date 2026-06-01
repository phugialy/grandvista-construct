import Link from "next/link";
import { MarketingShell } from "@/components/marketing/marketing-shell";

export default function ProjectThanksPage() {
  return (
    <MarketingShell>
      <section className="bg-ink text-white">
        <div className="section-shell flex min-h-[720px] items-center py-20">
          <div className="max-w-3xl">
            <p className="eyebrow">Project inquiry received</p>
            <h1 className="mt-4 text-5xl font-black leading-tight sm:text-6xl">
              Thanks. Grandvista has the project details.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/72">
              The next step is reviewing the project type, stage, location, schedule, and what is at
              stake behind the build. A clearer first conversation makes the work easier to plan.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/project-stories"
                className="inline-flex h-12 items-center justify-center bg-brand-red px-6 text-sm font-black uppercase tracking-[0.08em] text-white transition hover:bg-white hover:text-ink"
              >
                View Project Stories
              </Link>
              <Link
                href="/how-we-work"
                className="inline-flex h-12 items-center justify-center border border-white/24 px-6 text-sm font-black uppercase tracking-[0.08em] text-white transition hover:border-white hover:bg-white hover:text-ink"
              >
                See How We Work
              </Link>
            </div>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
