"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminSession, requireAdmin } from "@/lib/admin-auth";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

const validStatuses = new Set(["new", "reviewing", "interview", "offer", "rejected"]);

export async function updateApplicationStatus(formData: FormData) {
  await requireAdmin();

  const applicationId = (formData.get("application_id") as string | null)?.trim() ?? "";
  const postingId = (formData.get("posting_id") as string | null)?.trim() ?? "";
  const status = (formData.get("status") as string | null)?.trim() ?? "";

  if (!applicationId || !postingId || !validStatuses.has(status)) {
    redirect(`/admin/careers/${postingId}/applicants?status=missing`);
  }

  const session = await getAdminSession();
  const supabase = getSupabaseServiceClient();
  const { error } = await supabase
    .from("applications")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", applicationId);

  if (error) {
    console.error("Application status update failed", error);
    redirect(`/admin/careers/${postingId}/applicants?status=error`);
  }

  await supabase.from("application_events").insert({
    application_id: applicationId,
    event_name: `status_changed_to_${status}`,
    actor: session?.email ?? "unknown",
    event_payload: { status },
  });

  revalidatePath(`/admin/careers/${postingId}/applicants`);
  redirect(`/admin/careers/${postingId}/applicants?status=updated`);
}
