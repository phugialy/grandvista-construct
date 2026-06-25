"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { cleanSeoDescription, hashSecret, isBlogStatus, splitTags } from "@/lib/blog";
import { requireAdmin, requireMasterAdmin } from "@/lib/admin-auth";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

const ADMIN_BLOG_PATH = "/admin/blog-widgets";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function nullableString(formData: FormData, key: string) {
  const value = getString(formData, key);
  return value.length > 0 ? value : null;
}

function normalizeInstallStatus(value: string) {
  if (
    value === "not_started" ||
    value === "waiting_on_provider" ||
    value === "testing" ||
    value === "active" ||
    value === "paused"
  ) {
    return value;
  }

  return "not_started";
}

function revalidateBlog() {
  revalidateTag("blog-settings", "default");
  revalidateTag("published-blog-posts", "default");
  revalidatePath("/blog-widgets");
  revalidatePath("/insights");
  revalidatePath("/sitemap.xml");
}

export async function updateBlogIntegration(formData: FormData) {
  await requireMasterAdmin();

  const settingId = getString(formData, "setting_id");
  const defaultStatus = getString(formData, "default_status");
  const postsPerPage = Number.parseInt(getString(formData, "posts_per_page"), 10);
  const webhookSecret = getString(formData, "webhook_secret");
  const outboundApiKey = getString(formData, "outbound_api_key");
  const payload: Record<string, unknown> = {
    enabled: formData.get("enabled") === "on",
    default_status: defaultStatus === "published" ? "published" : "draft",
    outbound_api_base_url: nullableString(formData, "outbound_api_base_url"),
    posts_per_page: Number.isFinite(postsPerPage) ? Math.min(Math.max(postsPerPage, 3), 24) : 9,
    provider_account_email: nullableString(formData, "provider_account_email"),
    provider_display_name: getString(formData, "provider_display_name") || "Sora AI",
    provider_install_notes: nullableString(formData, "provider_install_notes"),
    provider_install_status: normalizeInstallStatus(getString(formData, "provider_install_status")),
    updated_at: new Date().toISOString(),
    webhook_payload_notes: nullableString(formData, "webhook_payload_notes"),
  };

  if (webhookSecret) {
    payload.webhook_secret_hash = hashSecret(webhookSecret);
  }

  if (outboundApiKey) {
    payload.outbound_api_key_hash = hashSecret(outboundApiKey);
    payload.outbound_api_key_last4 = outboundApiKey.slice(-4);
  }

  const supabase = getSupabaseServiceClient();
  const query = settingId
    ? supabase.from("blog_integration_settings").update(payload).eq("id", settingId)
    : supabase.from("blog_integration_settings").insert({
        provider: "soro",
        ...payload,
      });
  const { error } = await query;

  if (error) {
    console.error("Blog integration update failed", error);
    redirect(`${ADMIN_BLOG_PATH}?status=error`);
  }

  revalidateBlog();
  redirect(`${ADMIN_BLOG_PATH}?status=settings_saved`);
}

export async function updateBlogPost(formData: FormData) {
  await requireAdmin();

  const postId = getString(formData, "post_id");
  const status = getString(formData, "status");
  const title = getString(formData, "title");

  if (!postId || !title || !isBlogStatus(status)) {
    redirect(`${ADMIN_BLOG_PATH}?status=missing`);
  }

  const publishedAt = status === "published" ? new Date().toISOString() : null;
  const body = nullableString(formData, "body");
  const excerpt = nullableString(formData, "excerpt");
  const seoDescription =
    nullableString(formData, "seo_description") ?? cleanSeoDescription(excerpt ?? body ?? title);
  const supabase = getSupabaseServiceClient();
  const { data: existing } = await supabase
    .from("blog_posts")
    .select("published_at")
    .eq("id", postId)
    .maybeSingle();
  const { error } = await supabase
    .from("blog_posts")
    .update({
      body,
      excerpt,
      featured: formData.get("featured") === "on",
      hero_image_alt: nullableString(formData, "hero_image_alt"),
      hero_image_url: nullableString(formData, "hero_image_url"),
      seo_description: seoDescription,
      seo_title: nullableString(formData, "seo_title") ?? `${title} | Grandvista Insights`,
      status,
      tags: splitTags(getString(formData, "tags")),
      title,
      published_at: status === "published" ? existing?.published_at ?? publishedAt : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", postId);

  if (error) {
    console.error("Blog post update failed", error);
    redirect(`${ADMIN_BLOG_PATH}?status=error`);
  }

  revalidateBlog();
  redirect(`${ADMIN_BLOG_PATH}?status=post_saved`);
}

export async function deleteBlogPost(formData: FormData) {
  await requireAdmin();

  const postId = getString(formData, "post_id");

  if (!postId) {
    redirect(`${ADMIN_BLOG_PATH}?status=missing`);
  }

  const supabase = getSupabaseServiceClient();
  const { data: post } = await supabase.from("blog_posts").select("slug").eq("id", postId).maybeSingle();
  const { error } = await supabase.from("blog_posts").delete().eq("id", postId);

  if (error) {
    console.error("Blog post delete failed", error);
    redirect(`${ADMIN_BLOG_PATH}?status=error`);
  }

  if (post?.slug) {
    revalidateTag(`blog-post-${post.slug}`, "default");
    revalidatePath(`/insights/${post.slug}`);
  }
  revalidateBlog();
  redirect(`${ADMIN_BLOG_PATH}?status=post_deleted`);
}
