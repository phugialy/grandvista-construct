import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { getAssignableProjectMedia } from "@/lib/admin-media";
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
      "id,slug,title,location,client_type,project_type,summary,client_goal,project_pressures,built_outcomes,tags,seo_title,seo_description,featured,published",
    )
    .eq("id", id)
    .single();

  if (error || !project) {
    notFound();
  }

  const { data: media } = await supabase
    .from("project_media")
    .select("role,media_asset_id")
    .eq("project_id", id)
    .order("sort_order", { ascending: true });

  const hero = media?.find((item) => item.role === "hero");
  const gallery = media?.filter((item) => item.role === "gallery").map((item) => item.media_asset_id).filter(Boolean) ?? [];
  const mediaAssets = await getAssignableProjectMedia(id);

  return (
    <main className="min-h-screen bg-warm-white text-ink">
      <AdminNav
        title="Edit project story"
        description="Shape the project narrative and publish it when ready."
      />
      <section className="section-shell py-10">
        {project.published ? (
          <div className="mb-5 flex justify-end">
            <Link
              className="border border-ink/14 bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.08em] text-ink hover:border-brand-red hover:text-brand-red"
              href={`/project-stories/${project.slug}`}
              target="_blank"
            >
              Preview Published Story
            </Link>
          </div>
        ) : null}
        <ProjectForm
          project={{
            ...project,
            hero_asset_id: hero?.media_asset_id,
            gallery_asset_ids: gallery,
          }}
          mediaAssets={mediaAssets}
        />
      </section>
    </main>
  );
}
