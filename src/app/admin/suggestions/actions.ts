"use server";

import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

export async function reviewSuggestion(formData: FormData) {
  await requireAdmin();

  const id = (formData.get("id") as string | null)?.trim() ?? "";
  const action = (formData.get("action") as string | null)?.trim() ?? "";

  if (!id || !["accept", "reject"].includes(action)) {
    redirect("/admin/suggestions");
  }

  const status = action === "accept" ? "accepted" : "rejected";
  const supabase = getSupabaseServiceClient();
  await supabase
    .from("agent_suggestions")
    .update({ status, reviewed_at: new Date().toISOString() })
    .eq("id", id);

  revalidatePath("/admin/suggestions");
  redirect(`/admin/suggestions?status=${status}`);
}

const projectSuggestionFields: Record<string, "story_body" | "summary" | "seo_title" | "seo_description"> = {
  story_body: "story_body",
  project_summary: "summary",
  seo_title: "seo_title",
  seo_description: "seo_description",
};

export async function applyProjectSuggestion(formData: FormData) {
  await requireAdmin();

  const suggestionId = (formData.get("suggestion_id") as string | null)?.trim() ?? "";
  const projectId = (formData.get("project_id") as string | null)?.trim() ?? "";
  const type = (formData.get("type") as string | null)?.trim() ?? "";
  const content = (formData.get("content") as string | null)?.trim() ?? "";
  const field = projectSuggestionFields[type];

  if (!suggestionId || !projectId || !content || !field) {
    redirect("/admin/suggestions?status=missing");
  }

  const supabase = getSupabaseServiceClient();
  const [{ data: project }, , { error: updateError }] = await Promise.all([
    supabase.from("projects").select("slug").eq("id", projectId).maybeSingle(),
    supabase
      .from("agent_suggestions")
      .update({ status: "applied", reviewed_at: new Date().toISOString() })
      .eq("id", suggestionId),
    supabase
      .from("projects")
      .update({ [field]: content, updated_at: new Date().toISOString() })
      .eq("id", projectId),
  ]);

  if (updateError) {
    console.error("Apply project suggestion failed", updateError);
    redirect("/admin/suggestions?status=error");
  }

  revalidatePath("/admin/suggestions");
  revalidateTag("published-projects", "default");
  if (project?.slug) {
    revalidateTag(`project-${project.slug}`, "default");
    revalidatePath(`/project-stories/${project.slug}`);
  }
  revalidatePath("/project-stories");
  redirect(`/admin/projects/${projectId}?status=saved`);
}
