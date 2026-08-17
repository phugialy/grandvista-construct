import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { getCandidateProfile, requireCandidate } from "@/lib/candidate-auth";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { logoutCandidate } from "../login/actions";

export const metadata: Metadata = {
  title: "My Applications | Grandvista Careers",
  robots: { index: false },
};

type ApplicationRow = {
  id: string;
  status: "new" | "reviewing" | "interview" | "offer" | "rejected";
  created_at: string;
  job_postings: { title: string } | null;
};

const statusLabels: Record<ApplicationRow["status"], string> = {
  new: "Received",
  reviewing: "Reviewing",
  interview: "Interview",
  offer: "Offer",
  rejected: "Not moving forward",
};

export default function MyApplicationsPage() {
  return (
    <Suspense fallback={null}>
      <MyApplicationsContent />
    </Suspense>
  );
}

async function MyApplicationsContent() {
  await connection();
  const session = await requireCandidate();
  const [profile, applications] = await Promise.all([
    getCandidateProfile(session.candidateId),
    loadApplications(session.candidateId),
  ]);

  return (
    <MarketingShell>
      <section className="section-shell py-16">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">My Applications</p>
            <h1 className="mt-4 text-4xl font-black leading-tight">
              {applications.length} application{applications.length === 1 ? "" : "s"} on file
            </h1>
          </div>
          <form action={logoutCandidate}>
            <button
              className="border border-ink/14 bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.08em] text-ink hover:border-brand-red hover:text-brand-red"
              type="submit"
            >
              Sign Out
            </button>
          </form>
        </div>

        <div className="mt-8 grid gap-4">
          {applications.length === 0 ? (
            <p className="border border-ink/12 bg-white p-8 leading-7 text-steel">
              No applications yet &mdash; browse open roles to apply.
            </p>
          ) : (
            applications.map((application) => (
              <article className="flex items-center justify-between border border-ink/12 bg-white p-5" key={application.id}>
                <div>
                  <p className="font-black text-ink">{application.job_postings?.title ?? "Untitled role"}</p>
                  <p className="mt-1 text-sm font-bold text-steel">
                    Applied {new Date(application.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className="border border-ink/14 px-3 py-2 text-xs font-black uppercase tracking-[0.08em] text-navy">
                  {statusLabels[application.status]}
                </span>
              </article>
            ))
          )}
        </div>

        {profile ? (
          <div className="mt-10 border border-ink/12 bg-white p-6">
            <p className="text-sm font-black uppercase tracking-[0.14em] text-brand-red">Profile</p>
            <p className="mt-3 text-steel">
              {profile.name} &middot; {profile.email}
              {profile.resume_file_name ? <> &middot; {profile.resume_file_name}</> : null}
            </p>
            <p className="mt-3 text-sm font-bold text-steel">
              To update your resume or contact info, apply to any role again with the updated details.
            </p>
          </div>
        ) : null}
      </section>
    </MarketingShell>
  );
}

async function loadApplications(candidateId: string): Promise<ApplicationRow[]> {
  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("applications")
    .select("id,status,created_at,job_postings(title)")
    .eq("candidate_id", candidateId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load candidate applications", error);
    return [];
  }

  return (data ?? []).map((row) => ({
    ...row,
    job_postings: Array.isArray(row.job_postings) ? row.job_postings[0] ?? null : row.job_postings,
  })) as ApplicationRow[];
}
