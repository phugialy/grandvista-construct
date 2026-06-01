import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { AdminNav } from "@/components/admin/admin-nav";

type AdminProject = {
  id: string;
  slug: string;
  title: string;
  location: string | null;
  project_type: string | null;
  featured: boolean;
  published: boolean;
  updated_at: string;
};

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  await requireAdmin();

  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("projects")
    .select("id,slug,title,location,project_type,featured,published,updated_at")
    .order("updated_at", { ascending: false });

  const projects = (data ?? []) as AdminProject[];
  const published = projects.filter((project) => project.published).length;
  const drafts = projects.length - published;

  return (
    <main className="min-h-screen bg-warm-white text-ink">
      <AdminNav
        title="Project stories"
        description="Create, publish, and shape project proof for the public website."
      />

      <section className="section-shell py-10">
        <div className="grid gap-4 md:grid-cols-3">
          <Metric label="Total projects" value={projects.length} />
          <Metric label="Published" value={published} />
          <Metric label="Drafts" value={drafts} />
        </div>

        <div className="mt-8 flex justify-end">
          <Link
            className="bg-navy px-5 py-3 text-sm font-black uppercase tracking-[0.08em] text-white hover:bg-brand-red"
            href="/admin/projects/new"
          >
            New Project Story
          </Link>
        </div>

        {error ? (
          <p className="mt-8 border border-brand-red/30 bg-white p-5 font-bold text-brand-red">
            Unable to load projects right now.
          </p>
        ) : null}

        <div className="mt-6 grid gap-4">
          {projects.length === 0 ? (
            <article className="border border-ink/12 bg-white p-8">
              <h2 className="text-2xl font-black">No project stories yet</h2>
              <p className="mt-3 text-steel">Create the first story to start building proof.</p>
            </article>
          ) : null}

          {projects.map((project) => (
            <article key={project.id} className="border border-ink/12 bg-white p-6">
              <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-brand-red">
                    {[project.project_type, project.location].filter(Boolean).join(" / ") || "Project Story"}
                  </p>
                  <h2 className="mt-2 text-2xl font-black">{project.title}</h2>
                  <p className="mt-2 text-sm font-bold text-steel">
                    {project.published ? "Published" : "Draft"} {project.featured ? "/ Featured" : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  {project.published ? (
                    <Link
                      className="border border-ink/14 px-4 py-3 text-sm font-black uppercase tracking-[0.08em] text-ink hover:border-brand-red hover:text-brand-red"
                      href={`/project-stories/${project.slug}`}
                    >
                      View
                    </Link>
                  ) : null}
                  <Link
                    className="bg-navy px-4 py-3 text-sm font-black uppercase tracking-[0.08em] text-white hover:bg-brand-red"
                    href={`/admin/projects/${project.id}`}
                  >
                    Edit
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-ink/12 bg-white p-6">
      <p className="text-sm font-black uppercase tracking-[0.12em] text-steel">{label}</p>
      <p className="mt-3 text-4xl font-black text-navy">{value}</p>
    </div>
  );
}
