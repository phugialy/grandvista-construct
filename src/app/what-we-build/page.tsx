import Link from "next/link";
import { getProjectCategories } from "@/lib/supabase/public-data";

export default async function WhatWeBuildPage() {
  const categories = await getProjectCategories();

  return (
    <main className="min-h-screen bg-warm-white text-ink">
      <section className="section-shell py-20">
        <p className="eyebrow">What We Build</p>
        <h1 className="mt-4 max-w-4xl text-5xl font-black leading-tight">
          Commercial environments for owners, operators, and businesses preparing for what comes
          next.
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-steel">
          This page will grow into CMS-managed build categories with related project stories,
          common risks, and clear Grandvista delivery language for each type of work.
        </p>
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {categories.map((category) => (
            <article key={category.slug} className="border border-ink/12 bg-white p-7">
              <h2 className="text-2xl font-black">{category.title}</h2>
              <p className="mt-4 leading-7 text-steel">{category.summary}</p>
            </article>
          ))}
        </div>
        <Link
          href="/start-a-project"
          className="mt-10 inline-flex bg-navy px-6 py-4 text-sm font-black uppercase tracking-[0.08em] text-white hover:bg-brand-red"
        >
          Discuss Your Next Build
        </Link>
      </section>
    </main>
  );
}
