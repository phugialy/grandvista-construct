"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { builtOutcomes, clientGoals, projectPressures, projectTags, projectTypes, slugifyProjectTitle } from "@/lib/admin-projects";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function nullableString(formData: FormData, key: string) {
  const value = getString(formData, key);
  return value.length > 0 ? value : null;
}

function getBoolean(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function getSelections(formData: FormData, key: string, allowed: string[]) {
  return formData
    .getAll(key)
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter((value) => allowed.includes(value));
}

function getSelect(formData: FormData, key: string, allowed: string[]) {
  const value = getString(formData, key);
  return allowed.includes(value) ? value : null;
}

function fallbackSeoTitle(title: string) {
  return title ? `${title} | Grandvista` : null;
}

function fallbackSeoDescription(formData: FormData) {
  const title = getString(formData, "title");
  const projectType = getSelect(formData, "project_type", projectTypes);
  const location = nullableString(formData, "location");
  const summary = nullableString(formData, "summary");

  if (summary) {
    return summary.slice(0, 156);
  }

  return [title, projectType, location]
    .filter(Boolean)
    .join(" / ")
    .slice(0, 156) || null;
}

async function getUniqueSlug(baseSlug: string, projectId?: string) {
  const supabase = getSupabaseServiceClient();
  let candidate = baseSlug || "project-story";
  let index = 2;

  while (true) {
    let query = supabase.from("projects").select("id").eq("slug", candidate);

    if (projectId) {
      query = query.neq("id", projectId);
    }

    const { data, error } = await query.maybeSingle();

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

async function projectPayload(formData: FormData, projectId?: string) {
  const title = getString(formData, "title");
  const slug = await getUniqueSlug(getString(formData, "slug") || slugifyProjectTitle(title), projectId);
  const summary = nullableString(formData, "summary");
  const projectType = getSelect(formData, "project_type", projectTypes);
  const clientGoal = getSelect(formData, "client_goal", clientGoals);
  const selectedPressures = getSelections(formData, "project_pressures", projectPressures);
  const selectedOutcomes = getSelections(formData, "built_outcomes", builtOutcomes);

  return {
    slug,
    title,
    location: nullableString(formData, "location"),
    client_type: nullableString(formData, "client_type"),
    project_type: projectType,
    summary,
    client_goal: clientGoal,
    project_pressures: selectedPressures,
    built_outcomes: selectedOutcomes,
    tags: getSelections(formData, "tags", projectTags),
    seo_title: nullableString(formData, "seo_title") || fallbackSeoTitle(title),
    seo_description: nullableString(formData, "seo_description") || fallbackSeoDescription(formData),
    project_intent: summary,
    stakes: selectedPressures.join(", ") || null,
    challenge: nullableString(formData, "challenge"),
    delivery_approach: nullableString(formData, "delivery_approach"),
    built_outcome: selectedOutcomes.join(", ") || null,
    featured: getBoolean(formData, "featured"),
    published: getBoolean(formData, "published"),
    updated_at: new Date().toISOString(),
  };
}

export async function createProject(formData: FormData) {
  await requireAdmin();

  const payload = await projectPayload(formData);

  if (!payload.title || !payload.slug) {
    redirect("/admin/projects/new?status=missing");
  }

  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("projects")
    .insert(payload)
    .select("id")
    .single();

  if (error || !data) {
    console.error("Project create failed", error);
    redirect("/admin/projects/new?status=error");
  }

  await syncProjectMedia(data.id, formData);
  revalidateProjectPaths();
  redirect(`/admin/projects/${data.id}?status=created`);
}

export async function updateProject(formData: FormData) {
  await requireAdmin();

  const projectId = getString(formData, "project_id");
  const payload = await projectPayload(formData, projectId);

  if (!projectId || !payload.title || !payload.slug) {
    redirect("/admin/projects?status=missing");
  }

  const supabase = getSupabaseServiceClient();
  const { error } = await supabase.from("projects").update(payload).eq("id", projectId);

  if (error) {
    console.error("Project update failed", error);
    redirect(`/admin/projects/${projectId}?status=error`);
  }

  await syncProjectMedia(projectId, formData);
  revalidateProjectPaths(payload.slug);
  redirect(`/admin/projects/${projectId}?status=saved`);
}

export async function deleteProject(formData: FormData) {
  await requireAdmin();

  const projectId = getString(formData, "project_id");

  if (!projectId) {
    redirect("/admin/projects?status=missing");
  }

  const supabase = getSupabaseServiceClient();
  const { data: project } = await supabase
    .from("projects")
    .select("slug")
    .eq("id", projectId)
    .maybeSingle();
  const { error } = await supabase.from("projects").delete().eq("id", projectId);

  if (error) {
    console.error("Project delete failed", error);
    redirect(`/admin/projects/${projectId}?status=error`);
  }

  revalidateProjectPaths(project?.slug ?? undefined);
  revalidatePath("/");
  revalidatePath("/admin/projects");
  revalidatePath("/admin/media");
  revalidatePath("/admin/website");
  revalidatePath("/what-we-build");
  revalidatePath("/how-we-work");
  revalidatePath("/our-direction");
  revalidatePath("/company");
  redirect("/admin/projects?status=deleted");
}

async function syncProjectMedia(projectId: string, formData: FormData) {
  const heroAssetId = nullableString(formData, "hero_asset_id");
  const galleryAssetIds = formData
    .getAll("gallery_asset_ids")
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0);

  const supabase = getSupabaseServiceClient();
  await supabase.from("project_media").delete().eq("project_id", projectId);

  const assetIds = [heroAssetId, ...galleryAssetIds].filter((value): value is string => Boolean(value));
  const { data: assets } = assetIds.length
    ? await supabase
        .from("media_assets")
        .select("id,media_type,public_url,alt_text,caption")
        .in("id", assetIds)
        .eq("status", "ready")
    : { data: [] };

  const getAsset = (id: string | null) => assets?.find((asset) => asset.id === id);

  type MediaRow = {
    project_id: string;
    media_asset_id: string;
    media_type: "image" | "video";
    role: "hero" | "gallery";
    url: string;
    alt: string | null;
    caption: string | null;
    sort_order: number;
  };

  const rows: MediaRow[] = [];
  const heroAsset = getAsset(heroAssetId);

  if (heroAsset) {
    rows.push({
      project_id: projectId,
      media_asset_id: heroAsset.id,
      media_type: heroAsset.media_type,
      role: "hero",
      url: heroAsset.public_url,
      alt: heroAsset.alt_text,
      caption: heroAsset.caption,
      sort_order: 10,
    });
  }

  galleryAssetIds.forEach((assetId, index) => {
    const asset = getAsset(assetId);

    if (!asset || asset.id === heroAsset?.id) {
      return;
    }

    rows.push({
      project_id: projectId,
      media_asset_id: asset.id,
      media_type: asset.media_type,
      role: "gallery",
      url: asset.public_url,
      alt: asset.alt_text,
      caption: asset.caption,
      sort_order: 20 + index,
    });
  });

  if (rows.length > 0) {
    const { error } = await supabase.from("project_media").insert(rows);

    if (error) {
      console.error("Project media sync failed", error);
    }
  }
}

function revalidateProjectPaths(slug?: string) {
  revalidatePath("/project-stories");

  if (slug) {
    revalidatePath(`/project-stories/${slug}`);
  }
}
