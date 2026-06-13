import { Bot, CheckCircle, XCircle } from "lucide-react";
import { requireAdmin } from "@/lib/admin-auth";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { AdminNav } from "@/components/admin/admin-nav";
import { applyProjectSuggestion, reviewSuggestion } from "./actions";

type Suggestion = {
  id: string;
  type: string;
  target_type: string;
  target_id: string | null;
  content: string;
  rationale: string | null;
  status: string;
  source: string;
  created_at: string;
};

type Project = {
  id: string;
  title: string;
  slug: string;
};

const typeLabels: Record<string, string> = {
  seo_title: "SEO Title",
  seo_description: "SEO Description",
  story_body: "Project Story",
  project_summary: "Project Summary",
  content_idea: "Content Idea",
};

export default async function AdminSuggestionsPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string; filter?: string }>;
}) {
  await requireAdmin();

  const params = await searchParams;
  const filterStatus = params?.filter ?? "pending";
  const flashStatus = params?.status;

  const supabase = getSupabaseServiceClient();
  const [{ data: suggestions, error: tableError }, { data: projects }] = await Promise.all([
    supabase
      .from("agent_suggestions")
      .select("id,type,target_type,target_id,content,rationale,status,source,created_at")
      .eq("status", filterStatus)
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("projects")
      .select("id,title,slug")
      .order("title", { ascending: true }),
  ]);

  const typedSuggestions = (suggestions ?? []) as Suggestion[];
  const typedProjects = (projects ?? []) as Project[];
  const tableReady = !tableError;

  function getProject(targetId: string | null) {
    if (!targetId) return null;
    return typedProjects.find((p) => p.id === targetId) ?? null;
  }

  return (
    <main className="min-h-screen bg-warm-white text-ink">
      <AdminNav
        title="Agent suggestions"
        description="Review assisted SEO, summary, and story edits before they touch public project pages."
      />

      <section className="section-shell py-10">
        {flashStatus === "accepted" ? (
          <p className="mb-6 border border-navy/20 bg-white p-4 text-sm font-bold text-navy">
            Suggestion accepted.
          </p>
        ) : flashStatus === "rejected" ? (
          <p className="mb-6 border border-ink/12 bg-white p-4 text-sm font-bold text-steel">
            Suggestion rejected.
          </p>
        ) : flashStatus === "error" ? (
          <p className="mb-6 border border-brand-red/20 bg-white p-4 text-sm font-bold text-brand-red">
            Something went wrong. Try again.
          </p>
        ) : null}

        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-3">
              <Bot className="text-brand-red" size={26} />
              <p className="eyebrow">AI agent suggestions</p>
            </div>
            <h2 className="mt-3 max-w-3xl text-4xl font-black leading-tight">
              Review assisted content before it becomes project copy
            </h2>
            <p className="mt-3 max-w-2xl leading-7 text-steel">
              Suggestions submitted by the AI agent gateway appear here. Apply only the pieces that
              sound accurate, grounded, and useful for buyers. Accept keeps a suggestion as reviewed;
              apply updates the project.
            </p>
          </div>
        </div>

        {!tableReady ? (
          <div className="border-l-4 border-brand-red bg-white p-6">
            <p className="text-sm font-black uppercase tracking-[0.12em] text-brand-red">
              Migration pending
            </p>
            <p className="mt-3 leading-7 text-steel">
              The agent suggestions table has not been applied yet. Run the SQL in{" "}
              <code className="bg-ink/8 px-2 py-1 text-xs">
                supabase/migrations/20260609000003_agent_suggestions.sql
              </code>{" "}
              in your Supabase dashboard SQL editor to activate this feature.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 flex gap-3">
              {["pending", "accepted", "rejected", "applied"].map((s) => (
                <a
                  key={s}
                  href={`/admin/suggestions?filter=${s}`}
                  className={`border px-4 py-2 text-sm font-black uppercase tracking-[0.08em] transition ${
                    filterStatus === s
                      ? "border-navy bg-navy text-white"
                      : "border-ink/12 text-ink hover:border-brand-red hover:text-brand-red"
                  }`}
                >
                  {s}
                </a>
              ))}
            </div>

            {typedSuggestions.length === 0 ? (
              <div className="border border-ink/12 bg-white p-8 text-center">
                <Bot className="mx-auto text-steel/40" size={40} />
                <p className="mt-4 font-bold text-steel">
                  No {filterStatus} suggestions.
                  {filterStatus === "pending"
                    ? " The AI agent hasn't submitted anything yet."
                    : ""}
                </p>
              </div>
            ) : null}

            <div className="grid gap-5">
              {typedSuggestions.map((suggestion) => {
                const project = getProject(suggestion.target_id);
                const label = typeLabels[suggestion.type] ?? suggestion.type;
                const canApplyToProject =
                  ["story_body", "project_summary", "seo_title", "seo_description"].includes(suggestion.type) &&
                  suggestion.target_type === "project" &&
                  project !== null &&
                  filterStatus === "pending";

                return (
                  <article key={suggestion.id} className="border border-ink/12 bg-white p-6">
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="border border-brand-red/30 bg-brand-red/8 px-3 py-1 text-xs font-black uppercase tracking-[0.1em] text-brand-red">
                            {label}
                          </span>
                          {project ? (
                            <span className="text-sm font-bold text-navy">{project.title}</span>
                          ) : suggestion.target_id ? (
                            <span className="text-xs font-bold text-steel">
                              target: {suggestion.target_id.slice(0, 8)}…
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-steel">
                              {suggestion.target_type}
                            </span>
                          )}
                        </div>

                        <div className="mt-4 border-l-4 border-ink/10 bg-warm-white p-4">
                          <p className="text-base leading-8 text-ink">{suggestion.content}</p>
                        </div>

                        {suggestion.rationale ? (
                          <p className="mt-3 text-sm leading-6 text-steel">
                            <strong>Rationale:</strong> {suggestion.rationale}
                          </p>
                        ) : null}

                        <p className="mt-3 text-xs font-bold text-steel/70">
                          {new Date(suggestion.created_at).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>

                      {filterStatus === "pending" ? (
                        <div className="flex shrink-0 flex-col gap-2">
                          {canApplyToProject && project ? (
                            <form action={applyProjectSuggestion}>
                              <input name="suggestion_id" type="hidden" value={suggestion.id} />
                              <input name="project_id" type="hidden" value={project.id} />
                              <input name="type" type="hidden" value={suggestion.type} />
                              <input name="content" type="hidden" value={suggestion.content} />
                              <button
                                className="flex w-full items-center justify-center gap-2 bg-navy px-4 py-3 text-sm font-black uppercase tracking-[0.08em] text-white hover:bg-brand-red"
                                type="submit"
                              >
                                Apply to Project
                              </button>
                            </form>
                          ) : null}
                          <form action={reviewSuggestion} className="flex gap-2">
                            <input name="id" type="hidden" value={suggestion.id} />
                            <button
                              className="flex flex-1 items-center justify-center gap-2 border border-navy/20 px-4 py-3 text-sm font-black uppercase tracking-[0.08em] text-navy hover:bg-navy hover:text-white"
                              name="action"
                              type="submit"
                              value="accept"
                            >
                              <CheckCircle size={14} /> Accept
                            </button>
                            <button
                              className="flex flex-1 items-center justify-center gap-2 border border-ink/12 px-4 py-3 text-sm font-black uppercase tracking-[0.08em] text-steel hover:border-brand-red hover:text-brand-red"
                              name="action"
                              type="submit"
                              value="reject"
                            >
                              <XCircle size={14} /> Reject
                            </button>
                          </form>
                        </div>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
