"use client";

import { Archive, Check, ImageIcon, Layers, Tags, Trash2, X } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  archiveSelectedMedia,
  assignMediaToProject,
  assignMediaToSiteSection,
  createDraftProjectFromMedia,
  deleteSelectedMedia,
  tagSelectedMedia,
} from "@/app/admin/media/actions";
import { projectTags, projectTypes } from "@/lib/admin-projects";

type MediaAsset = {
  id: string;
  public_url: string;
  media_type: "image" | "video";
  mime_type: string;
  file_size: number;
  alt_text: string | null;
  tags: string[];
  created_at: string;
  usage_labels: string[];
};

type ProjectOption = {
  id: string;
  title: string;
  project_type: string | null;
  published: boolean;
};

type SiteSectionOption = {
  id: string;
  section_key: string;
  page_slug: string;
  placement: string;
  label: string;
};

const pageOrder = [
  "home",
  "what-we-build",
  "how-we-work",
  "project-stories",
  "our-direction",
  "company",
];

const quickTags = [
  ...projectTags,
  "Restaurant",
  "Retail",
  "Office",
  "Warehouse",
  "Exterior",
  "Interior",
  "Field Coordination",
  "Inspection Readiness",
];

export function MediaAssignmentWorkspace({
  assets,
  projects,
  siteSections,
}: {
  assets: MediaAsset[];
  projects: ProjectOption[];
  siteSections: SiteSectionOption[];
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeId, setActiveId] = useState<string | null>(assets[0]?.id ?? null);
  const [tab, setTab] = useState<"page" | "story" | "tags" | "archive" | "delete">("page");
  const [filter, setFilter] = useState<"unassigned" | "all" | "images" | "videos" | "used">("unassigned");

  const selectedAssets = useMemo(
    () => selectedIds.map((id) => assets.find((asset) => asset.id === id)).filter((asset): asset is MediaAsset => Boolean(asset)),
    [assets, selectedIds],
  );
  const activeAsset = selectedAssets.find((asset) => asset.id === activeId) ?? selectedAssets[0] ?? assets.find((asset) => asset.id === activeId) ?? assets[0];
  const filterCounts = {
    all: assets.length,
    images: assets.filter((asset) => asset.media_type === "image").length,
    unassigned: assets.filter((asset) => asset.usage_labels.length === 0).length,
    used: assets.filter((asset) => asset.usage_labels.length > 0).length,
    videos: assets.filter((asset) => asset.media_type === "video").length,
  };
  const filteredAssets = assets.filter((asset) => {
    if (filter === "images") return asset.media_type === "image";
    if (filter === "videos") return asset.media_type === "video";
    if (filter === "used") return asset.usage_labels.length > 0;
    if (filter === "unassigned") return asset.usage_labels.length === 0;
    return true;
  });

  function toggleAsset(assetId: string) {
    setSelectedIds((current) => {
      if (current.includes(assetId)) {
        return current.filter((id) => id !== assetId);
      }

      return [...current, assetId];
    });
    setActiveId(assetId);
  }

  function clearSelection() {
    setSelectedIds([]);
    setActiveId(null);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_440px]">
      <section className="border border-ink/12 bg-white p-5">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.12em] text-brand-red">Admin pool</p>
            <h2 className="mt-2 text-3xl font-black">Select proof, then assign it.</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {(["unassigned", "all", "images", "videos", "used"] as const).map((option) => (
              <button
                className={`border px-3 py-2 text-xs font-black uppercase tracking-[0.08em] ${
                  filter === option ? "border-navy bg-navy text-white" : "border-ink/12 text-steel hover:border-brand-red hover:text-brand-red"
                }`}
                key={option}
                onClick={() => setFilter(option)}
                type="button"
              >
                {option} <span className="ml-1 opacity-70">{filterCounts[option]}</span>
              </button>
            ))}
          </div>
        </div>

        {selectedIds.length > 0 ? (
          <div className="mt-5 flex flex-col justify-between gap-3 border border-navy/15 bg-warm-white p-4 md:flex-row md:items-center">
            <p className="text-sm font-black text-navy">{selectedIds.length} selected</p>
            <div className="flex flex-wrap items-center gap-3">
              <QuickArchiveForm selectedIds={selectedIds} />
              <QuickDeleteForm selectedIds={selectedIds} />
              <button
                className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.08em] text-steel hover:text-brand-red"
                onClick={clearSelection}
                type="button"
              >
                <X size={16} />
                Clear
              </button>
            </div>
          </div>
        ) : null}

        {filteredAssets.length === 0 ? (
          <div className="mt-6 border border-ink/10 bg-warm-white p-8">
            <h3 className="text-2xl font-black">Nothing in this view yet.</h3>
            <p className="mt-3 text-steel">Upload media or switch filters to see the broader library.</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredAssets.map((asset) => {
              const selected = selectedIds.includes(asset.id);

              return (
                <button
                  className={`group border bg-white p-3 text-left transition ${
                    selected ? "border-navy ring-2 ring-navy/20" : "border-ink/12 hover:border-brand-red"
                  }`}
                  key={asset.id}
                  onClick={() => toggleAsset(asset.id)}
                  type="button"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-ink">
                    <MediaPreview asset={asset} />
                    <span
                      className={`absolute left-3 top-3 grid h-7 w-7 place-items-center border text-xs ${
                        selected ? "border-navy bg-navy text-white" : "border-white/70 bg-ink/50 text-white"
                      }`}
                    >
                      {selected ? <Check size={14} /> : ""}
                    </span>
                  </div>
                  <div className="mt-3">
                    <p className="text-xs font-black uppercase tracking-[0.12em] text-brand-red">
                      {asset.media_type} / {formatBytes(asset.file_size)}
                    </p>
                    <p className="mt-2 text-sm font-bold text-steel">
                      {asset.usage_labels[0] ?? (asset.tags.length > 0 ? asset.tags.join(", ") : "Unassigned")}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <aside className="sticky top-4 h-fit border border-ink/12 bg-white">
        <div className="border-b border-ink/10 p-5">
          <p className="text-sm font-black uppercase tracking-[0.12em] text-brand-red">Assignment workspace</p>
          <h2 className="mt-2 text-2xl font-black">Preview and apply.</h2>
        </div>

        <div className="p-5">
          <div className="aspect-[4/3] overflow-hidden bg-ink">
            {activeAsset ? <MediaPreview asset={activeAsset} /> : <div className="grid h-full place-items-center text-sm font-bold text-white/60">Select media</div>}
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto">
            {selectedAssets.map((asset) => (
              <button
                className={`h-16 w-20 shrink-0 overflow-hidden border ${activeAsset?.id === asset.id ? "border-navy" : "border-ink/12"}`}
                key={asset.id}
                onClick={() => setActiveId(asset.id)}
                type="button"
              >
                <MediaPreview asset={asset} />
              </button>
            ))}
          </div>

          <div className="mt-5 grid grid-cols-5 border border-ink/10">
            <TabButton active={tab === "page"} icon={<ImageIcon size={15} />} label="Page" onClick={() => setTab("page")} />
            <TabButton active={tab === "story"} icon={<Layers size={15} />} label="Story" onClick={() => setTab("story")} />
            <TabButton active={tab === "tags"} icon={<Tags size={15} />} label="Tags" onClick={() => setTab("tags")} />
            <TabButton active={tab === "archive"} icon={<Archive size={15} />} label="Archive" onClick={() => setTab("archive")} />
            <TabButton active={tab === "delete"} icon={<Trash2 size={15} />} label="Delete" onClick={() => setTab("delete")} />
          </div>

          <div className="mt-5">
            {tab === "page" ? <PageAssignmentForm selectedIds={selectedIds} siteSections={siteSections} /> : null}
            {tab === "story" ? <StoryAssignmentForm projects={projects} selectedIds={selectedIds} /> : null}
            {tab === "tags" ? <TagAssignmentForm selectedIds={selectedIds} /> : null}
            {tab === "archive" ? <ArchiveAssignmentForm selectedIds={selectedIds} /> : null}
            {tab === "delete" ? <DeleteMediaForm selectedIds={selectedIds} /> : null}
          </div>
        </div>
      </aside>
    </div>
  );
}

function HiddenSelectedAssets({ selectedIds }: { selectedIds: string[] }) {
  return (
    <>
      {selectedIds.map((id) => (
        <input key={id} name="asset_ids" type="hidden" value={id} />
      ))}
    </>
  );
}

function PageAssignmentForm({
  selectedIds,
  siteSections,
}: {
  selectedIds: string[];
  siteSections: SiteSectionOption[];
}) {
  return (
    <form action={assignMediaToSiteSection} className="grid gap-4">
      <HiddenSelectedAssets selectedIds={selectedIds} />
      <label className="grid gap-2 text-sm font-black">
        Page placement
        <select className="min-h-12 border border-ink/14 bg-white p-3 text-sm font-bold text-ink" name="section_id" required>
          <option value="">Choose where the image goes</option>
          {groupSectionsByPage(siteSections).map((group) => (
            <optgroup key={group.pageSlug} label={toPageLabel(group.pageSlug)}>
              {group.sections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.placement} / {section.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>
      <PreviewNote title="Page preview" body="Selected media will be added to this section. If several are selected, the public header can rotate them where the page supports a carousel." />
      <button className="bg-navy px-5 py-3 text-sm font-black uppercase tracking-[0.08em] text-white disabled:opacity-40" disabled={selectedIds.length === 0} type="submit">
        Apply to Page
      </button>
    </form>
  );
}

function StoryAssignmentForm({
  projects,
  selectedIds,
}: {
  projects: ProjectOption[];
  selectedIds: string[];
}) {
  return (
    <div className="grid gap-5">
      <form action={assignMediaToProject} className="grid gap-4 border border-ink/10 bg-warm-white p-4">
        <HiddenSelectedAssets selectedIds={selectedIds} />
        <label className="grid gap-2 text-sm font-black">
          Existing story
          <select className="min-h-12 border border-ink/14 bg-white p-3 text-sm font-bold text-ink" name="project_id" required>
            <option value="">Choose story</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.title} {project.published ? "" : "(draft)"}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-black">
          Image role
          <select className="min-h-12 border border-ink/14 bg-white p-3 text-sm font-bold text-ink" name="role">
            <option value="gallery">Add to gallery</option>
            <option value="hero">Set first as hero</option>
            <option value="before">Before</option>
            <option value="during">During</option>
            <option value="after">After</option>
          </select>
        </label>
        <PreviewNote title="Story preview" body="Hero uses the first selected image. Additional selected images are added as gallery proof." />
        <button className="bg-navy px-5 py-3 text-sm font-black uppercase tracking-[0.08em] text-white disabled:opacity-40" disabled={selectedIds.length === 0} type="submit">
          Apply to Story
        </button>
      </form>

      <form action={createDraftProjectFromMedia} className="grid gap-4 border border-ink/10 p-4">
        <HiddenSelectedAssets selectedIds={selectedIds} />
        <p className="text-sm font-black uppercase tracking-[0.1em] text-brand-red">New draft story</p>
        <input className="min-h-12 border border-ink/14 bg-white p-3 text-sm font-bold text-ink" name="title" placeholder="Project name" required />
        <select className="min-h-12 border border-ink/14 bg-white p-3 text-sm font-bold text-ink" name="project_type">
          <option value="">Project type</option>
          {projectTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <input className="min-h-12 border border-ink/14 bg-white p-3 text-sm font-bold text-ink" name="location" placeholder="Location" />
        <button className="border border-ink/14 px-5 py-3 text-sm font-black uppercase tracking-[0.08em] text-ink disabled:opacity-40" disabled={selectedIds.length === 0} type="submit">
          Create Draft With Media
        </button>
      </form>
    </div>
  );
}

function TagAssignmentForm({ selectedIds }: { selectedIds: string[] }) {
  return (
    <form action={tagSelectedMedia} className="grid gap-4">
      <HiddenSelectedAssets selectedIds={selectedIds} />
      <div className="grid max-h-64 gap-2 overflow-auto border border-ink/10 bg-warm-white p-3 sm:grid-cols-2">
        {Array.from(new Set(quickTags)).map((tag) => (
          <label key={tag} className="flex items-center gap-2 text-sm font-bold text-steel">
            <input name="tags" type="checkbox" value={tag} />
            {tag}
          </label>
        ))}
      </div>
      <PreviewNote title="Tags" body="Tags help the team find images later. They do not publish anything by themselves." />
      <button className="bg-navy px-5 py-3 text-sm font-black uppercase tracking-[0.08em] text-white disabled:opacity-40" disabled={selectedIds.length === 0} type="submit">
        Save Tags
      </button>
    </form>
  );
}

function ArchiveAssignmentForm({ selectedIds }: { selectedIds: string[] }) {
  return (
    <form action={archiveSelectedMedia} className="grid gap-4">
      <HiddenSelectedAssets selectedIds={selectedIds} />
      <PreviewNote title="Archive selected" body="Archived media is hidden from normal assignment, but the stored file is not immediately deleted." />
      <button className="bg-brand-red px-5 py-3 text-sm font-black uppercase tracking-[0.08em] text-white disabled:opacity-40" disabled={selectedIds.length === 0} type="submit">
        Move to Archive
      </button>
    </form>
  );
}

function DeleteMediaForm({ selectedIds }: { selectedIds: string[] }) {
  return (
    <form
      action={deleteSelectedMedia}
      className="grid gap-4"
      onSubmit={(event) => {
        if (!window.confirm("Permanently delete selected media files and remove them from pages/projects?")) {
          event.preventDefault();
        }
      }}
    >
      <HiddenSelectedAssets selectedIds={selectedIds} />
      <PreviewNote
        title="Delete permanently"
        body="This removes selected media from page placements, project stories, the media library, and Supabase Storage."
      />
      <button className="bg-brand-red px-5 py-3 text-sm font-black uppercase tracking-[0.08em] text-white disabled:opacity-40" disabled={selectedIds.length === 0} type="submit">
        Delete Permanently
      </button>
    </form>
  );
}

function QuickArchiveForm({ selectedIds }: { selectedIds: string[] }) {
  return (
    <form action={archiveSelectedMedia}>
      <HiddenSelectedAssets selectedIds={selectedIds} />
      <button className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.08em] text-navy hover:text-brand-red" type="submit">
        <Archive size={16} />
        Archive
      </button>
    </form>
  );
}

function QuickDeleteForm({ selectedIds }: { selectedIds: string[] }) {
  return (
    <form
      action={deleteSelectedMedia}
      onSubmit={(event) => {
        if (!window.confirm("Permanently delete selected media files and remove them from pages/projects?")) {
          event.preventDefault();
        }
      }}
    >
      <HiddenSelectedAssets selectedIds={selectedIds} />
      <button className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.08em] text-brand-red hover:text-navy" type="submit">
        <Trash2 size={16} />
        Delete
      </button>
    </form>
  );
}

function TabButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`flex min-h-12 items-center justify-center gap-1 border-r border-ink/10 text-xs font-black uppercase tracking-[0.06em] ${
        active ? "bg-navy text-white" : "text-steel hover:bg-warm-white hover:text-brand-red"
      }`}
      onClick={onClick}
      type="button"
    >
      {icon}
      {label}
    </button>
  );
}

function PreviewNote({ body, title }: { body: string; title: string }) {
  return (
    <div className="border border-ink/10 bg-warm-white p-4">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-brand-red">{title}</p>
      <p className="mt-2 text-sm font-bold leading-6 text-steel">{body}</p>
    </div>
  );
}

function MediaPreview({ asset }: { asset: MediaAsset }) {
  if (asset.media_type === "video") {
    return <video className="h-full w-full object-contain" muted playsInline src={asset.public_url} />;
  }

  // eslint-disable-next-line @next/next/no-img-element
  return <img alt={asset.alt_text ?? "Media asset"} className="h-full w-full object-cover" src={asset.public_url} />;
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)}KB`;
  }

  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

function groupSectionsByPage(sections: SiteSectionOption[]) {
  const pageRank = new Map(pageOrder.map((slug, index) => [slug, index]));
  const groups = new Map<string, SiteSectionOption[]>();

  for (const section of sections) {
    groups.set(section.page_slug, [...(groups.get(section.page_slug) ?? []), section]);
  }

  return Array.from(groups.entries())
    .map(([pageSlug, pageSections]) => ({
      pageSlug,
      sections: pageSections.sort((left, right) => left.placement.localeCompare(right.placement)),
    }))
    .sort((left, right) => (pageRank.get(left.pageSlug) ?? 999) - (pageRank.get(right.pageSlug) ?? 999));
}

function toPageLabel(slug: string) {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
