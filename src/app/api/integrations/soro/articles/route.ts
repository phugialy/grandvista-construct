import { revalidatePath, revalidateTag } from "next/cache";
import { cleanSeoDescription, hashSecret, slugifyBlogTitle, splitTags } from "@/lib/blog";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

type IncomingArticle = Record<string, unknown>;

function getString(payload: IncomingArticle, keys: string[]) {
  for (const key of keys) {
    const value = payload[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

function getTags(payload: IncomingArticle) {
  const value = payload.tags ?? payload.keywords ?? payload.categories;

  if (Array.isArray(value)) {
    return value
      .filter((tag): tag is string => typeof tag === "string")
      .map((tag) => tag.trim())
      .filter(Boolean)
      .slice(0, 12);
  }

  if (typeof value === "string") {
    return splitTags(value);
  }

  return [];
}

function getProvidedSecret(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";

  if (authorization.toLowerCase().startsWith("bearer ")) {
    return authorization.slice(7).trim();
  }

  return (
    request.headers.get("x-grandvista-blog-secret") ??
    request.headers.get("x-soro-secret") ??
    request.headers.get("x-webhook-secret") ??
    ""
  ).trim();
}

async function logWebhookEvent({
  externalId,
  message,
  payload,
  status,
}: {
  externalId: string | null;
  message: string;
  payload: IncomingArticle;
  status: "accepted" | "rejected" | "error";
}) {
  const supabase = getSupabaseServiceClient();
  await supabase.from("blog_webhook_events").insert({
    event_type: "article_upsert",
    external_id: externalId,
    message,
    payload,
    provider: "soro",
    status,
  });
}

async function getUniqueSlug(baseSlug: string, existingPostId?: string) {
  const supabase = getSupabaseServiceClient();
  let candidate = baseSlug || "grandvista-insight";
  let index = 2;

  while (true) {
    let query = supabase.from("blog_posts").select("id").eq("slug", candidate);

    if (existingPostId) {
      query = query.neq("id", existingPostId);
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

export async function POST(request: Request) {
  let payload: IncomingArticle = {};

  try {
    payload = (await request.json()) as IncomingArticle;
  } catch {
    return Response.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const supabase = getSupabaseServiceClient();
  const { data: settings, error: settingsError } = await supabase
    .from("blog_integration_settings")
    .select("enabled,webhook_secret_hash,default_status")
    .eq("provider", "soro")
    .maybeSingle();

  const externalId = getString(payload, ["external_id", "id", "article_id"]) || null;

  if (settingsError || !settings) {
    await logWebhookEvent({
      externalId,
      message: "Blog integration settings were not found.",
      payload,
      status: "error",
    });
    return Response.json({ error: "Blog integration is not configured." }, { status: 503 });
  }

  if (!settings.enabled) {
    await logWebhookEvent({
      externalId,
      message: "Blog integration is disabled.",
      payload,
      status: "rejected",
    });
    return Response.json({ error: "Blog integration is disabled." }, { status: 409 });
  }

  const providedSecret = getProvidedSecret(request);

  if (!settings.webhook_secret_hash || !providedSecret || hashSecret(providedSecret) !== settings.webhook_secret_hash) {
    await logWebhookEvent({
      externalId,
      message: "Webhook secret did not match.",
      payload,
      status: "rejected",
    });
    return Response.json({ error: "Unauthorized webhook request." }, { status: 401 });
  }

  const title = getString(payload, ["title", "headline", "name"]);

  if (!title) {
    await logWebhookEvent({
      externalId,
      message: "Article title is required.",
      payload,
      status: "rejected",
    });
    return Response.json({ error: "Article title is required." }, { status: 400 });
  }

  try {
    const existingPost =
      externalId
        ? await supabase.from("blog_posts").select("id,published_at").eq("external_id", externalId).maybeSingle()
        : { data: null, error: null };

    if (existingPost.error) {
      throw existingPost.error;
    }

    const body = getString(payload, ["body", "content", "html", "markdown", "article"]);
    const excerpt = getString(payload, ["excerpt", "summary", "description"]);
    const slug = await getUniqueSlug(
      getString(payload, ["slug"]) || slugifyBlogTitle(title),
      existingPost.data?.id,
    );
    const status = settings.default_status === "published" ? "published" : "draft";
    const publishedAt =
      status === "published" ? existingPost.data?.published_at ?? new Date().toISOString() : null;
    const articlePayload = {
      body: body || null,
      excerpt: excerpt || null,
      external_id: externalId,
      hero_image_alt: getString(payload, ["hero_image_alt", "image_alt", "featured_image_alt"]) || title,
      hero_image_url: getString(payload, ["hero_image_url", "image_url", "featured_image", "featured_image_url"]) || null,
      seo_description:
        getString(payload, ["seo_description", "meta_description"]) ||
        cleanSeoDescription(excerpt || body || title),
      seo_title: getString(payload, ["seo_title", "meta_title"]) || `${title} | Grandvista Insights`,
      slug,
      source: "soro",
      status,
      tags: getTags(payload),
      title,
      published_at: publishedAt,
      updated_at: new Date().toISOString(),
    };
    const result = existingPost.data?.id
      ? await supabase.from("blog_posts").update(articlePayload).eq("id", existingPost.data.id).select("id,slug").single()
      : await supabase.from("blog_posts").insert(articlePayload).select("id,slug").single();

    if (result.error) {
      throw result.error;
    }

    await supabase
      .from("blog_integration_settings")
      .update({
        last_sync_at: new Date().toISOString(),
        last_sync_status: `Accepted ${title}`,
        updated_at: new Date().toISOString(),
      })
      .eq("provider", "soro");

    await logWebhookEvent({
      externalId,
      message: `Accepted ${title}`,
      payload,
      status: "accepted",
    });

    revalidateTag("published-blog-posts", "default");
    revalidatePath("/insights");
    revalidatePath("/admin/blog-widgets");

    if (status === "published") {
      revalidateTag(`blog-post-${result.data.slug}`, "default");
      revalidatePath(`/insights/${result.data.slug}`);
      revalidatePath("/sitemap.xml");
    }

    return Response.json({
      id: result.data.id,
      slug: result.data.slug,
      status,
    });
  } catch (error) {
    console.error("Soro article webhook failed", error);
    await logWebhookEvent({
      externalId,
      message: error instanceof Error ? error.message : "Unknown webhook error.",
      payload,
      status: "error",
    });
    return Response.json({ error: "Article could not be saved." }, { status: 500 });
  }
}
