"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearAdminSession, requireAdmin } from "@/lib/admin-auth";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

const allowedStatuses = new Set(["new", "reviewing", "qualified", "followed_up", "archived"]);

export async function updateLeadStatus(formData: FormData) {
  await requireAdmin();

  const leadId = formData.get("lead_id");
  const status = formData.get("status");

  if (typeof leadId !== "string" || typeof status !== "string" || !allowedStatuses.has(status)) {
    return;
  }

  const supabase = getSupabaseServiceClient();
  const { error } = await supabase.from("leads").update({ status }).eq("id", leadId);

  if (error) {
    console.error("Failed to update lead status", error);
    return;
  }

  revalidatePath("/admin/leads");
}

export async function logoutAdmin() {
  await clearAdminSession();
  redirect("/admin/login");
}
