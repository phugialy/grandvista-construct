"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

export async function archiveMediaAsset(formData: FormData) {
  await requireAdmin();

  const id = formData.get("asset_id");

  if (typeof id !== "string" || !id) {
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
