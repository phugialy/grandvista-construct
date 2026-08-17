import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { AdminNav } from "@/components/admin/admin-nav";
import { updateApplicationStatus } from "./actions";

type Params = {
  id: string;
};

type ApplicationRow = {
  id: string;
  status: "new" | "reviewing" | "interview" | "offer" | "rejected";
  cover_letter: string | null;
  created_at: string;
  candidate_profiles: {
    name: string;
    email: string;
    phone: string | null;
    resume_url: string | null;
  } | null;
};

const statusOrder = ["new", "reviewing", "interview", "offer", "rejected"] as const;
const statusLabels: Record<(typeof statusOrder)[number], string> = {
  new: "New",
  reviewing: "Reviewing",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
};

export default async function ApplicantsPage({ params }: { params: Promise<Params> }) {
  await requireAdmin();

  const { id } = await params;
  const supabase = getSupabaseServiceClient();
  const { data: posting, error: postingError } = await supabase
    .from("job_postings")
    .select("id,title,slug")
    .eq("id", id)
    .single();

  if (postingError || !posting) {
    notFound();
  }

  const { data, error } = await supabase
    .from("applications")
    .select("id,status,cover_letter,created_at,candidate_profiles(name,email,phone,resume_url)")
    .eq("job_posting_id", id)
    .order("created_at", { ascending: false });

  const applications = await Promise.all(
    ((data ?? []) as unknown as ApplicationRow[]).map(async (row) => {
      const candidate = Array.isArray(row.candidate_profiles) ? row.candidate_profiles[0] ?? null : row.candidate_profiles;
      // resume_url stores a private storage path, not a public URL — sign it fresh on every render.
      const resumeSignedUrl = candidate?.resume_url
        ? (await supabase.storage.from("resumes").createSignedUrl(candidate.resume_url, 60 * 10)).data?.signedUrl ?? null
        : null;

      return { ...row, candidate_profiles: candidate, resumeSignedUrl };
    }),
  );

  return (
    <main className="min-h-screen bg-warm-white text-ink">
      <AdminNav title={`Applicants — ${posting.title}`} description="Review candidates and move them through the pipeline." />
      <section className="section-shell py-10">
        <Link
          className="mb-6 inline-block border border-ink/14 bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.08em] text-ink hover:border-brand-red hover:text-brand-red"
          href={`/admin/careers/${id}`}
        >
          Back to Posting
        </Link>

        {error ? (
          <p className="border border-brand-red/30 bg-white p-5 font-bold text-brand-red">
            Unable to load applicants right now.
          </p>
        ) : null}

        {applications.length === 0 ? (
          <article className="border border-ink/12 bg-white p-8">
            <h2 className="text-2xl font-black">No applicants yet</h2>
            <p className="mt-3 text-steel">Applications will show up here once candidates apply to this role.</p>
          </article>
        ) : (
          <div className="grid gap-8 xl:grid-cols-5">
            {statusOrder.map((statusKey) => {
              const columnApplications = applications.filter((application) => application.status === statusKey);

              return (
                <div key={statusKey}>
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-steel">
                    {statusLabels[statusKey]} <span className="text-brand-red">({columnApplications.length})</span>
                  </p>
                  <div className="mt-4 grid gap-3">
                    {columnApplications.map((application) => (
                      <article className="border border-ink/12 bg-white p-4" key={application.id}>
                        <p className="font-black text-ink">{application.candidate_profiles?.name ?? "Unknown"}</p>
                        <p className="mt-1 break-all text-xs font-bold text-steel">{application.candidate_profiles?.email}</p>
                        <p className="mt-1 text-xs font-bold text-steel">
                          Applied {new Date(application.created_at).toLocaleDateString()}
                        </p>
                        {application.resumeSignedUrl ? (
                          <a
                            className="mt-2 inline-block text-xs font-black uppercase tracking-[0.08em] text-navy hover:text-brand-red"
                            href={application.resumeSignedUrl}
                            rel="noreferrer"
                            target="_blank"
                          >
                            View Resume
                          </a>
                        ) : null}
                        <form action={updateApplicationStatus} className="mt-3 flex gap-2">
                          <input name="application_id" type="hidden" value={application.id} />
                          <input name="posting_id" type="hidden" value={id} />
                          <select
                            className="min-h-10 flex-1 border border-ink/14 bg-white px-2 text-xs font-bold text-ink outline-none focus:border-navy"
                            defaultValue={application.status}
                            name="status"
                          >
                            {statusOrder.map((option) => (
                              <option key={option} value={option}>
                                {statusLabels[option]}
                              </option>
                            ))}
                          </select>
                          <button
                            className="border border-ink/14 px-3 text-xs font-black uppercase tracking-[0.06em] text-ink hover:border-brand-red hover:text-brand-red"
                            type="submit"
                          >
                            Move
                          </button>
                        </form>
                      </article>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
