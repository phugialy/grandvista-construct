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
  content_source: "manual" | "featured_project" | "fallback";
  featured_project_id: string | null;
  site_section_media?: {
    media_asset_id: string;
    sort_order: number;
  }[];
  site_section_projects?: {
    project_id: string;
    sort_order: number;
  }[];
};

type MediaAsset = {
  id: string;
  public_url: string;
  media_type: "image" | "video";
  alt_text: string | null;
  tags: string[];
};

type ProjectOption = {
  id: string;
  title: string;
  project_type: string | null;
  location: string | null;
};

type PageTab = {
  description: string;
  label: string;
  slug: string;
};

const pageTabs: PageTab[] = [
  {
    description: "Landing page hero, proof, and first impression placements.",
    label: "Home",
    slug: "home",
  },
  {
    description: "Image-led construction categories and capability positioning.",
    label: "What We Build",
    slug: "what-we-build",
  },
  {
    description: "Header copy plus stage-by-stage workflow media.",
    label: "How We Work",
    slug: "how-we-work",
  },
  {
    description: "Case-study header, empty states, and proof storytelling.",
    label: "Project Stories",
    slug: "project-stories",
  },
  {
    description: "Typography-led vision copy with a horizontal image rail below the hero.",
    label: "Our Direction",
    slug: "our-direction",
  },
  {
    description: "Company credibility, brand identity, and trust signals.",
    label: "Company",
    slug: "company",
  },
];

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
  "what-we-build.hero": "Recommended: large image set. This page is image-led, so strong jobsite and finished-space media matter most.",
  "how-we-work.hero": "Recommended: headline and supporting copy for the page header. Use one steady process or field coordination visual.",
  "how-we-work.discovery": "Recommended: discovery, walkthrough, site condition, or first conversation proof. One image is enough.",
  "how-we-work.scope": "Recommended: drawings, rough-in, field condition, or scope detail proof. One image is enough.",
  "how-we-work.budget": "Recommended: planning, estimate, material, or practical decision proof. One image is enough.",
  "how-we-work.schedule": "Recommended: active jobsite sequencing, deliveries, or progress proof. One image is enough.",
  "how-we-work.permit": "Recommended: inspection, code, documentation, or readiness proof. One image is enough.",
  "how-we-work.trade": "Recommended: trades coordinating, MEP, framing, or multi-trade activity. One image is enough.",
  "how-we-work.field": "Recommended: field execution, supervision, punch, or site progress proof. One image is enough.",
  "how-we-work.communication": "Recommended: owner update, meeting, walkthrough, or decision-point proof. One image is enough.",
  "how-we-work.turnover": "Recommended: closeout, finished space, clean handoff, or ready-to-operate proof. One image is enough.",
  "project-stories.hero": "Recommended: strong construction/project image, 16:9.",
  "project-stories.empty": "Recommended: branded proof image until real case studies are published.",
  "our-direction.hero": "Recommended: images for the vision rail under the hero, not a header overlay. Use current work, future-leaning proof, and real field ambition.",
};

const inputClass =
  "min-h-12 border border-ink/14 bg-white p-4 text-base text-ink outline-none transition placeholder:text-steel/70 focus:border-navy";

export const dynamic = "force-dynamic";

