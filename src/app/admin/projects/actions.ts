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

function nullableString(formData: FormData, key: string) {
  const value = getString(formData, key);
  return value.length > 0 ? value : null;
}

function getBoolean(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function projectPayload(formData: FormData) {
  const title = getString(formData, "title");
  const slug = getString(formData, "slug") || slugifyProjectTitle(title);

  return {
    slug,
    title,
    location: nullableString(formData, "location"),
    client_type: nullableString(formData, "client_type"),
    project_type: nullableString(formData, "project_type"),
    project_intent: nullableString(formData, "project_intent"),
    stakes: nullableString(formData, "stakes"),
    challenge: nullableString(formData, "challenge"),
    delivery_approach: nullableString(formData, "delivery_approach"),
    built_outcome: nullableString(formData, "built_outcome"),
    featured: getBoolean(formData, "featured"),
    published: getBoolean(formData, "published"),
    updated_at: new Date().toISOString(),
  };
}

export async function createProject(formData: FormData) {
  await requireAdmin();

  const payload = projectPayload(formData);

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
  const payload = projectPayload(formData);

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

async function syncProjectMedia(projectId: string, formData: FormData) {
  const heroUrl = nullableString(formData, "hero_url");
  const heroAlt = nullableString(formData, "hero_alt");
  const galleryUrl = nullableString(formData, "gallery_url");
  const galleryAlt = nullableString(formData, "gallery_alt");

  const supabase = getSupabaseServiceClient();
  await supabase.from("project_media").delete().eq("project_id", projectId);

  type MediaRow = {
    project_id: string;
    media_type: "image";
    role: "hero" | "gallery";
    url: string;
    alt: string | null;
    caption: string;
    sort_order: number;
  };

  const rows: MediaRow[] = [];

  if (heroUrl) {
    rows.push({
      project_id: projectId,
      media_type: "image",
      role: "hero",
      url: heroUrl,
      alt: heroAlt,
      caption: "Project hero image",
      sort_order: 10,
    });
  }

  if (galleryUrl) {
    rows.push({
      project_id: projectId,
      media_type: "image",
      role: "gallery",
      url: galleryUrl,
      alt: galleryAlt,
      caption: "Project gallery image",
      sort_order: 20,
    });
  }

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
