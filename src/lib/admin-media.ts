import { getSupabaseServiceClient } from "@/lib/supabase/server";

export type AdminMediaAsset = {
  id: string;
  public_url: string;
  media_type: "image" | "video";
  alt_text: string | null;
  caption: string | null;
  tags: string[];
};

export async function getAssignableProjectMedia(projectId?: string) {
  const supabase = getSupabaseServiceClient();
  const { data: assignedRows } = await supabase
    .from("project_media")
    .select("project_id,media_asset_id")
    .not("media_asset_id", "is", null);
  const assignedToOtherProjects = new Set(
    (assignedRows ?? [])
      .filter((row) => row.project_id !== projectId && row.media_asset_id)
      .map((row) => row.media_asset_id as string),
  );

  const { data: assets } = await supabase
    .from("media_assets")
    .select("id,public_url,media_type,alt_text,caption,tags")
    .eq("status", "ready")
    .order("created_at", { ascending: false })
    .limit(120);

  return ((assets ?? []) as AdminMediaAsset[]).filter((asset) => !assignedToOtherProjects.has(asset.id));
}
