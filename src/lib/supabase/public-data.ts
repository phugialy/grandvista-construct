import { unstable_cache } from "next/cache";
import { getSupabaseServiceClient } from "./server";

export type ProjectCategory = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  sort_order: number;
};

export type PublishedProject = {
  id: string;
  slug: string;
  title: string;
  location: string | null;
  client_type: string | null;
  project_type: string | null;
  project_intent: string | null;
  stakes: string | null;
  challenge: string | null;
  delivery_approach: string | null;
  built_outcome: string | null;
  featured: boolean;
};

export const getProjectCategories = unstable_cache(
  async () => {
    const supabase = getSupabaseServiceClient();
    const { data, error } = await supabase
      .from("project_categories")
      .select("id,slug,title,summary,sort_order")
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Failed to load project categories", error);
      return [];
    }

    return (data ?? []) as ProjectCategory[];
  },
  ["project-categories"],
  { revalidate: 300 },
);

export const getPublishedProjects = unstable_cache(
  async () => {
    const supabase = getSupabaseServiceClient();
    const { data, error } = await supabase
      .from("projects")
      .select(
        "id,slug,title,location,client_type,project_type,project_intent,stakes,challenge,delivery_approach,built_outcome,featured",
      )
      .eq("published", true)
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to load published projects", error);
      return [];
    }

    return (data ?? []) as PublishedProject[];
  },
  ["published-projects"],
  { revalidate: 300 },
);
