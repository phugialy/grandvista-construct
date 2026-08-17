import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { AdminNav } from "@/components/admin/admin-nav";

type AdminJobPosting = {
  id: string;
  slug: string;
  title: string;
  department: string | null;
  location: string | null;
  status: "draft" | "published" | "closed";
  updated_at: string;
};

export default async function AdminCareersPage() {
  await requireAdmin();

  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("job_postings")
    .select("id,slug,title,department,location,status,updated_at")
    .order("updated_at", { ascending: false });

  const postings = (data ?? []) as AdminJobPosting[];
  const postingIds = postings.map((posting) => posting.id);
  const { data: applicationCounts } = postingIds.length
    ? await supabase.from("applications").select("job_posting_id").in("job_posting_id", postingIds)
    : { data: [] as { job_posting_id: string }[] };

  const countByPosting = new Map<string, number>();
  for (const row of applicationCounts ?? []) {
    countByPosting.set(row.job_posting_id, (countByPosting.get(row.job_posting_id) ?? 0) + 1);
  }

  const published = postings.filter((posting) => posting.status === "published").length;
  const drafts = postings.filter((posting) => posting.status === "draft").length;
  const closed = postings.filter((posting) => posting.status === "closed").length;

  return (
    <main className="min-h-screen bg-warm-white text-ink">
      <AdminNav title="Careers" description="Create, publish, and manage open roles." />

      <section className="section-shell py-10">
        <div className="grid gap-4 md:grid-cols-3">
          <Metric label="Published" value={published} />
          <Metric label="Draft" value={drafts} />
          <Metric label="Closed" value={closed} />
        </div>

        <div className="mt-8 flex justify-end">
          <Link
            className="bg-navy px-5 py-3 text-sm font-black uppercase tracking-[0.08em] text-white hover:bg-brand-red"
            href="/admin/careers/new"
          >
            New Posting
          </Link>
        </div>

        {error ? (
          <p className="mt-8 border border-brand-red/30 bg-white p-5 font-bold text-brand-red">
            Unable to load job postings right now.
          </p>
        ) : null}

        <div className="mt-6 grid gap-4">
          {postings.length === 0 ? (
            <article className="border border-ink/12 bg-white p-8">
              <h2 className="text-2xl font-black">No job postings yet</h2>
              <p className="mt-3 text-steel">Create the first posting to open a role.</p>
            </article>
          ) : null}

          {postings.map((posting) => {
            const applicationCount = countByPosting.get(posting.id) ?? 0;

            return (
              <article key={posting.id} className="border border-ink/12 bg-white p-6">
                <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-brand-red">
                      {[posting.department, posting.location].filter(Boolean).join(" / ") || "Job Posting"}
                    </p>
                    <h2 className="mt-2 text-2xl font-black">{posting.title}</h2>
                    <p className="mt-2 text-sm font-bold text-steel">
                      <StatusLabel status={posting.status} /> &middot; {applicationCount}{" "}
                      {applicationCount === 1 ? "applicant" : "applicants"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {posting.status === "published" ? (
                      <Link
                        className="border border-ink/14 px-4 py-3 text-sm font-black uppercase tracking-[0.08em] text-ink hover:border-brand-red hover:text-brand-red"
                        href={`/careers/${posting.slug}`}
                        target="_blank"
                      >
                        View
                      </Link>
                    ) : null}
                    <Link
                      className="bg-navy px-4 py-3 text-sm font-black uppercase tracking-[0.08em] text-white hover:bg-brand-red"
                      href={`/admin/careers/${posting.id}`}
                    >
                      Manage
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}

function StatusLabel({ status }: { status: AdminJobPosting["status"] }) {
  const labels: Record<AdminJobPosting["status"], string> = {
    draft: "Draft",
    published: "Published",
    closed: "Closed",
  };

  return <span>{labels[status]}</span>;
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-ink/12 bg-white p-6">
      <p className="text-sm font-black uppercase tracking-[0.12em] text-steel">{label}</p>
      <p className="mt-3 text-4xl font-black text-navy">{value}</p>
    </div>
  );
}
