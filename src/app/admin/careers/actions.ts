"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { departments, employmentTypes, isJobPostingStatus, slugifyJobTitle } from "@/lib/admin-careers";
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

async function getUniqueSlug(baseSlug: string, postingId?: string) {
  const supabase = getSupabaseServiceClient();
  let candidate = baseSlug || "job-posting";
  let index = 2;

  while (true) {
    let query = supabase.from("job_postings").select("id").eq("slug", candidate);

    if (postingId) {
      query = query.neq("id", postingId);
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

async function jobPostingPayload(formData: FormData, postingId?: string) {
  const title = getString(formData, "title");
  const slug = await getUniqueSlug(getString(formData, "slug") || slugifyJobTitle(title), postingId);
  const status = isJobPostingStatus(getString(formData, "status")) ? getString(formData, "status") : "draft";
  const closesAt = getString(formData, "closes_at");

  return {
    slug,
    title,
    department: getSelect(formData, "department", departments),
    location: nullableString(formData, "location"),
    employment_type: getSelect(formData, "employment_type", employmentTypes),
    pay_range: nullableString(formData, "pay_range"),
    summary: nullableString(formData, "summary"),
    description: nullableString(formData, "description"),
    status,
    closes_at: closesAt ? new Date(closesAt).toISOString() : null,
    hero_image_url: nullableString(formData, "hero_image_url"),
    hero_image_alt: nullableString(formData, "hero_image_alt"),
    updated_at: new Date().toISOString(),
  };
}

function revalidateCareersPaths(slug?: string) {
  revalidateTag("published-job-postings", "default");
  revalidatePath("/careers");
  revalidatePath("/admin/careers");

  if (slug) {
    revalidateTag(`job-posting-${slug}`, "default");
    revalidatePath(`/careers/${slug}`);
  }
}

export async function createJobPosting(formData: FormData) {
  await requireAdmin();

  const payload = await jobPostingPayload(formData);

  if (!payload.title || !payload.slug) {
    redirect("/admin/careers/new?status=missing");
  }

  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase.from("job_postings").insert(payload).select("id").single();

  if (error || !data) {
    console.error("Job posting create failed", error);
    redirect("/admin/careers/new?status=error");
  }

  revalidateCareersPaths(payload.slug);
  redirect(`/admin/careers/${data.id}?status=created`);
}

export async function updateJobPosting(formData: FormData) {
  await requireAdmin();

  const postingId = getString(formData, "posting_id");
  const payload = await jobPostingPayload(formData, postingId);

  if (!postingId || !payload.title || !payload.slug) {
    redirect("/admin/careers?status=missing");
  }

  const supabase = getSupabaseServiceClient();
  const { error } = await supabase.from("job_postings").update(payload).eq("id", postingId);

  if (error) {
    console.error("Job posting update failed", error);
    redirect(`/admin/careers/${postingId}?status=error`);
  }

  revalidateCareersPaths(payload.slug);
  redirect(`/admin/careers/${postingId}?status=saved`);
}

export async function deleteJobPosting(formData: FormData) {
  await requireAdmin();

  const postingId = getString(formData, "posting_id");

  if (!postingId) {
    redirect("/admin/careers?status=missing");
  }

  const supabase = getSupabaseServiceClient();
  const { count } = await supabase
    .from("applications")
    .select("id", { count: "exact", head: true })
    .eq("job_posting_id", postingId);

  if ((count ?? 0) > 0) {
    redirect(`/admin/careers/${postingId}?status=has_applications`);
  }

  const { data: posting } = await supabase.from("job_postings").select("slug").eq("id", postingId).maybeSingle();
  const { error } = await supabase.from("job_postings").delete().eq("id", postingId);

  if (error) {
    console.error("Job posting delete failed", error);
    redirect(`/admin/careers/${postingId}?status=error`);
  }

  revalidateCareersPaths(posting?.slug ?? undefined);
  redirect("/admin/careers?status=deleted");
}
