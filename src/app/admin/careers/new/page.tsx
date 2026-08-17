import { requireAdmin } from "@/lib/admin-auth";
import { AdminNav } from "@/components/admin/admin-nav";
import { JobPostingForm } from "@/components/admin/job-posting-form";

export default async function NewJobPostingPage() {
  await requireAdmin();

  return (
    <main className="min-h-screen bg-warm-white text-ink">
      <AdminNav title="New job posting" description="Create a role for candidates to apply to." />
      <section className="section-shell py-10">
        <JobPostingForm />
      </section>
    </main>
  );
}
