import { processPillars } from "@/lib/site-content";

export default function HowWeWorkPage() {
  return (
    <main className="min-h-screen bg-ink text-white">
      <section className="section-shell py-20">
        <p className="eyebrow">How We Work</p>
        <h1 className="mt-4 max-w-4xl text-5xl font-black leading-tight">
          Construction is built in the field, but won in the planning.
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-white/72">
          Grandvista&apos;s process should create confidence before the first trade mobilizes:
          clearer scope, better communication, field accountability, and turnover discipline.
        </p>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {processPillars.map((pillar, index) => (
            <article key={pillar} className="border border-white/14 p-6">
              <p className="text-sm font-black text-brand-red">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h2 className="mt-4 text-2xl font-black">{pillar}</h2>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
