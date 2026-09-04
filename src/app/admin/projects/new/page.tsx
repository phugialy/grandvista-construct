import { requireAdmin } from "@/lib/admin-auth";
import { getAssignableProjectMedia } from "@/lib/admin-media";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { AdminNav } from "@/components/admin/admin-nav";
import { ProjectForm } from "@/components/admin/project-form";

export default async function NewProjectPage() {
  await requireAdmin();
  const [mediaAssets, { data: partners }] = await Promise.all([
    getAssignableProjectMedia(),
    getSupabaseServiceClient().from("vendor_partners").select("id,name").order("sort_order", { ascending: true }),
  ]);

  return (
    <main className="min-h-screen bg-warm-white text-ink">
      <AdminNav
        title="New project story"
        description="Create a project proof page with intent, challenge, approach, outcome, and media URLs."
      />
      <section className="section-shell py-10">
        <ProjectForm mediaAssets={mediaAssets} partnerOptions={partners ?? []} />
      </section>
    </main>
  );
}
