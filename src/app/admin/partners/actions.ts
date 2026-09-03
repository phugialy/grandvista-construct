"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { slugifyPartnerName, tradeCategories } from "@/lib/admin-partners";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function nullableString(formData: FormData, key: string) {
  const value = getString(formData, key);
  return value.length > 0 ? value : null;
}

function getSelect(formData: FormData, key: string, allowed: string[]) {
  const value = getString(formData, key);
  return allowed.includes(value) ? value : null;
}

async function getUniqueSlug(baseSlug: string, partnerId?: string) {
  const supabase = getSupabaseServiceClient();
  let candidate = baseSlug || "partner";
  let index = 2;

  while (true) {
    let query = supabase.from("vendor_partners").select("id").eq("slug", candidate);

    if (partnerId) {
      query = query.neq("id", partnerId);
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

async function partnerPayload(formData: FormData, partnerId?: string) {
  const name = getString(formData, "name");
  const slug = await getUniqueSlug(getString(formData, "slug") || slugifyPartnerName(name), partnerId);
  const sortOrderRaw = getString(formData, "sort_order");
  const sortOrder = sortOrderRaw ? Number.parseInt(sortOrderRaw, 10) : 0;

  return {
    slug,
    name,
    trade_category: getSelect(formData, "trade_category", tradeCategories),
    website_url: nullableString(formData, "website_url"),
    blurb: nullableString(formData, "blurb"),
    logo_url: nullableString(formData, "logo_url"),
    featured: formData.get("featured") === "on",
    published: formData.get("published") === "on",
    sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
    updated_at: new Date().toISOString(),
  };
}

function revalidatePartnerPaths() {
  revalidateTag("published-partners", "default");
  revalidatePath("/partners");
  revalidatePath("/admin/partners");
  revalidatePath("/");
  revalidatePath("/company");
}

export async function createPartner(formData: FormData) {
  await requireAdmin();

  const payload = await partnerPayload(formData);

  if (!payload.name || !payload.slug) {
    redirect("/admin/partners/new?status=missing");
  }

  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase.from("vendor_partners").insert(payload).select("id").single();

  if (error || !data) {
    console.error("Partner create failed", error);
    redirect("/admin/partners/new?status=error");
  }

  revalidatePartnerPaths();
  redirect(`/admin/partners/${data.id}?status=created`);
}

export async function updatePartner(formData: FormData) {
  await requireAdmin();

  const partnerId = getString(formData, "partner_id");
  const payload = await partnerPayload(formData, partnerId);

  if (!partnerId || !payload.name || !payload.slug) {
    redirect("/admin/partners?status=missing");
  }

  const supabase = getSupabaseServiceClient();
  const { error } = await supabase.from("vendor_partners").update(payload).eq("id", partnerId);

  if (error) {
    console.error("Partner update failed", error);
    redirect(`/admin/partners/${partnerId}?status=error`);
  }

  revalidatePartnerPaths();
  redirect(`/admin/partners/${partnerId}?status=saved`);
}

export async function deletePartner(formData: FormData) {
  await requireAdmin();

  const partnerId = getString(formData, "partner_id");

  if (!partnerId) {
    redirect("/admin/partners?status=missing");
  }

  const supabase = getSupabaseServiceClient();
  const { error } = await supabase.from("vendor_partners").delete().eq("id", partnerId);

  if (error) {
    console.error("Partner delete failed", error);
    redirect(`/admin/partners/${partnerId}?status=error`);
  }

  revalidatePartnerPaths();
  redirect("/admin/partners?status=deleted");
}
