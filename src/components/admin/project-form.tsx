import { createProject, updateProject } from "@/app/admin/projects/actions";
import { projectTypes } from "@/lib/admin-projects";

type ProjectFormData = {
  id?: string;
  slug?: string;
  title?: string;
  location?: string | null;
  client_type?: string | null;
  project_type?: string | null;
  project_intent?: string | null;
  stakes?: string | null;
  challenge?: string | null;
  delivery_approach?: string | null;
  built_outcome?: string | null;
  featured?: boolean;
  published?: boolean;
  hero_url?: string | null;
  hero_alt?: string | null;
  gallery_url?: string | null;
  gallery_alt?: string | null;
};

const inputClass =
  "min-h-12 border border-ink/14 bg-white p-4 text-base text-ink outline-none transition placeholder:text-steel/70 focus:border-navy";

export function ProjectForm({ project }: { project?: ProjectFormData }) {
  const action = project?.id ? updateProject : createProject;

  return (
    <form action={action} className="grid gap-6 border border-ink/12 bg-white p-6">
      {project?.id ? <input name="project_id" type="hidden" value={project.id} /> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 font-bold">
          Project title
          <input className={inputClass} defaultValue={project?.title} name="title" required />
        </label>
        <label className="grid gap-2 font-bold">
          Slug
          <input className={inputClass} defaultValue={project?.slug} name="slug" placeholder="auto-created if blank" />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="grid gap-2 font-bold">
          Location
          <input className={inputClass} defaultValue={project?.location ?? ""} name="location" />
        </label>
        <label className="grid gap-2 font-bold">
          Client type
          <input className={inputClass} defaultValue={project?.client_type ?? ""} name="client_type" />
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
      </div>

      <TextArea label="Project intent" name="project_intent" value={project?.project_intent} />
      <TextArea label="What was at stake" name="stakes" value={project?.stakes} />
      <TextArea label="Construction challenge" name="challenge" value={project?.challenge} />
      <TextArea label="Delivery approach" name="delivery_approach" value={project?.delivery_approach} />
      <TextArea label="Built outcome" name="built_outcome" value={project?.built_outcome} />

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 font-bold">
          Hero image URL
          <input className={inputClass} defaultValue={project?.hero_url ?? ""} name="hero_url" />
        </label>
        <label className="grid gap-2 font-bold">
          Hero alt text
          <input className={inputClass} defaultValue={project?.hero_alt ?? ""} name="hero_alt" />
        </label>
        <label className="grid gap-2 font-bold">
          Gallery image URL
          <input className={inputClass} defaultValue={project?.gallery_url ?? ""} name="gallery_url" />
        </label>
        <label className="grid gap-2 font-bold">
          Gallery alt text
          <input className={inputClass} defaultValue={project?.gallery_alt ?? ""} name="gallery_alt" />
        </label>
      </div>

      <div className="flex flex-wrap gap-6 border border-ink/10 bg-warm-white p-5">
        <label className="flex items-center gap-3 font-black">
          <input defaultChecked={project?.featured} name="featured" type="checkbox" />
          Featured
        </label>
        <label className="flex items-center gap-3 font-black">
          <input defaultChecked={project?.published} name="published" type="checkbox" />
          Published
        </label>
      </div>

      <button
        className="bg-navy px-6 py-4 text-sm font-black uppercase tracking-[0.08em] text-white hover:bg-brand-red"
        type="submit"
      >
        {project?.id ? "Save Project" : "Create Project"}
      </button>
    </form>
  );
}

function TextArea({ label, name, value }: { label: string; name: string; value?: string | null }) {
  return (
    <label className="grid gap-2 font-bold">
      {label}
      <textarea className={`${inputClass} min-h-32 resize-y`} defaultValue={value ?? ""} name={name} />
    </label>
  );
}
