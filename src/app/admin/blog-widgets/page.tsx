import Link from "next/link";
import { BookOpen, Eye, KeyRound, Trash2, Webhook } from "lucide-react";
import { AdminNav } from "@/components/admin/admin-nav";
import { requireAdmin } from "@/lib/admin-auth";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { deleteBlogPost, updateBlogIntegration, updateBlogPost } from "./actions";

type BlogSettings = {
  id: string;
  provider: string;
  provider_display_name: string | null;
  provider_account_email: string | null;
  provider_install_status: "not_started" | "waiting_on_provider" | "testing" | "active" | "paused" | null;
  provider_install_notes: string | null;
  outbound_api_base_url: string | null;
  outbound_api_key_hash: string | null;
  outbound_api_key_last4: string | null;
  webhook_payload_notes: string | null;
  enabled: boolean;
  webhook_secret_hash: string | null;
  default_status: "draft" | "published";
  posts_per_page: number;
  last_sync_status: string | null;
  last_sync_at: string | null;
};

type AdminBlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string | null;
  hero_image_url: string | null;
  hero_image_alt: string | null;
  tags: string[] | null;
  seo_title: string | null;
  seo_description: string | null;
  status: "draft" | "published" | "hidden";
  featured: boolean;
  source: string;
  external_id: string | null;
  published_at: string | null;
  updated_at: string | null;
};

type WebhookEvent = {
  id: string;
  provider: string;
  status: "received" | "accepted" | "rejected" | "error";
  message: string | null;
  external_id: string | null;
  created_at: string;
};

const inputClass =
  "min-h-12 border border-ink/14 bg-white p-4 text-base text-ink outline-none transition placeholder:text-steel/70 focus:border-navy";

const statusMessages: Record<string, { tone: "good" | "warn"; text: string }> = {
  error: { tone: "warn", text: "Something failed while updating the blog widget." },
  missing: { tone: "warn", text: "Required blog information is missing." },
  post_deleted: { tone: "good", text: "Blog post deleted." },
  post_saved: { tone: "good", text: "Blog post saved." },
  settings_saved: { tone: "good", text: "Blog widget settings saved." },
};