export default async function AdminWebsitePage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string; status?: string }>;
}) {
  await requireAdmin();
  const { page, status } = searchParams ? await searchParams : {};

  const supabase = getSupabaseServiceClient();
  const [{ data: sections }, { data: mediaAssets }, { data: projects }] = await Promise.all([
    supabase
      .from("site_sections")
      .select("id,section_key,page_slug,placement,label,description,headline,body,media_asset_id,content_source,featured_project_id,site_section_media(media_asset_id,sort_order),site_section_projects(project_id,sort_order)")
      .order("sort_order", { ascending: true }),
    supabase
      .from("media_assets")
      .select("id,public_url,media_type,alt_text,tags")
      .eq("status", "ready")
      .order("created_at", { ascending: false })
      .limit(36),
    supabase
      .from("projects")
      .select("id,title,project_type,location")
      .eq("published", true)
      .order("updated_at", { ascending: false }),
  ]);

  const typedSections = (sections ?? []) as SiteSection[];
  const typedMediaAssets = (mediaAssets ?? []) as MediaAsset[];
  const typedProjects = (projects ?? []) as ProjectOption[];
  const sectionCountByPage = getSectionCountByPage(typedSections);
  const selectedPage = getSelectedPageSlug(page, typedSections);
  const activePage = pageTabs.find((tab) => tab.slug === selectedPage) ?? {
    description: "Website page placements.",
    label: toPageLabel(selectedPage),
    slug: selectedPage,
  };
  const pageSections = typedSections.filter((section) => section.page_slug === selectedPage);

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

        <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start">
          <aside className="sticky top-4 border border-ink/12 bg-white p-4">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-brand-red">
              Page navigation
            </p>
            <div className="mt-4 grid gap-2">
              {getPageTabs(typedSections).map((tab) => {
                const count = sectionCountByPage.get(tab.slug) ?? 0;
                const active = tab.slug === selectedPage;

                return (
                  <Link
                    className={`block border p-4 transition ${
                      active
                        ? "border-navy bg-navy text-white"
                        : "border-ink/12 text-ink hover:border-brand-red hover:text-brand-red"
                    }`}
                    href={`/admin/website?page=${tab.slug}`}
                    key={tab.slug}
                  >
                    <span className="block text-sm font-black">{tab.label}</span>
                    <span className={`mt-2 block text-xs font-bold ${active ? "text-white/68" : "text-steel"}`}>
                      {count} placement{count === 1 ? "" : "s"}
                    </span>
                  </Link>
                );
              })}
            </div>
          </aside>

          <div>
            <div className="mb-5 border border-ink/12 bg-white p-6">
              <p className="eyebrow">Current page</p>
              <h3 className="mt-3 text-3xl font-black">{activePage.label}</h3>
              <p className="mt-3 max-w-2xl leading-7 text-steel">{activePage.description}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <MetricPill label="Placements" value={String(pageSections.length)} />
                <MetricPill label="Images" value={String(typedMediaAssets.filter((asset) => asset.media_type === "image").length)} />
                <MetricPill label="Videos" value={String(typedMediaAssets.filter((asset) => asset.media_type === "video").length)} />
              </div>
            </div>

            <div className="grid gap-6">
              {pageSections.map((section) => (
                <SectionForm
                  key={section.id}
                  mediaAssets={typedMediaAssets}
                  projects={typedProjects}
                  section={section}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function SectionForm({
  mediaAssets,
  projects,
  section,
}: {
  mediaAssets: MediaAsset[];
  projects: ProjectOption[];
  section: SiteSection;
}) {
  const selectedMediaIds = getSelectedMediaIds(section);
  const selectedMediaAssets = selectedMediaIds
    .map((assetId) => mediaAssets.find((asset) => asset.id === assetId))
    .filter((asset): asset is MediaAsset => Boolean(asset));
  const selectedProjectIds = getSelectedProjectIds(section);
  const selectedProjects = selectedProjectIds
    .map((projectId) => projects.find((project) => project.id === projectId))
    .filter((project): project is ProjectOption => Boolean(project));
  const supportsFeaturedProject = section.section_key === "project-stories.hero";
  const source = section.content_source ?? "manual";
  const sectionMeta = getSectionAdminMeta(section);

  return (
    <form action={updateSiteSection} className="grid gap-5 border border-ink/12 bg-white p-6 lg:grid-cols-[1fr_420px]">
      <input name="section_id" type="hidden" value={section.id} />
      <input name="page_slug" type="hidden" value={section.page_slug} />

      <div>
        <p className="text-xs font-black uppercase tracking-[0.14em] text-brand-red">
          {section.page_slug} / {section.placement}
        </p>
        <h3 className="mt-2 text-2xl font-black">{section.label}</h3>
        <p className="mt-3 max-w-2xl leading-7 text-steel">{section.description}</p>
        <p className="mt-3 text-sm font-black uppercase tracking-[0.1em] text-navy">
          {placementGuidance[section.section_key] ?? "Recommended: clear commercial construction media."}
        </p>
        <p className="mt-3 border-l-4 border-brand-red bg-warm-white p-4 text-sm font-bold leading-6 text-steel">
          {sectionMeta.operatorNote}
        </p>

        <fieldset className="mt-6 grid gap-3 border border-ink/10 bg-warm-white p-4">
          <legend className="px-2 text-sm font-black uppercase tracking-[0.12em] text-brand-red">
            Content source
          </legend>
          <label className="flex items-center gap-3 text-sm font-black">
            <input defaultChecked={source === "manual"} name="content_source" type="radio" value="manual" />
            {sectionMeta.manualSourceLabel}
          </label>
          {supportsFeaturedProject ? (
            <label className="flex items-center gap-3 text-sm font-black">
              <input defaultChecked={source === "featured_project"} name="content_source" type="radio" value="featured_project" />
              Featured project stories
            </label>
          ) : null}
          <label className="flex items-center gap-3 text-sm font-black">
            <input defaultChecked={source === "fallback"} name="content_source" type="radio" value="fallback" />
            Fallback design
          </label>
        </fieldset>

        {supportsFeaturedProject ? (
          <fieldset className="mt-5 grid gap-3 border border-ink/10 p-4">
            <legend className="px-2 font-bold">Featured project stories</legend>
            <p className="text-sm font-bold leading-6 text-steel">
              Select up to five published stories. They appear in this order in the Project Stories header.
            </p>
            <div className="grid gap-2">
              {projects.map((project, index) => {
                const selectedIndex = selectedProjectIds.indexOf(project.id);
                return (
                  <label key={project.id} className="flex items-start gap-3 border border-ink/10 bg-warm-white p-3 text-sm font-bold">
                    <input
                      defaultChecked={selectedIndex >= 0}
                      name="featured_project_ids"
                      type="checkbox"
                      value={project.id}
                    />
                    <span>
                      <span className="block text-ink">
                        {selectedIndex >= 0 ? `${selectedIndex + 1}. ` : ""}
                        {project.title}
                      </span>
                      <span className="mt-1 block text-xs uppercase tracking-[0.08em] text-steel">
                        {[project.project_type, project.location].filter(Boolean).join(" / ") || `Option ${index + 1}`}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        ) : null}

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
          <div className="relative mt-3 aspect-[4/3] overflow-hidden bg-ink">
            {source === "featured_project" && selectedProjects.length > 0 ? (
              <div className="grid h-full place-items-center p-6 text-center text-white">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-brand-red">
                  {selectedProjects.length} featured stories
                </p>
                <p className="mt-3 text-2xl font-black">{selectedProjects[0].title}</p>
                {selectedProjects.length > 1 ? (
                  <p className="mt-2 text-sm font-bold text-white/68">Carousel header active</p>
                ) : null}
              </div>
            ) : selectedMediaAssets.length > 0 && source === "manual" ? (
              <>
                <MediaPreview asset={selectedMediaAssets[0]} />
                {selectedMediaAssets.length > 1 ? (
                  <div className="absolute inset-x-4 bottom-4 bg-ink/84 p-3 text-white">
                    <p className="text-xs font-black uppercase tracking-[0.12em] text-brand-red">
                      {selectedMediaAssets.length} media selected
                    </p>
                    <p className="mt-1 text-sm font-bold text-white/70">Carousel-ready placement</p>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="grid h-full place-items-center text-sm font-bold text-white/60">Fallback design</div>
            )}
          </div>
        </div>

        <div className="max-h-[30rem] overflow-auto border border-ink/10 p-3">
          <p className="mb-2 text-sm font-black uppercase tracking-[0.12em] text-steel">
            Selected media assets
          </p>
          <p className="mb-3 text-sm font-bold leading-6 text-steel">
            {sectionMeta.mediaSelectionNote}
          </p>
          <MediaAssetGroups mediaAssets={mediaAssets} selectedMediaIds={selectedMediaIds} />
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

function MediaAssetGroups({
  mediaAssets,
  selectedMediaIds,
}: {
  mediaAssets: MediaAsset[];
  selectedMediaIds: string[];
}) {
  const selectedAssets = selectedMediaIds
    .map((assetId) => mediaAssets.find((asset) => asset.id === assetId))
    .filter((asset): asset is MediaAsset => Boolean(asset));
  const selectedAssetIdSet = new Set(selectedMediaIds);
  const images = mediaAssets.filter((asset) => asset.media_type === "image" && !selectedAssetIdSet.has(asset.id));
  const videos = mediaAssets.filter((asset) => asset.media_type === "video" && !selectedAssetIdSet.has(asset.id));

  return (
    <div className="grid gap-5">
      {selectedAssets.length > 0 ? (
        <MediaAssetGroup
          assets={selectedAssets}
          selectedMediaIds={selectedMediaIds}
          title="Selected for this placement"
        />
      ) : null}
      <MediaAssetGroup assets={images} selectedMediaIds={selectedMediaIds} title="Images" />
      <MediaAssetGroup assets={videos} selectedMediaIds={selectedMediaIds} title="Short clips" />
    </div>
  );
}

function MediaAssetGroup({
  assets,
  selectedMediaIds,
  title,
}: {
  assets: MediaAsset[];
  selectedMediaIds: string[];
  title: string;
}) {
  if (assets.length === 0) {
    return null;
  }

  return (
    <section>
      <div className="mb-2 flex items-center justify-between gap-3">
        <h4 className="text-xs font-black uppercase tracking-[0.14em] text-brand-red">{title}</h4>
        <span className="text-xs font-bold text-steel">
          {assets.length} asset{assets.length === 1 ? "" : "s"}
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {assets.map((asset) => (
          <label key={asset.id} className="cursor-pointer border border-ink/12 p-2 hover:border-brand-red">
            <div className="aspect-[4/3] overflow-hidden bg-ink">
              <MediaPreview asset={asset} />
            </div>
            <span className="mt-2 flex items-center gap-2 text-xs font-bold text-steel">
              <input
                defaultChecked={selectedMediaIds.includes(asset.id)}
                name="media_asset_ids"
                type="checkbox"
                value={asset.id}
              />
              {asset.media_type}
              {asset.tags.length > 0 ? <span className="truncate text-steel/70">/ {asset.tags.slice(0, 2).join(", ")}</span> : null}
            </span>
          </label>
        ))}
      </div>
    </section>
  );
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-ink/10 bg-warm-white px-4 py-3">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-steel">{label}</p>
      <p className="mt-1 text-2xl font-black text-navy">{value}</p>
    </div>
  );
}

function getSectionAdminMeta(section: SiteSection) {
  if (section.section_key.startsWith("how-we-work.") && section.section_key !== "how-we-work.hero") {
    return {
      manualSourceLabel: "Stage media and copy",
      mediaSelectionNote: "Choose one primary image or short clip for this workflow stage. If several are checked, the first selected asset is used on the public process tree.",
      operatorNote: "This controls one step in the How We Work process tree. Visitors see this media and copy when they hover or tap the matching workflow stage.",
    };
  }

  if (section.section_key === "how-we-work.hero") {
    return {
      manualSourceLabel: "Header copy and optional media",
      mediaSelectionNote: "Choose one steady image or short clip for the How We Work header. Workflow-stage images are managed in the stage placements below.",
      operatorNote: "This controls only the top page header. The process tree has separate placements so each stage can carry its own proof.",
    };
  }

  if (section.section_key === "our-direction.hero") {
    return {
      manualSourceLabel: "Vision copy and image rail media",
      mediaSelectionNote: "Choose up to eight images for the vision rail under the typography hero. These should feel like proof of where Grandvista is going.",
      operatorNote: "This page no longer uses a normal image header. Headline and copy update the large vision hero; selected media appears below as the horizontal vision rail.",
    };
  }

  if (section.section_key === "what-we-build.hero") {
    return {
      manualSourceLabel: "Image showcase and page copy",
      mediaSelectionNote: "Choose up to eight images. This page is image-led, so the selected set becomes the main showcase visitors browse.",
      operatorNote: "This page should make the work feel tangible. Strong images matter more here than extra text.",
    };
  }

  if (section.section_key === "project-stories.hero") {
    return {
      manualSourceLabel: "Manual media and copy",
      mediaSelectionNote: "Choose up to eight manual media assets, or switch to featured project stories to rotate full story cards.",
      operatorNote: "This page is story-led. Use featured projects when the strongest proof is the full case study, not just a single image.",
    };
  }

  return {
    manualSourceLabel: "Manual media and copy",
    mediaSelectionNote: "Choose up to eight. They appear in the order shown here where the public page supports multiple media assets.",
    operatorNote: "This placement controls a visible section on the public website. Use concise copy and clear commercial construction media.",
  };
}

function getSelectedProjectIds(section: SiteSection) {
  const projectIds = (section.site_section_projects ?? [])
    .sort((left, right) => left.sort_order - right.sort_order)
    .map((row) => row.project_id);

  if (projectIds.length > 0) {
    return projectIds;
  }

  return section.featured_project_id ? [section.featured_project_id] : [];
}

function getPageTabs(sections: SiteSection[]) {
  const knownSlugs = new Set(sections.map((section) => section.page_slug));
  const configuredTabs = pageTabs.filter((tab) => knownSlugs.has(tab.slug));
  const extraTabs = Array.from(knownSlugs)
    .filter((slug) => !pageTabs.some((tab) => tab.slug === slug))
    .map((slug) => ({
      description: "Website page placements.",
      label: toPageLabel(slug),
      slug,
    }));

  return [...configuredTabs, ...extraTabs];
}

function getSelectedPageSlug(page: string | undefined, sections: SiteSection[]) {
  const availableSlugs = new Set(sections.map((section) => section.page_slug));

  if (page && availableSlugs.has(page)) {
    return page;
  }

  return getPageTabs(sections)[0]?.slug ?? "home";
}

function getSectionCountByPage(sections: SiteSection[]) {
  const counts = new Map<string, number>();

  for (const section of sections) {
    counts.set(section.page_slug, (counts.get(section.page_slug) ?? 0) + 1);
  }

  return counts;
}

function toPageLabel(slug: string) {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getSelectedMediaIds(section: SiteSection) {
  const mediaIds = (section.site_section_media ?? [])
    .sort((left, right) => left.sort_order - right.sort_order)
    .map((row) => row.media_asset_id);

  if (mediaIds.length > 0) {
    return mediaIds;
  }

  return section.media_asset_id ? [section.media_asset_id] : [];
}

function MediaPreview({ asset }: { asset: MediaAsset }) {
  if (asset.media_type === "video") {
    return <video className="h-full w-full object-cover" muted playsInline src={asset.public_url} />;
  }

  // eslint-disable-next-line @next/next/no-img-element
  return <img alt={asset.alt_text ?? "Website media"} className="h-full w-full object-cover" src={asset.public_url} />;
}
