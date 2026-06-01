import { Archive } from "lucide-react";
import { requireAdmin } from "@/lib/admin-auth";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { AdminNav } from "@/components/admin/admin-nav";
import { MediaUploader } from "@/components/admin/media-uploader";
import { archiveMediaAsset } from "./actions";

type MediaAsset = {
  id: string;
  public_url: string;
  media_type: "image" | "video";
  mime_type: string;
  file_size: number;
  alt_text: string | null;
  tags: string[];
  created_at: string;
};

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  await requireAdmin();

  const supabase = getSupabaseServiceClient();
  const { data } = await supabase
    .from("media_assets")
    .select("id,public_url,media_type,mime_type,file_size,alt_text,tags,created_at")
    .eq("status", "ready")
    .order("created_at", { ascending: false })
    .limit(60);
  const assets = (data ?? []) as MediaAsset[];

  return (
    <main className="min-h-screen bg-warm-white text-ink">
      <AdminNav
        title="Media library"
        description="Upload jobsite proof, keep files web-ready, and choose assets for project stories."
      />
      <section className="section-shell grid gap-8 py-10 lg:grid-cols-[420px_minmax(0,1fr)]">
        <MediaUploader />

        <div>
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.12em] text-brand-red">Ready media</p>
              <h2 className="mt-2 text-3xl font-black">{assets.length} assets available</h2>
            </div>
            <p className="max-w-md text-sm font-bold leading-6 text-steel">
              Removing an asset here archives it from the library. Project pages should remove media from the story first.
            </p>
          </div>

          {assets.length === 0 ? (
            <article className="mt-6 border border-ink/12 bg-white p-8">
              <h3 className="text-2xl font-black">No media uploaded yet</h3>
              <p className="mt-3 text-steel">Upload selected jobsite images or short clips to start building project proof.</p>
            </article>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {assets.map((asset) => (
                <article key={asset.id} className="border border-ink/12 bg-white p-3">
                  <div className="aspect-[4/3] overflow-hidden bg-ink">
                    {asset.media_type === "image" ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img alt={asset.alt_text ?? "Uploaded media"} className="h-full w-full object-cover" src={asset.public_url} />
                    ) : (
                      <video className="h-full w-full object-cover" controls muted src={asset.public_url} />
                    )}
                  </div>
                  <div className="mt-4 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.12em] text-brand-red">
                        {asset.media_type} / {formatBytes(asset.file_size)}
                      </p>
                      <p className="mt-2 text-sm font-bold text-steel">
                        {asset.tags.length > 0 ? asset.tags.join(", ") : "No tags yet"}
                      </p>
                    </div>
                    <form action={archiveMediaAsset}>
                      <input name="asset_id" type="hidden" value={asset.id} />
                      <button
                        aria-label="Archive media asset"
                        className="border border-ink/12 p-3 text-steel hover:border-brand-red hover:text-brand-red"
                        type="submit"
                      >
                        <Archive size={16} />
                      </button>
                    </form>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)}KB`;
  }

  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}
