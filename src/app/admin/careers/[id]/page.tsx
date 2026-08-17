import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { AdminNav } from "@/components/admin/admin-nav";
import { JobPostingForm } from "@/components/admin/job-posting-form";

type Params = {
  id: string;
};

export default async function EditJobPostingPage({ params }: { params: Promise<Params> }) {
  await requireAdmin();

  const { id } = await params;
  const supabase = getSupabaseServiceClient();
  const { data: posting, error } = await supabase
    .from("job_postings")
    .select("id,slug,title,department,location,employment_type,pay_range,summary,description,status,closes_at")
    .eq("id", id)
    .single();

  if (error || !posting) {
    notFound();
  }

  const { count } = await supabase
    .from("applications")
    .select("id", { count: "exact", head: true })
    .eq("job_posting_id", id);

  return (
    <main className="min-h-screen bg-warm-white text-ink">
      <AdminNav title="Edit job posting" description="Update the role and manage its status." />
      <section className="section-shell py-10">
        <div className="mb-5 flex flex-wrap justify-between gap-3">
          <Link
            className="border border-ink/14 bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.08em] text-ink hover:border-brand-red hover:text-brand-red"
            href={`/admin/careers/${id}/applicants`}
          >
            View Applicants ({count ?? 0})
          </Link>
          {posting.status === "published" ? (
            <Link
              className="border border-ink/14 bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.08em] text-ink hover:border-brand-red hover:text-brand-red"
              href={`/careers/${posting.slug}`}
              target="_blank"
            >
              Preview Live Posting
            </Link>
          ) : null}
        </div>
        <JobPostingForm posting={{ ...posting, application_count: count ?? 0 }} />
      </section>
    </main>
  );
}
