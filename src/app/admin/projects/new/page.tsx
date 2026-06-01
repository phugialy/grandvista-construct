import { requireAdmin } from "@/lib/admin-auth";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { AdminNav } from "@/components/admin/admin-nav";
import { ProjectForm } from "@/components/admin/project-form";

export default async function NewProjectPage() {
  await requireAdmin();
  const supabase = getSupabaseServiceClient();
  const { data: mediaAssets } = await supabase
    .from("media_assets")
    .select("id,public_url,media_type,alt_text,caption,tags")
    .eq("status", "ready")
    .order("created_at", { ascending: false })
    .limit(24);

  return (
    <main className="min-h-screen bg-warm-white text-ink">
      <AdminNav
        title="New project story"
        description="Create a project proof page with intent, challenge, approach, outcome, and media URLs."
      />
      <section className="section-shell py-10">
        <ProjectForm mediaAssets={mediaAssets ?? []} />
      </section>
    </main>
  );
}
