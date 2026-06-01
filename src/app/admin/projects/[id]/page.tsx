import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { AdminNav } from "@/components/admin/admin-nav";
import { ProjectForm } from "@/components/admin/project-form";

type Params = {
  id: string;
};

export const dynamic = "force-dynamic";

export default async function EditProjectPage({ params }: { params: Promise<Params> }) {
  await requireAdmin();

  const { id } = await params;
  const supabase = getSupabaseServiceClient();
  const { data: project, error } = await supabase
    .from("projects")
    .select(
      "id,slug,title,location,client_type,project_type,project_intent,stakes,challenge,delivery_approach,built_outcome,featured,published",
    )
    .eq("id", id)
    .single();

  if (error || !project) {
    notFound();
  }

  const { data: media } = await supabase
    .from("project_media")
    .select("role,url,alt")
    .eq("project_id", id)
    .order("sort_order", { ascending: true });

  const hero = media?.find((item) => item.role === "hero");
  const gallery = media?.find((item) => item.role === "gallery");

  return (
    <main className="min-h-screen bg-warm-white text-ink">
      <AdminNav
        title="Edit project story"
        description="Shape the project narrative and publish it when ready."
      />
      <section className="section-shell py-10">
        <ProjectForm
          project={{
            ...project,
            hero_url: hero?.url,
            hero_alt: hero?.alt,
            gallery_url: gallery?.url,
            gallery_alt: gallery?.alt,
          }}
        />
      </section>
    </main>
  );
}
