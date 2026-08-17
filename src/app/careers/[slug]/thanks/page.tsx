import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { getPublishedJobPostingBySlug } from "@/lib/supabase/public-data";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default function ApplicationThanksPage({ params }: PageProps) {
  return (
    <Suspense fallback={null}>
      <ApplicationThanksContent params={params} />
    </Suspense>
  );
}

async function ApplicationThanksContent({ params }: PageProps) {
  await connection();
  const { slug } = await params;
  const posting = await getPublishedJobPostingBySlug(slug);

  if (!posting) {
    notFound();
  }

  return (
    <MarketingShell>
      <section className="section-shell py-20">
        <div className="mx-auto max-w-2xl border border-ink/12 bg-white p-10 text-center">
          <p className="eyebrow">Application received</p>
          <h1 className="mt-4 text-4xl font-black leading-tight">Thanks for applying.</h1>
          <p className="mt-5 leading-8 text-steel">
            We received your application for <b className="font-black text-ink">{posting.title}</b>. We&apos;ll
            follow up by email at every stage &mdash; nothing to log back into unless you want to check your
            status yourself.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              className="inline-flex h-12 items-center justify-center bg-navy px-6 text-sm font-black uppercase tracking-[0.08em] text-white hover:bg-brand-red"
              href="/careers/applications"
            >
              View My Applications
            </Link>
            <Link
              className="inline-flex h-12 items-center justify-center border border-ink/14 px-6 text-sm font-black uppercase tracking-[0.08em] text-ink hover:border-brand-red hover:text-brand-red"
              href="/careers"
            >
              See Other Roles
            </Link>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
