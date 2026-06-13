"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

export async function addRecipient(formData: FormData) {
  await requireAdmin();

  const email = (formData.get("email") as string | null)?.trim() ?? "";
  const name = (formData.get("name") as string | null)?.trim() || null;

  if (!email) {
    redirect("/admin/settings?status=missing");
  }

  const supabase = getSupabaseServiceClient();
  const { error } = await supabase
    .from("notification_recipients")
    .insert({ email, name, active: true });

  if (error) {
    if (error.message.includes("unique")) {
      redirect("/admin/settings?status=duplicate");
    }
    console.error("Add recipient failed", error);
    redirect("/admin/settings?status=error");
  }

  redirect("/admin/settings?status=added");
}

export async function toggleRecipient(formData: FormData) {
  await requireAdmin();

  const id = (formData.get("id") as string | null)?.trim() ?? "";
  const active = formData.get("active") === "true";

  if (!id) {
    redirect("/admin/settings");
  }

  const supabase = getSupabaseServiceClient();
  await supabase.from("notification_recipients").update({ active }).eq("id", id);

  redirect("/admin/settings?status=saved");
}

export async function deleteRecipient(formData: FormData) {
  await requireAdmin();

  const id = (formData.get("id") as string | null)?.trim() ?? "";

  if (!id) {
    redirect("/admin/settings");
  }

  const supabase = getSupabaseServiceClient();
  await supabase.from("notification_recipients").delete().eq("id", id);

  redirect("/admin/settings?status=deleted");
}
