"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
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

export async function applyStoryBody(formData: FormData) {
  await requireAdmin();

  const suggestionId = (formData.get("suggestion_id") as string | null)?.trim() ?? "";
  const projectId = (formData.get("project_id") as string | null)?.trim() ?? "";
  const content = (formData.get("content") as string | null)?.trim() ?? "";

  if (!suggestionId || !projectId || !content) {
    redirect("/admin/suggestions?status=missing");
  }

  const supabase = getSupabaseServiceClient();
  const [, { error: updateError }] = await Promise.all([
    supabase
      .from("agent_suggestions")
      .update({ status: "applied", reviewed_at: new Date().toISOString() })
      .eq("id", suggestionId),
    supabase
      .from("projects")
      .update({ story_body: content, updated_at: new Date().toISOString() })
      .eq("id", projectId),
  ]);

  if (updateError) {
    console.error("Apply story body failed", updateError);
    redirect("/admin/suggestions?status=error");
  }

  revalidatePath("/admin/suggestions");
  redirect(`/admin/projects/${projectId}?status=saved`);
}
