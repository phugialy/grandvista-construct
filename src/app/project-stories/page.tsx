import { projectStoryFields } from "@/lib/site-content";
import { getPublishedProjects } from "@/lib/supabase/public-data";

export default async function ProjectStoriesPage() {
  const projects = await getPublishedProjects();

  return (
    <main className="min-h-screen bg-warm-white text-ink">
      <section className="section-shell py-20">
        <p className="eyebrow">Project Stories</p>
        <h1 className="mt-4 max-w-4xl text-5xl font-black leading-tight">
          Proof should explain what the project made possible.
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-steel">
          This section is planned as a CMS-powered case-study system. Each project should describe
          business intent, construction challenge, delivery approach, and built outcome.
        </p>
        <div className="mt-12 border border-ink/12 bg-white p-8">
          <h2 className="text-2xl font-black">Case study structure</h2>
          <div className="mt-6 grid gap-3 md:grid-cols-5">
            {projectStoryFields.map((field) => (
              <div key={field} className="bg-warm-white p-5 text-sm font-black text-navy">
                {field}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-8 grid gap-5">
          {projects.length === 0 ? (
            <article className="border border-ink/12 bg-white p-8">
              <h2 className="text-2xl font-black">Project stories are ready for proof.</h2>
              <p className="mt-4 max-w-3xl leading-7 text-steel">
                Published case studies from Supabase will appear here. The structure is ready for
                project intent, what was at stake, construction challenge, delivery approach, and
                built outcome.
              </p>
            </article>
          ) : null}

          {projects.map((project) => (
            <article key={project.id} className="border border-ink/12 bg-white p-8">
              <p className="text-sm font-black uppercase tracking-[0.12em] text-brand-red">
                {[project.project_type, project.location].filter(Boolean).join(" / ")}
              </p>
              <h2 className="mt-3 text-3xl font-black">{project.title}</h2>
              <p className="mt-4 max-w-3xl leading-7 text-steel">
                {project.project_intent ?? project.stakes ?? project.built_outcome}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
