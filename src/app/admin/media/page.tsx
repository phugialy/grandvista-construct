import { requireAdmin } from "@/lib/admin-auth";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { AdminNav } from "@/components/admin/admin-nav";
import { MediaAssignmentWorkspace } from "@/components/admin/media-assignment-workspace";
import { MediaUploader } from "@/components/admin/media-uploader";

type MediaAsset = {
  id: string;
  public_url: string;
  media_type: "image" | "video";
  mime_type: string;
  file_size: number;
  alt_text: string | null;
  tags: string[];
  created_at: string;
  usage_labels: string[];
};

type ProjectOption = {
  id: string;
  title: string;
  project_type: string | null;
  published: boolean;
};

type SiteSectionOption = {
  id: string;
  section_key: string;
  page_slug: string;
  placement: string;
  label: string;
};

type ProjectMediaUsage = {
  media_asset_id: string | null;
  role: string;
  projects:
    | {
        title: string;
      }
    | {
        title: string;
      }[]
    | null;
};

type SiteSectionUsage = {
  media_asset_id: string | null;
  page_slug: string;
  label: string;
};

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  await requireAdmin();

  const supabase = getSupabaseServiceClient();
  const [{ data: mediaAssets }, { data: projects }, { data: sections }, { data: projectMedia }, { data: sectionMedia }] =
    await Promise.all([
      supabase
        .from("media_assets")
        .select("id,public_url,media_type,mime_type,file_size,alt_text,tags,created_at")
        .eq("status", "ready")
        .order("created_at", { ascending: false })
        .limit(120),
      supabase.from("projects").select("id,title,project_type,published").order("updated_at", { ascending: false }),
      supabase.from("site_sections").select("id,section_key,page_slug,placement,label").order("sort_order", { ascending: true }),
      supabase.from("project_media").select("media_asset_id,role,projects(title)").not("media_asset_id", "is", null),
      supabase.from("site_sections").select("media_asset_id,page_slug,label").not("media_asset_id", "is", null),
    ]);
  const usageByAssetId = buildUsageMap((projectMedia ?? []) as unknown as ProjectMediaUsage[], (sectionMedia ?? []) as SiteSectionUsage[]);
  const assets = ((mediaAssets ?? []) as Omit<MediaAsset, "usage_labels">[]).map((asset) => ({
    ...asset,
    usage_labels: usageByAssetId.get(asset.id) ?? [],
  }));
  const unassignedCount = assets.filter((asset) => asset.usage_labels.length === 0 && asset.tags.length === 0).length;
  const usedCount = assets.filter((asset) => asset.usage_labels.length > 0).length;

  return (
    <main className="min-h-screen bg-warm-white text-ink">
      <AdminNav
        title="Media library"
        description="Upload jobsite proof, keep files web-ready, and choose assets for project stories."
      />
      <section className="section-shell grid gap-6 py-10">
        <div className="grid gap-4 md:grid-cols-3">
          <Metric label="Unassigned" value={unassignedCount} />
          <Metric label="Used on site" value={usedCount} />
          <Metric label="Ready assets" value={assets.length} />
        </div>

        <MediaUploader />

        <MediaAssignmentWorkspace
          assets={assets}
          projects={(projects ?? []) as ProjectOption[]}
          siteSections={(sections ?? []) as SiteSectionOption[]}
        />
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-ink/12 bg-white p-5">
      <p className="text-sm font-black uppercase tracking-[0.12em] text-steel">{label}</p>
      <p className="mt-3 text-4xl font-black text-navy">{value}</p>
    </div>
  );
}

function buildUsageMap(projectMedia: ProjectMediaUsage[], sectionMedia: SiteSectionUsage[]) {
  const usage = new Map<string, string[]>();

  for (const row of projectMedia) {
    if (!row.media_asset_id) {
      continue;
    }

    const projectTitle = Array.isArray(row.projects) ? row.projects[0]?.title : row.projects?.title;
    const label = `Story: ${projectTitle ?? "Project"} / ${row.role}`;
    usage.set(row.media_asset_id, [...(usage.get(row.media_asset_id) ?? []), label]);
  }

  for (const row of sectionMedia) {
    if (!row.media_asset_id) {
      continue;
    }

    const label = `Page: ${row.page_slug} / ${row.label}`;
    usage.set(row.media_asset_id, [...(usage.get(row.media_asset_id) ?? []), label]);
  }

  return usage;
}
