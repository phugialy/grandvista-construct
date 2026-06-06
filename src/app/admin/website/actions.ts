"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function nullableString(formData: FormData, key: string) {
  const value = getString(formData, key);
  return value.length > 0 ? value : null;
}

export async function updateSiteSection(formData: FormData) {
  await requireAdmin();

  const sectionId = getString(formData, "section_id");
  const pageSlug = getString(formData, "page_slug");
  const mediaAssetIds = getMediaAssetIds(formData);
  const mediaAssetId = contentSourceMediaAssetId(formData, mediaAssetIds);
  const contentSource = getContentSource(formData);
  const featuredProjectIds = getFeaturedProjectIds(formData);
  const featuredProjectId = contentSource === "featured_project" ? featuredProjectIds[0] ?? null : null;

  if (!sectionId) {
    redirect("/admin/website?status=missing");
  }

  const supabase = getSupabaseServiceClient();
  const { error } = await supabase
    .from("site_sections")
    .update({
      headline: nullableString(formData, "headline"),
      body: nullableString(formData, "body"),
      media_asset_id: contentSource === "manual" ? mediaAssetId : null,
      content_source: contentSource,
      featured_project_id: featuredProjectId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", sectionId);

  if (error) {
    console.error("Site section update failed", error);
    redirect("/admin/website?status=error");
  }

  await syncFeaturedProjects(sectionId, contentSource === "featured_project" ? featuredProjectIds : []);
  await syncSectionMedia(sectionId, contentSource === "manual" ? mediaAssetIds : []);
  revalidatePath("/");
  revalidatePath("/project-stories");
  revalidatePath("/what-we-build");
  revalidatePath("/how-we-work");
  revalidatePath("/our-direction");
  revalidatePath("/company");
  const pageQuery = pageSlug ? `page=${encodeURIComponent(pageSlug)}&` : "";
  redirect(`/admin/website?${pageQuery}status=saved`);
}

async function syncSectionMedia(sectionId: string, mediaAssetIds: string[]) {
  const supabase = getSupabaseServiceClient();
  await supabase.from("site_section_media").delete().eq("site_section_id", sectionId);

  if (mediaAssetIds.length === 0) {
    return;
  }

  const rows = Array.from(new Set(mediaAssetIds)).slice(0, 8).map((mediaAssetId, index) => ({
    site_section_id: sectionId,
    media_asset_id: mediaAssetId,
    sort_order: (index + 1) * 10,
  }));
  const { error } = await supabase.from("site_section_media").insert(rows);

  if (error) {
    console.error("Section media sync failed", error);
  }
}

async function syncFeaturedProjects(sectionId: string, projectIds: string[]) {
  const supabase = getSupabaseServiceClient();
  await supabase.from("site_section_projects").delete().eq("site_section_id", sectionId);

  if (projectIds.length === 0) {
    return;
  }

  const rows = Array.from(new Set(projectIds)).slice(0, 5).map((projectId, index) => ({
    site_section_id: sectionId,
    project_id: projectId,
    sort_order: (index + 1) * 10,
  }));
  const { error } = await supabase.from("site_section_projects").insert(rows);

  if (error) {
    console.error("Featured project sync failed", error);
  }
}

function getFeaturedProjectIds(formData: FormData) {
  return formData
    .getAll("featured_project_ids")
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter(Boolean);
}

function getMediaAssetIds(formData: FormData) {
  const multiSelected = formData
    .getAll("media_asset_ids")
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter(Boolean);

  if (multiSelected.length > 0) {
    return multiSelected;
  }

  const singleSelected = nullableString(formData, "media_asset_id");
  return singleSelected ? [singleSelected] : [];
}

function contentSourceMediaAssetId(formData: FormData, mediaAssetIds: string[]) {
  return mediaAssetIds[0] ?? nullableString(formData, "media_asset_id");
}

function getContentSource(formData: FormData) {
  const value = getString(formData, "content_source");

  if (["manual", "featured_project", "fallback"].includes(value)) {
    return value as "manual" | "featured_project" | "fallback";
  }

  return "manual";
}
