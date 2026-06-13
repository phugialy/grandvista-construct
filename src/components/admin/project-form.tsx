import { createProject, deleteProject, updateProject } from "@/app/admin/projects/actions";
import { projectTags, projectTypes } from "@/lib/admin-projects";

type MediaAsset = {
  id: string;
  public_url: string;
  media_type: "image" | "video";
  alt_text: string | null;
  caption: string | null;
  tags: string[];
};

type ProjectFormData = {
  id?: string;
  slug?: string;
  title?: string;
  location?: string | null;
  client_type?: string | null;
  project_type?: string | null;
  summary?: string | null;
  story_body?: string | null;
  tags?: string[] | null;
  seo_title?: string | null;
  seo_description?: string | null;
  featured?: boolean;
  published?: boolean;
  hero_asset_id?: string | null;
  gallery_asset_ids?: string[];
};

const inputClass =
  "min-h-12 border border-ink/14 bg-white p-4 text-base text-ink outline-none transition placeholder:text-steel/70 focus:border-navy";

export function ProjectForm({
  project,
  mediaAssets,
}: {
  project?: ProjectFormData;
  mediaAssets: MediaAsset[];
}) {
  const action = project?.id ? updateProject : createProject;
  const selectedTags = project?.tags ?? [];
  const selectedGallery = project?.gallery_asset_ids ?? [];
  const generatedPreviewTitle = [project?.title, project?.project_type, project?.location]
    .filter(Boolean)
    .join(" | ");
  const seoPreviewTitle =
    project?.seo_title ??
    (generatedPreviewTitle || "Auto-created from project name, type, and location");
  const seoPreviewDescription =
    project?.seo_description ??
    project?.summary ??
    project?.story_body ??
    "Auto-created from the listing description or project story when saved.";

  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      {project?.id ? <input name="project_id" type="hidden" value={project.id} /> : null}

      <div className="grid gap-6">
        <section className="border border-ink/12 bg-white p-6">
          <p className="text-sm font-black uppercase tracking-[0.12em] text-brand-red">Project basics</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 font-bold md:col-span-2">
              Project name
              <input className={inputClass} defaultValue={project?.title} name="title" required />
            </label>
            <label className="grid gap-2 font-bold">
              Project type
              <select className={inputClass} defaultValue={project?.project_type ?? ""} name="project_type">
                <option value="">Select type</option>
                {projectTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 font-bold">
              Location
              <input className={inputClass} defaultValue={project?.location ?? ""} name="location" />
            </label>
          </div>
        </section>

        <section className="border border-ink/12 bg-white p-6">
          <p className="text-sm font-black uppercase tracking-[0.12em] text-brand-red">Project story</p>
          <p className="mt-2 text-sm font-bold leading-6 text-steel">
            Write one paragraph covering the project intent, what was at stake, the challenge, how it was delivered, and the built outcome.
          </p>
          <div className="mt-5 grid gap-5">
            <label className="grid gap-2 font-bold">
              Full project story
              <textarea
                className={`${inputClass} min-h-52 resize-y`}
                defaultValue={project?.story_body ?? ""}
                name="story_body"
                placeholder="Example: Grandvista built out a 4,200 sq ft commercial tenant space inside an active strip center, coordinating three trades around live neighboring tenants and a hard opening deadline..."
              />
            </label>
            <label className="grid gap-2 font-bold">
              Listing description
              <span className="text-xs font-normal text-steel">Short summary shown on project cards. Auto-fills SEO description if blank.</span>
              <textarea
                className={`${inputClass} min-h-24 resize-y`}
                defaultValue={project?.summary ?? ""}
                maxLength={520}
                name="summary"
                placeholder="Example: Commercial finish-out prepared for opening with trade coordination, inspection awareness, and durable daily-use details."
              />
            </label>
          </div>
        </section>

        <section className="border border-ink/12 bg-white p-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.12em] text-brand-red">Media</p>
              <h2 className="mt-2 text-2xl font-black">Choose available proof for this project</h2>
            </div>
            <a
              className="border border-ink/14 px-4 py-3 text-sm font-black uppercase tracking-[0.08em] text-ink hover:border-brand-red hover:text-brand-red"
              href="/admin/media"
            >
              Upload Media
            </a>
          </div>

          {mediaAssets.length === 0 ? (
            <p className="mt-6 border border-ink/10 bg-warm-white p-5 font-bold text-steel">
              No unassigned media is ready for this project. Upload or reassign jobsite proof from the Media Pool first.
            </p>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {mediaAssets.map((asset) => (
                <MediaChoice
                  asset={asset}
                  heroAssetId={project?.hero_asset_id}
                  key={asset.id}
                  selectedGallery={selectedGallery}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      <aside className="grid content-start gap-6">
        <section className="border border-ink/12 bg-white p-6">
          <p className="text-sm font-black uppercase tracking-[0.12em] text-brand-red">Publish</p>
          <div className="mt-5 grid gap-4">
            <label className="flex items-center gap-3 font-black">
              <input defaultChecked={project?.published} name="published" type="checkbox" />
              Published
            </label>
            <label className="flex items-center gap-3 font-black">
              <input defaultChecked={project?.featured} name="featured" type="checkbox" />
              Featured story
            </label>
          </div>
        </section>

        <section className="border border-ink/12 bg-white p-6">
          <p className="text-sm font-black uppercase tracking-[0.12em] text-brand-red">
            Project signals
          </p>
          <p className="mt-3 text-sm font-bold leading-6 text-steel">
            Optional. Leave this blank and the system will choose signals from the project type and
            story. Use these only when you want to guide filters or search context.
          </p>
          <div className="mt-5 grid gap-3">
            {projectTags.map((tag) => (
              <label key={tag} className="flex items-center gap-3 text-sm font-bold text-steel">
                <input defaultChecked={selectedTags.includes(tag)} name="tags" type="checkbox" value={tag} />
                {tag}
              </label>
            ))}
          </div>
        </section>

        <section className="border border-ink/12 bg-white p-6">
          <p className="text-sm font-black uppercase tracking-[0.12em] text-brand-red">
            Search preview
          </p>
          <div className="mt-5 border border-ink/10 bg-warm-white p-4">
            <p className="text-base font-black text-navy">{seoPreviewTitle}</p>
            <p className="mt-2 text-sm leading-6 text-steel">{seoPreviewDescription.slice(0, 156)}</p>
          </div>
          <details className="mt-5">
            <summary className="cursor-pointer text-sm font-black uppercase tracking-[0.08em] text-ink hover:text-brand-red">
              Advanced search overrides
            </summary>
            <p className="mt-3 text-sm font-bold leading-6 text-steel">
              Most users can leave these blank. The site will create a slug, title, and description
              from the project story.
            </p>
            <div className="mt-5 grid gap-4">
            <label className="grid gap-2 font-bold">
              Slug
              <input className={inputClass} defaultValue={project?.slug} name="slug" placeholder="Auto-created if blank" />
            </label>
            <label className="grid gap-2 font-bold">
              SEO title
              <input className={inputClass} defaultValue={project?.seo_title ?? ""} name="seo_title" placeholder="Auto-filled if blank" />
            </label>
            <label className="grid gap-2 font-bold">
              SEO description
              <span className="text-xs font-normal text-steel">Max 156 characters. Auto-filled from listing description if blank.</span>
              <textarea
                className={`${inputClass} min-h-24 resize-y`}
                defaultValue={project?.seo_description ?? ""}
                maxLength={156}
                name="seo_description"
              />
            </label>
            </div>
          </details>
        </section>

        <button
          className="bg-navy px-6 py-4 text-sm font-black uppercase tracking-[0.08em] text-white hover:bg-brand-red"
          type="submit"
        >
          {project?.id ? "Save Project" : "Create Project"}
        </button>

        {project?.id ? (
          <section className="border border-brand-red/25 bg-white p-6">
            <p className="text-sm font-black uppercase tracking-[0.12em] text-brand-red">Danger zone</p>
            <p className="mt-3 text-sm font-bold leading-6 text-steel">
              Delete this project story and remove it from public project pages. Media files stay in the media pool.
            </p>
            <button
              className="mt-5 w-full border border-brand-red px-5 py-3 text-sm font-black uppercase tracking-[0.08em] text-brand-red hover:bg-brand-red hover:text-white"
              formAction={deleteProject}
              formNoValidate
              type="submit"
            >
              Delete Project Story
            </button>
          </section>
        ) : null}
      </aside>
    </form>
  );
}

function MediaChoice({
  asset,
  heroAssetId,
  selectedGallery,
}: {
  asset: MediaAsset;
  heroAssetId?: string | null;
  selectedGallery: string[];
}) {
  return (
    <article className="border border-ink/12 bg-warm-white p-3">
      <div className="aspect-[4/3] overflow-hidden bg-ink">
        {asset.media_type === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt={asset.alt_text ?? "Uploaded project media"} className="h-full w-full object-cover" src={asset.public_url} />
        ) : (
          <video className="h-full w-full object-cover" muted src={asset.public_url} />
        )}
      </div>
      <div className="mt-3 grid gap-2">
        <label className="flex items-center gap-3 text-sm font-black">
          <input defaultChecked={heroAssetId === asset.id} name="hero_asset_id" type="radio" value={asset.id} />
          Hero
        </label>
        <label className="flex items-center gap-3 text-sm font-bold text-steel">
          <input defaultChecked={selectedGallery.includes(asset.id)} name="gallery_asset_ids" type="checkbox" value={asset.id} />
          Gallery
        </label>
      </div>
    </article>
  );
}
