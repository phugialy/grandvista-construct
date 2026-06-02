import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { AdminNav } from "@/components/admin/admin-nav";
import { updateSiteSection } from "./actions";

type SiteSection = {
  id: string;
  section_key: string;
  page_slug: string;
  placement: string;
  label: string;
  description: string;
  headline: string | null;
  body: string | null;
  media_asset_id: string | null;
};

type MediaAsset = {
  id: string;
  public_url: string;
  media_type: "image" | "video";
  alt_text: string | null;
  tags: string[];
};

const pagePreviewLinks: Record<string, string> = {
  company: "/company",
  "how-we-work": "/how-we-work",
  home: "/",
  "our-direction": "/our-direction",
  "project-stories": "/project-stories",
  "what-we-build": "/what-we-build",
};

const placementGuidance: Record<string, string> = {
  "home.hero": "Recommended: wide image or short clip, 16:9 or wider.",
  "home.proof": "Recommended: field detail or finished-space proof, 4:3 or 16:9.",
  "project-stories.hero": "Recommended: strong construction/project image, 16:9.",
  "project-stories.empty": "Recommended: branded proof image until real case studies are published.",
};

const inputClass =
  "min-h-12 border border-ink/14 bg-white p-4 text-base text-ink outline-none transition placeholder:text-steel/70 focus:border-navy";

export const dynamic = "force-dynamic";

export default async function AdminWebsitePage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string }>;
}) {
  await requireAdmin();
  const { status } = searchParams ? await searchParams : {};

  const supabase = getSupabaseServiceClient();
  const [{ data: sections }, { data: mediaAssets }] = await Promise.all([
    supabase
      .from("site_sections")
      .select("id,section_key,page_slug,placement,label,description,headline,body,media_asset_id")
      .order("sort_order", { ascending: true }),
    supabase
      .from("media_assets")
      .select("id,public_url,media_type,alt_text,tags")
      .eq("status", "ready")
      .order("created_at", { ascending: false })
      .limit(36),
  ]);

  return (
    <main className="min-h-screen bg-warm-white text-ink">
      <AdminNav
        title="Website sections"
        description="Choose which media and safe copy appears in key homepage and page-level placements."
      />

      <section className="section-shell py-10">
        {status === "saved" ? (
          <p className="mb-6 border border-navy/20 bg-white p-4 text-sm font-bold text-navy">
            Website section saved.
          </p>
        ) : null}

        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="eyebrow">Placement manager</p>
            <h2 className="mt-3 max-w-3xl text-4xl font-black leading-tight">
              Upload once, then choose where the proof appears.
            </h2>
          </div>
          <Link
            className="bg-navy px-5 py-3 text-sm font-black uppercase tracking-[0.08em] text-white hover:bg-brand-red"
            href="/admin/media"
          >
            Upload More Media
          </Link>
        </div>

        <div className="grid gap-6">
          {((sections ?? []) as SiteSection[]).map((section) => (
            <SectionForm key={section.id} mediaAssets={(mediaAssets ?? []) as MediaAsset[]} section={section} />
          ))}
        </div>
      </section>
    </main>
  );
}

function SectionForm({ mediaAssets, section }: { mediaAssets: MediaAsset[]; section: SiteSection }) {
  const selectedMedia = mediaAssets.find((asset) => asset.id === section.media_asset_id);

  return (
    <form action={updateSiteSection} className="grid gap-5 border border-ink/12 bg-white p-6 lg:grid-cols-[1fr_420px]">
      <input name="section_id" type="hidden" value={section.id} />

      <div>
        <p className="text-xs font-black uppercase tracking-[0.14em] text-brand-red">
          {section.page_slug} / {section.placement}
        </p>
        <h3 className="mt-2 text-2xl font-black">{section.label}</h3>
        <p className="mt-3 max-w-2xl leading-7 text-steel">{section.description}</p>
        <p className="mt-3 text-sm font-black uppercase tracking-[0.1em] text-navy">
          {placementGuidance[section.section_key] ?? "Recommended: clear commercial construction media."}
        </p>

        <div className="mt-6 grid gap-4">
          <label className="grid gap-2 font-bold">
            Headline
            <input className={inputClass} defaultValue={section.headline ?? ""} name="headline" />
          </label>
          <label className="grid gap-2 font-bold">
            Supporting copy
            <textarea className={`${inputClass} min-h-28 resize-y`} defaultValue={section.body ?? ""} name="body" />
          </label>
        </div>
      </div>

      <aside className="grid gap-4">
        <div className="border border-ink/10 bg-warm-white p-4">
          <p className="text-sm font-black uppercase tracking-[0.12em] text-steel">Current media</p>
          <div className="mt-3 aspect-[4/3] overflow-hidden bg-ink">
            {selectedMedia ? <MediaPreview asset={selectedMedia} /> : <div className="grid h-full place-items-center text-sm font-bold text-white/60">Fallback design</div>}
          </div>
        </div>

        <div className="max-h-80 overflow-auto border border-ink/10 p-3">
          <label className="mb-3 flex items-center gap-3 text-sm font-black">
            <input defaultChecked={!section.media_asset_id} name="media_asset_id" type="radio" value="" />
            Use fallback design
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            {mediaAssets.map((asset) => (
              <label key={asset.id} className="cursor-pointer border border-ink/12 p-2 hover:border-brand-red">
                <div className="aspect-[4/3] overflow-hidden bg-ink">
                  <MediaPreview asset={asset} />
                </div>
                <span className="mt-2 flex items-center gap-2 text-xs font-bold text-steel">
                  <input defaultChecked={section.media_asset_id === asset.id} name="media_asset_id" type="radio" value={asset.id} />
                  {asset.media_type}
                </span>
              </label>
            ))}
          </div>
        </div>

        <button
          className="bg-navy px-5 py-3 text-sm font-black uppercase tracking-[0.08em] text-white hover:bg-brand-red"
          type="submit"
        >
          Save Placement
        </button>
        <Link
          className="border border-ink/14 px-5 py-3 text-center text-sm font-black uppercase tracking-[0.08em] text-ink hover:border-brand-red hover:text-brand-red"
          href={pagePreviewLinks[section.page_slug] ?? "/"}
          target="_blank"
        >
          Preview Page
        </Link>
      </aside>
    </form>
  );
}

function MediaPreview({ asset }: { asset: MediaAsset }) {
  if (asset.media_type === "video") {
    return <video className="h-full w-full object-cover" muted playsInline src={asset.public_url} />;
  }

  // eslint-disable-next-line @next/next/no-img-element
  return <img alt={asset.alt_text ?? "Website media"} className="h-full w-full object-cover" src={asset.public_url} />;
}
