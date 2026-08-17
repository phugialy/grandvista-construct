import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { ArrowLeft } from "lucide-react";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { getCandidateProfile, getCandidateSession } from "@/lib/candidate-auth";
import { getPublishedJobPostingBySlug, isJobPostingOpen } from "@/lib/supabase/public-data";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { applyToJob } from "./actions";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ status?: string }>;
};

const statusMessages: Record<string, string> = {
  bad_file_type: "Resumes need to be a PDF, DOC, or DOCX file.",
  file_too_large: "That resume is too large — keep it under 8MB.",
  upload_error: "Your resume couldn't be uploaded. Try again.",
  resume_required: "Add a resume before submitting — upload one below.",
  error: "Something went wrong submitting your application. Try again.",
  closed: "This role just closed to new applications.",
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const posting = await getPublishedJobPostingBySlug(slug);

  if (!posting) {
    return { title: "Role Not Found | Grandvista Careers" };
  }

  const title = `${posting.title} | Grandvista Careers`;
  const description = posting.summary ?? "Open role at Grandvista Construction.";

  return {
    title,
    description,
    alternates: { canonical: `/careers/${posting.slug}` },
    openGraph: {
      title,
      description,
      url: `https://grandvista-construction.com/careers/${posting.slug}`,
      siteName: "Grandvista Construction",
      type: "website",
    },
  };
}

export default function JobPostingPage({ params, searchParams }: PageProps) {
  return (
    <Suspense fallback={null}>
      <JobPostingContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function JobPostingContent({ params, searchParams }: PageProps) {
  await connection();
  const { slug } = await params;
  const { status } = await searchParams;
  const posting = await getPublishedJobPostingBySlug(slug);

  if (!posting) {
    notFound();
  }

  const open = isJobPostingOpen(posting);
  const message = status ? statusMessages[status] : null;
  const session = await getCandidateSession();
  const profile = session ? await getCandidateProfile(session.candidateId) : null;
  const alreadyApplied = profile ? await hasApplied(profile.id, posting.id) : false;

  return (
    <MarketingShell>
      <section className="bg-ink text-white">
        <div className="section-shell py-16">
          <Link
            className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.08em] text-white/70 hover:text-white"
            href="/careers"
          >
            <ArrowLeft size={16} /> Back to Careers
          </Link>
          <p className="eyebrow mt-8">
            {[posting.employment_type, posting.location].filter(Boolean).join(" · ")}
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-black leading-[0.98] sm:text-6xl">{posting.title}</h1>
          {posting.pay_range ? <p className="mt-5 text-lg font-bold text-white/80">{posting.pay_range}</p> : null}
        </div>
      </section>

      <section className="section-shell grid gap-10 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        <article className="max-w-3xl">
          {posting.summary ? <p className="text-lg leading-8 text-steel">{posting.summary}</p> : null}
          {posting.description ? (
            <div className="mt-7 grid gap-5 text-base leading-8 text-steel">
              {posting.description.split(/\n{2,}/).map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          ) : null}
        </article>

        <div className="border border-ink/12 bg-white p-7">
          {!open ? (
            <>
              <p className="text-sm font-black uppercase tracking-[0.14em] text-brand-red">This role has closed</p>
              <h2 className="mt-4 text-2xl font-black leading-tight">Not accepting new applications</h2>
              <p className="mt-4 leading-7 text-steel">
                This posting is no longer open. Check{" "}
                <Link className="font-black text-navy hover:text-brand-red" href="/careers">
                  current openings
                </Link>{" "}
                for other roles.
              </p>
            </>
          ) : !profile ? (
            <>
              <p className="text-sm font-black uppercase tracking-[0.14em] text-brand-red">Apply</p>
              <h2 className="mt-3 text-2xl font-black leading-tight">Sign in to apply</h2>
              <p className="mt-4 leading-7 text-steel">
                One account works for every role &mdash; new here? You can create one from the sign-in page.
              </p>
              <Link
                className="mt-6 inline-flex h-12 items-center justify-center bg-navy px-6 text-sm font-black uppercase tracking-[0.08em] text-white hover:bg-brand-red"
                href={`/careers/login?next=${encodeURIComponent(`/careers/${slug}`)}`}
              >
                Sign In to Apply
              </Link>
            </>
          ) : alreadyApplied ? (
            <>
              <p className="text-sm font-black uppercase tracking-[0.14em] text-brand-red">Applied</p>
              <h2 className="mt-4 text-2xl font-black leading-tight">You&apos;ve already applied to this role</h2>
              <p className="mt-4 leading-7 text-steel">
                We have your application on file. Check{" "}
                <Link className="font-black text-navy hover:text-brand-red" href="/careers/applications">
                  My Applications
                </Link>{" "}
                for its status.
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-black uppercase tracking-[0.14em] text-brand-red">Apply</p>
              <h2 className="mt-3 text-2xl font-black leading-tight">Apply as {profile.name}</h2>
              {message ? (
                <p className="mt-5 border border-brand-red/30 bg-brand-red/8 p-4 text-sm font-bold text-brand-red">
                  {message}
                </p>
              ) : null}
              <form action={applyToJob} className="mt-6 grid gap-4" encType="multipart/form-data">
                <input name="slug" type="hidden" value={posting.slug} />
                <input autoComplete="off" className="hidden" name="company_website" tabIndex={-1} type="text" />
                <label className="grid gap-2 font-bold">
                  Resume
                  {profile.resume_file_name ? (
                    <span className="text-xs font-normal text-steel">
                      On file: {profile.resume_file_name}. Upload a new one to replace it.
                    </span>
                  ) : (
                    <span className="text-xs font-normal text-steel">PDF, DOC, or DOCX, up to 8MB. Required.</span>
                  )}
                  <input
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    className="border border-ink/14 bg-white p-3 text-sm text-ink outline-none focus:border-navy"
                    name="resume"
                    type="file"
                  />
                </label>
                <label className="grid gap-2 font-bold">
                  Cover letter
                  <span className="text-xs font-normal text-steel">Optional.</span>
                  <textarea
                    className="min-h-28 resize-y border border-ink/14 bg-white p-4 text-base text-ink outline-none focus:border-navy"
                    name="cover_letter"
                  />
                </label>
                <button
                  className="mt-2 bg-navy px-6 py-4 text-sm font-black uppercase tracking-[0.08em] text-white hover:bg-brand-red"
                  type="submit"
                >
                  Submit Application
                </button>
              </form>
            </>
          )}
        </div>
      </section>
    </MarketingShell>
  );
}

async function hasApplied(candidateId: string, jobPostingId: string) {
  const supabase = getSupabaseServiceClient();
  const { data } = await supabase
    .from("applications")
    .select("id")
    .eq("candidate_id", candidateId)
    .eq("job_posting_id", jobPostingId)
    .maybeSingle();

  return Boolean(data);
}