export default async function AdminBlogWidgetsPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string }>;
}) {
  await requireAdmin();

  const params = await searchParams;
  const statusMessage = params?.status ? statusMessages[params.status] : null;
  const supabase = getSupabaseServiceClient();
  const [{ data: settings }, { data: posts }, { data: events }] = await Promise.all([
    supabase
      .from("blog_integration_settings")
      .select("*")
      .eq("provider", "soro")
      .maybeSingle(),
    supabase
      .from("blog_posts")
      .select(
        "id,title,slug,excerpt,body,hero_image_url,hero_image_alt,tags,seo_title,seo_description,status,featured,source,external_id,published_at,updated_at",
      )
      .order("updated_at", { ascending: false }),
    supabase
      .from("blog_webhook_events")
      .select("id,provider,status,message,external_id,created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const blogSettings = settings as BlogSettings | null;
  const blogPosts = (posts ?? []) as AdminBlogPost[];
  const webhookEvents = (events ?? []) as WebhookEvent[];
  const providerName = blogSettings?.provider_display_name ?? "Sora AI";
  const webhookUrl = "https://grandvista-construction.com/api/integrations/sora/articles";
  const legacyWebhookUrl = "https://grandvista-construction.com/api/integrations/soro/articles";
  const previewUrl = "https://grandvista-construction.com/blog-widgets";

  return (
    <main className="min-h-screen bg-warm-white text-ink">
      <AdminNav
        title="Blog Widgets"
        description="Control third-party article intake, review drafts, and publish Grandvista insights."
      />

      <section className="section-shell py-10">
        {statusMessage ? (
          <p
            className={`mb-6 border p-4 text-sm font-bold ${
              statusMessage.tone === "good"
                ? "border-navy/20 bg-white text-navy"
                : "border-brand-red/20 bg-white text-brand-red"
            }`}
          >
            {statusMessage.text}
          </p>
        ) : null}

        <div className="grid gap-8 lg:grid-cols-[0.86fr_1.14fr]">
          <section className="border border-ink/12 bg-white p-6">
            <div className="flex items-center gap-3">
              <Webhook className="text-brand-red" size={22} />
              <p className="text-sm font-black uppercase tracking-[0.12em] text-brand-red">
                Provider setup
              </p>
            </div>
            <h2 className="mt-3 text-3xl font-black leading-tight">{providerName} article intake</h2>
            <p className="mt-4 leading-7 text-steel">
              Turn on the widget when the content provider is ready. Incoming articles should land
              as drafts unless the team intentionally changes the default.
            </p>

            <form action={updateBlogIntegration} className="mt-6 grid gap-4">
              <input name="setting_id" type="hidden" value={blogSettings?.id ?? ""} />
              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-xs font-black uppercase tracking-[0.12em] text-steel">
                    Provider display name
                  </span>
                  <input
                    className={inputClass}
                    defaultValue={providerName}
                    name="provider_display_name"
                    placeholder="Sora AI"
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-xs font-black uppercase tracking-[0.12em] text-steel">
                    Provider account email
                  </span>
                  <input
                    className={inputClass}
                    defaultValue={blogSettings?.provider_account_email ?? ""}
                    name="provider_account_email"
                    placeholder="account@sora-provider.com"
                    type="email"
                  />
                </label>
              </div>

              <label className="grid gap-2">
                <span className="text-xs font-black uppercase tracking-[0.12em] text-steel">
                  Install status
                </span>
                <select
                  className={inputClass}
                  defaultValue={blogSettings?.provider_install_status ?? "not_started"}
                  name="provider_install_status"
                >
                  <option value="not_started">Not started</option>
                  <option value="waiting_on_provider">Waiting on provider</option>
                  <option value="testing">Testing</option>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                </select>
              </label>

              <label className="flex items-start gap-3 border border-ink/10 bg-warm-white p-4">
                <input
                  className="mt-1 h-5 w-5"
                  defaultChecked={blogSettings?.enabled ?? false}
                  name="enabled"
                  type="checkbox"
                />
                <span>
                  <span className="block text-sm font-black uppercase tracking-[0.12em] text-ink">
                    Enable blog widget
                  </span>
                  <span className="mt-1 block text-sm leading-6 text-steel">
                    Allows the hidden preview page, future Insights page, and provider webhook
                    workflow to operate.
                  </span>
                </span>
              </label>

              <label className="grid gap-2">
                <span className="text-xs font-black uppercase tracking-[0.12em] text-steel">
                  Default incoming status
                </span>
                <select className={inputClass} defaultValue={blogSettings?.default_status ?? "draft"} name="default_status">
                  <option value="draft">Draft for review</option>
                  <option value="published">Publish immediately</option>
                </select>
              </label>

              <label className="grid gap-2">
                <span className="text-xs font-black uppercase tracking-[0.12em] text-steel">
                  Posts per page
                </span>
                <input
                  className={inputClass}
                  defaultValue={blogSettings?.posts_per_page ?? 9}
                  max={24}
                  min={3}
                  name="posts_per_page"
                  type="number"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-xs font-black uppercase tracking-[0.12em] text-steel">
                  Webhook secret
                </span>
                <input
                  className={inputClass}
                  name="webhook_secret"
                  placeholder={blogSettings?.webhook_secret_hash ? "Secret saved. Enter a new one to replace." : "Create a shared secret"}
                  type="password"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-xs font-black uppercase tracking-[0.12em] text-steel">
                  Provider outbound API URL
                </span>
                <input
                  className={inputClass}
                  defaultValue={blogSettings?.outbound_api_base_url ?? ""}
                  name="outbound_api_base_url"
                  placeholder="Optional URL if Sora asks Grandvista to call their API"
                  type="url"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-xs font-black uppercase tracking-[0.12em] text-steel">
                  Provider outbound API key
                </span>
                <input
                  className={inputClass}
                  name="outbound_api_key"
                  placeholder={
                    blogSettings?.outbound_api_key_last4
                      ? `Key fingerprint saved. Last 4: ${blogSettings.outbound_api_key_last4}`
                      : "Optional. Store only when Sora requires server-to-server calls."
                  }
                  type="password"
                />
                <span className="text-xs leading-5 text-steel">
                  For now this is stored as a hash/fingerprint, not a raw reusable secret.
                </span>
              </label>

              <label className="grid gap-2">
                <span className="text-xs font-black uppercase tracking-[0.12em] text-steel">
                  Install notes
                </span>
                <textarea
                  className={`${inputClass} min-h-28`}
                  defaultValue={blogSettings?.provider_install_notes ?? ""}
                  name="provider_install_notes"
                  placeholder="Account owner, install steps, Sora dashboard notes, or questions to confirm."
                />
              </label>

              <label className="grid gap-2">
                <span className="text-xs font-black uppercase tracking-[0.12em] text-steel">
                  Payload mapping notes
                </span>
                <textarea
                  className={`${inputClass} min-h-24`}
                  defaultValue={blogSettings?.webhook_payload_notes ?? ""}
                  name="webhook_payload_notes"
                  placeholder="Provider-specific payload notes, fields they plan to send, or mapping changes we may need."
                />
              </label>

              <button className="bg-navy px-5 py-4 text-sm font-black uppercase tracking-[0.08em] text-white hover:bg-brand-red">
                Save Blog Widget
              </button>
            </form>

            <div className="mt-6 border border-ink/10 bg-warm-white p-5">
              <div className="flex items-center gap-2">
                <Eye className="text-brand-red" size={18} />
                <p className="text-xs font-black uppercase tracking-[0.12em] text-steel">
                  Hidden preview page
                </p>
              </div>
              <p className="mt-3 break-all font-mono text-sm text-ink">{previewUrl}</p>
              <Link
                className="mt-4 inline-flex items-center gap-2 border border-ink/12 px-4 py-3 text-xs font-black uppercase tracking-[0.08em] hover:border-brand-red hover:text-brand-red"
                href="/blog-widgets"
              >
                Open Preview <Eye size={14} />
              </Link>
            </div>

            <div className="mt-4 border border-ink/10 bg-warm-white p-5">
              <div className="flex items-center gap-2">
                <KeyRound className="text-brand-red" size={18} />
                <p className="text-xs font-black uppercase tracking-[0.12em] text-steel">Webhook URL</p>
              </div>
              <p className="mt-3 break-all font-mono text-sm text-ink">{webhookUrl}</p>
              <p className="mt-3 text-sm leading-6 text-steel">
                Ask the provider to send the shared secret as a Bearer token,{" "}
                <code className="bg-white px-1">x-grandvista-blog-secret</code>, or{" "}
                <code className="bg-white px-1">x-sora-secret</code>. The legacy endpoint{" "}
                <code className="bg-white px-1 break-all">{legacyWebhookUrl}</code> also works.
              </p>
            </div>

            <div className="mt-4 border border-ink/10 bg-warm-white p-5">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-steel">
                Accepted article fields
              </p>
              <p className="mt-3 text-sm leading-6 text-steel">
                Minimum: <code className="bg-white px-1">title</code>. Optional:{" "}
                <code className="bg-white px-1">slug</code>,{" "}
                <code className="bg-white px-1">excerpt</code>,{" "}
                <code className="bg-white px-1">body</code>,{" "}
                <code className="bg-white px-1">hero_image_url</code>,{" "}
                <code className="bg-white px-1">tags</code>,{" "}
                <code className="bg-white px-1">seo_title</code>, and{" "}
                <code className="bg-white px-1">seo_description</code>.
              </p>
              <p className="mt-3 text-sm leading-6 text-steel">
                Incoming posts are stored in the database, then edited and published from this
                control hub. The website stays a delivery surface, not a media storage room.
              </p>
            </div>
          </section>

          <section className="border border-ink/12 bg-white p-6">
            <div className="flex items-center gap-3">
              <BookOpen className="text-brand-red" size={22} />
              <p className="text-sm font-black uppercase tracking-[0.12em] text-brand-red">
                Draft review
              </p>
            </div>
            <h2 className="mt-3 text-3xl font-black leading-tight">Review incoming articles</h2>
            <p className="mt-4 leading-7 text-steel">
              Keep edits light: title, excerpt, SEO, tags, image URL, status. The goal is to let
              Soro feed drafts while Grandvista controls what becomes public.
            </p>

            <div className="mt-6 grid gap-5">
              {blogPosts.length === 0 ? (
                <div className="border border-ink/10 bg-warm-white p-5">
                  <p className="font-bold text-steel">No blog posts yet. Incoming webhook posts will appear here.</p>
                </div>
              ) : null}

              {blogPosts.map((post) => (
                <article className="border border-ink/12 bg-white p-5" key={post.id}>
                  <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.12em] text-brand-red">
                        {post.source} / {post.status}
                      </p>
                      <h3 className="mt-2 text-2xl font-black leading-tight">{post.title}</h3>
                      <p className="mt-2 text-sm text-steel">/{post.slug}</p>
                    </div>
                    {post.status === "published" ? (
                      <Link
                        className="inline-flex items-center gap-2 border border-ink/12 px-4 py-2 text-xs font-black uppercase tracking-[0.08em] hover:border-brand-red hover:text-brand-red"
                        href={`/insights/${post.slug}`}
                      >
                        <Eye size={14} />
                        View
                      </Link>
                    ) : null}
                  </div>

                  <form action={updateBlogPost} className="mt-5 grid gap-4">
                    <input name="post_id" type="hidden" value={post.id} />
                    <input className={inputClass} name="title" defaultValue={post.title} />
                    <textarea
                      className={`${inputClass} min-h-24`}
                      name="excerpt"
                      defaultValue={post.excerpt ?? ""}
                      placeholder="Short excerpt"
                    />
                    <textarea
                      className={`${inputClass} min-h-40`}
                      name="body"
                      defaultValue={post.body ?? ""}
                      placeholder="Article body"
                    />
                    <div className="grid gap-4 md:grid-cols-2">
                      <input
                        className={inputClass}
                        name="hero_image_url"
                        defaultValue={post.hero_image_url ?? ""}
                        placeholder="Hero image URL"
                      />
                      <input
                        className={inputClass}
                        name="hero_image_alt"
                        defaultValue={post.hero_image_alt ?? ""}
                        placeholder="Hero image alt"
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <input
                        className={inputClass}
                        name="seo_title"
                        defaultValue={post.seo_title ?? ""}
                        placeholder="SEO title"
                      />
                      <input
                        className={inputClass}
                        name="seo_description"
                        defaultValue={post.seo_description ?? ""}
                        placeholder="SEO description"
                      />
                    </div>
                    <input
                      className={inputClass}
                      name="tags"
                      defaultValue={(post.tags ?? []).join(", ")}
                      placeholder="Tags separated by commas"
                    />
                    <div className="grid gap-3 md:grid-cols-[1fr_auto_auto] md:items-center">
                      <select className={inputClass} name="status" defaultValue={post.status}>
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="hidden">Hidden</option>
                      </select>
                      <label className="flex min-h-12 items-center gap-2 border border-ink/12 px-4 text-sm font-bold">
                        <input defaultChecked={post.featured} name="featured" type="checkbox" />
                        Featured
                      </label>
                      <button className="min-h-12 bg-navy px-5 text-sm font-black uppercase tracking-[0.08em] text-white hover:bg-brand-red">
                        Save Post
                      </button>
                    </div>
                  </form>

                  <form action={deleteBlogPost} className="mt-3">
                    <input name="post_id" type="hidden" value={post.id} />
                    <button className="inline-flex items-center gap-2 border border-ink/12 px-4 py-2 text-xs font-black uppercase tracking-[0.08em] hover:border-brand-red hover:text-brand-red">
                      <Trash2 size={14} />
                      Delete Post
                    </button>
                  </form>
                </article>
              ))}
            </div>
          </section>
        </div>

        <section className="mt-8 border border-ink/12 bg-white p-6">
          <p className="text-sm font-black uppercase tracking-[0.12em] text-brand-red">Recent webhook events</p>
          <div className="mt-5 grid gap-3">
            {webhookEvents.length === 0 ? (
              <p className="text-sm font-bold text-steel">No webhook events received yet.</p>
            ) : null}
            {webhookEvents.map((event) => (
              <div className="grid gap-1 border border-ink/10 bg-warm-white p-4 md:grid-cols-[0.7fr_1fr_1.4fr]" key={event.id}>
                <p className="text-xs font-black uppercase tracking-[0.12em] text-steel">{event.status}</p>
                <p className="text-sm font-bold text-ink">{event.external_id ?? event.provider}</p>
                <p className="text-sm text-steel">{event.message ?? new Date(event.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
