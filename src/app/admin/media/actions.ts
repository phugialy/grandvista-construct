"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { slugifyProjectTitle } from "@/lib/admin-projects";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getSelectedAssetIds(formData: FormData) {
  return formData
    .getAll("asset_ids")
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0);
}

export async function archiveMediaAsset(formData: FormData) {
  await requireAdmin();

  const id = getString(formData, "asset_id");

  if (!id) {
    redirect("/admin/media?status=missing");
  }

  const supabase = getSupabaseServiceClient();
  const { error } = await supabase
    .from("media_assets")
    .update({ status: "archived", updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("Media archive failed", error);
    redirect("/admin/media?status=error");
  }

  revalidatePath("/admin/media");
  redirect("/admin/media?status=archived");
}

export async function archiveSelectedMedia(formData: FormData) {
  await requireAdmin();

  const assetIds = getSelectedAssetIds(formData);

  if (assetIds.length === 0) {
    redirect("/admin/media?status=missing");
  }

  const supabase = getSupabaseServiceClient();
  const { error } = await supabase
    .from("media_assets")
    .update({ status: "archived", updated_at: new Date().toISOString() })
    .in("id", assetIds);

  if (error) {
    console.error("Bulk media archive failed", error);
    redirect("/admin/media?status=error");
  }

  revalidatePath("/admin/media");
  redirect("/admin/media?status=archived");
}

export async function tagSelectedMedia(formData: FormData) {
  await requireAdmin();

  const assetIds = getSelectedAssetIds(formData);
  const tags = formData
    .getAll("tags")
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter(Boolean);

  if (assetIds.length === 0) {
    redirect("/admin/media?status=missing");
  }

  const supabase = getSupabaseServiceClient();
  const { error } = await supabase
    .from("media_assets")
    .update({ tags: Array.from(new Set(tags)), updated_at: new Date().toISOString() })
    .in("id", assetIds);

  if (error) {
    console.error("Media tag update failed", error);
    redirect("/admin/media?status=error");
  }

  revalidatePath("/admin/media");
  redirect("/admin/media?status=tagged");
}

export async function assignMediaToSiteSection(formData: FormData) {
  await requireAdmin();

  const sectionId = getString(formData, "section_id");
  const [mediaAssetId] = getSelectedAssetIds(formData);

  if (!sectionId || !mediaAssetId) {
    redirect("/admin/media?status=missing");
  }

  const supabase = getSupabaseServiceClient();
  const { error } = await supabase
    .from("site_sections")
    .update({ media_asset_id: mediaAssetId, updated_at: new Date().toISOString() })
    .eq("id", sectionId);

  if (error) {
    console.error("Media site section assignment failed", error);
    redirect("/admin/media?status=error");
  }

  revalidateWebsitePaths();
  redirect("/admin/media?status=assigned");
}

export async function assignMediaToProject(formData: FormData) {
  await requireAdmin();

  const assetIds = getSelectedAssetIds(formData);
  const projectId = getString(formData, "project_id");
  const role = getString(formData, "role") || "gallery";

  if (assetIds.length === 0 || !projectId) {
    redirect("/admin/media?status=missing");
  }

  await syncProjectAssignment(projectId, assetIds, role);
  revalidateProjectPaths();
  redirect("/admin/media?status=assigned");
}

export async function createDraftProjectFromMedia(formData: FormData) {
  await requireAdmin();

  const assetIds = getSelectedAssetIds(formData);
  const title = getString(formData, "title");

  if (assetIds.length === 0 || !title) {
    redirect("/admin/media?status=missing");
  }

  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("projects")
    .insert({
      title,
      slug: await getUniqueProjectSlug(slugifyProjectTitle(title)),
      location: getString(formData, "location") || null,
      project_type: getString(formData, "project_type") || null,
      summary: "Draft story created from uploaded media.",
      published: false,
      featured: false,
      seo_title: `${title} | Grandvista`,
      seo_description: `${title} project story draft for Grandvista Construction.`.slice(0, 156),
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("Draft project from media failed", error);
    redirect("/admin/media?status=error");
  }

  await syncProjectAssignment(data.id, assetIds, "hero");
  revalidateProjectPaths();
  redirect(`/admin/projects/${data.id}?status=created`);
}

async function syncProjectAssignment(projectId: string, assetIds: string[], requestedRole: string) {
  const role = normalizeProjectMediaRole(requestedRole);
  const supabase = getSupabaseServiceClient();
  const { data: assets } = await supabase
    .from("media_assets")
    .select("id,media_type,public_url,alt_text,caption")
    .in("id", assetIds)
    .eq("status", "ready");

  if (!assets || assets.length === 0) {
    return;
  }

  const { data: existingRows } = await supabase
    .from("project_media")
    .select("media_asset_id,sort_order,role")
    .eq("project_id", projectId);
  const existingAssetIds = new Set((existingRows ?? []).map((row) => row.media_asset_id));
  const maxSortOrder = Math.max(0, ...(existingRows ?? []).map((row) => row.sort_order ?? 0));

  if (role === "hero") {
    await supabase.from("project_media").delete().eq("project_id", projectId).eq("role", "hero");
  }

  const rows = assets
    .filter((asset, index) => role === "hero" || !existingAssetIds.has(asset.id) || index === 0)
    .map((asset, index) => ({
      project_id: projectId,
      media_asset_id: asset.id,
      media_type: asset.media_type,
      role: role === "hero" && index > 0 ? "gallery" : role,
      url: asset.public_url,
      alt: asset.alt_text,
      caption: asset.caption,
      sort_order: role === "hero" && index === 0 ? 10 : maxSortOrder + 10 + index,
    }));

  if (rows.length === 0) {
    return;
  }

  const { error } = await supabase.from("project_media").insert(rows);

  if (error) {
    console.error("Project media assignment failed", error);
  }
}

function normalizeProjectMediaRole(role: string) {
  if (["hero", "gallery", "before", "during", "after"].includes(role)) {
    return role as "hero" | "gallery" | "before" | "during" | "after";
  }

  return "gallery";
}

async function getUniqueProjectSlug(baseSlug: string) {
  const supabase = getSupabaseServiceClient();
  let candidate = baseSlug || "project-story";
  let index = 2;

  while (true) {
    const { data, error } = await supabase.from("projects").select("id").eq("slug", candidate).maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return candidate;
    }

    candidate = `${baseSlug}-${index}`;
    index += 1;
  }
}

function revalidateWebsitePaths() {
  revalidatePath("/");
  revalidatePath("/project-stories");
  revalidatePath("/what-we-build");
  revalidatePath("/how-we-work");
  revalidatePath("/our-direction");
  revalidatePath("/company");
  revalidatePath("/admin/media");
  revalidatePath("/admin/website");
}

function revalidateProjectPaths() {
  revalidatePath("/admin/media");
  revalidatePath("/admin/projects");
  revalidatePath("/project-stories");
}
