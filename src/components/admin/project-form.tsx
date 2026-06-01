import { createProject, updateProject } from "@/app/admin/projects/actions";
import { builtOutcomes, clientGoals, projectPressures, projectTags, projectTypes } from "@/lib/admin-projects";

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
  client_goal?: string | null;
  project_pressures?: string[] | null;
  built_outcomes?: string[] | null;
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
  const selectedPressures = project?.project_pressures ?? [];
  const selectedOutcomes = project?.built_outcomes ?? [];
  const selectedTags = project?.tags ?? [];
  const selectedGallery = project?.gallery_asset_ids ?? [];

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
          <p className="text-sm font-black uppercase tracking-[0.12em] text-brand-red">Short story</p>
          <div className="mt-5 grid gap-5">
            <label className="grid gap-2 font-bold">
              One short project summary
              <textarea
                className={`${inputClass} min-h-32 resize-y`}
                defaultValue={project?.summary ?? ""}
                maxLength={520}
                name="summary"
                placeholder="Example: Commercial finish-out prepared for opening with trade coordination, inspection awareness, and durable daily-use details."
              />
            </label>
            <label className="grid gap-2 font-bold">
              Client goal
              <select className={inputClass} defaultValue={project?.client_goal ?? ""} name="client_goal">
                <option value="">Select goal</option>
                {clientGoals.map((goal) => (
                  <option key={goal} value={goal}>
                    {goal}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="border border-ink/12 bg-white p-6">
          <p className="text-sm font-black uppercase tracking-[0.12em] text-brand-red">Story signals</p>
          <div className="mt-5 grid gap-6 md:grid-cols-2">
            <CheckGroup name="project_pressures" options={projectPressures} selected={selectedPressures} title="Project pressure" />
            <CheckGroup name="built_outcomes" options={builtOutcomes} selected={selectedOutcomes} title="Built outcome" />
          </div>
        </section>

        <section className="border border-ink/12 bg-white p-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.12em] text-brand-red">Media</p>
              <h2 className="mt-2 text-2xl font-black">Choose proof from the media library</h2>
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
              No media is ready yet. Upload jobsite proof first, then return here to choose a hero and gallery.
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
          <p className="text-sm font-black uppercase tracking-[0.12em] text-brand-red">Tags</p>
          <div className="mt-5 grid gap-3">
            {projectTags.map((tag) => (
              <label key={tag} className="flex items-center gap-3 text-sm font-bold text-steel">
                <input defaultChecked={selectedTags.includes(tag)} name="tags" type="checkbox" value={tag} />
                {tag}
              </label>
            ))}
          </div>
        </section>

        <details className="border border-ink/12 bg-white p-6">
          <summary className="cursor-pointer text-sm font-black uppercase tracking-[0.12em] text-brand-red">
            Slug & SEO
          </summary>
          <div className="mt-5 grid gap-4">
            <label className="grid gap-2 font-bold">
              Slug
              <input className={inputClass} defaultValue={project?.slug} name="slug" placeholder="Auto-created if blank" />
            </label>
            <label className="grid gap-2 font-bold">
              SEO title
              <input className={inputClass} defaultValue={project?.seo_title ?? ""} name="seo_title" />
            </label>
            <label className="grid gap-2 font-bold">
              SEO description
              <textarea
                className={`${inputClass} min-h-28 resize-y`}
                defaultValue={project?.seo_description ?? ""}
                maxLength={156}
                name="seo_description"
              />
            </label>
          </div>
        </details>

        <button
          className="bg-navy px-6 py-4 text-sm font-black uppercase tracking-[0.08em] text-white hover:bg-brand-red"
          type="submit"
        >
          {project?.id ? "Save Project" : "Create Project"}
        </button>
      </aside>
    </form>
  );
}

function CheckGroup({
  name,
  options,
  selected,
  title,
}: {
  name: string;
  options: string[];
  selected: string[];
  title: string;
}) {
  return (
    <fieldset className="border border-ink/10 bg-warm-white p-5">
      <legend className="px-2 text-sm font-black uppercase tracking-[0.1em] text-ink">{title}</legend>
      <div className="mt-3 grid gap-3">
        {options.map((option) => (
          <label key={option} className="flex items-center gap-3 text-sm font-bold text-steel">
            <input defaultChecked={selected.includes(option)} name={name} type="checkbox" value={option} />
            {option}
          </label>
        ))}
      </div>
    </fieldset>
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
