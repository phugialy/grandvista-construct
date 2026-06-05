import { requireAdmin } from "@/lib/admin-auth";
import { getAssignableProjectMedia } from "@/lib/admin-media";
import { AdminNav } from "@/components/admin/admin-nav";
import { ProjectForm } from "@/components/admin/project-form";

export default async function NewProjectPage() {
  await requireAdmin();
  const mediaAssets = await getAssignableProjectMedia();

  return (
    <main className="min-h-screen bg-warm-white text-ink">
      <AdminNav
        title="New project story"
        description="Create a project proof page with intent, challenge, approach, outcome, and media URLs."
      />
      <section className="section-shell py-10">
        <ProjectForm mediaAssets={mediaAssets} />
      </section>
    </main>
  );
}
