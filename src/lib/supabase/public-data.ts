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
  summary: string | null;
  client_goal: string | null;
  project_pressures: string[] | null;
  built_outcomes: string[] | null;
  tags: string[] | null;
  seo_title: string | null;
  seo_description: string | null;
  project_intent: string | null;
  stakes: string | null;
  challenge: string | null;
  delivery_approach: string | null;
  built_outcome: string | null;
  featured: boolean;
  project_media?: ProjectMedia[];
};

export type ProjectMedia = {
  id: string;
  media_type: "image" | "video";
  role: "hero" | "gallery" | "before" | "during" | "after";
  url: string;
  alt: string | null;
  caption: string | null;
  sort_order: number;
};

export type SiteSection = {
  id: string;
  section_key: string;
  page_slug: string;
  placement: string;
  label: string;
  description: string;
  headline: string | null;
  body: string | null;
  media_asset_id: string | null;
  media_assets: {
    id: string;
    public_url: string;
    media_type: "image" | "video";
    alt_text: string | null;
    caption: string | null;
  } | null;
};

type RawSiteSection = Omit<SiteSection, "media_assets"> & {
  media_assets:
    | SiteSection["media_assets"]
    | SiteSection["media_assets"][];
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
        "id,slug,title,location,client_type,project_type,summary,client_goal,project_pressures,built_outcomes,tags,seo_title,seo_description,project_intent,stakes,challenge,delivery_approach,built_outcome,featured,project_media(id,media_type,role,url,alt,caption,sort_order)",
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

export async function getPublishedProjectBySlug(slug: string) {
  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("projects")
    .select(
      "id,slug,title,location,client_type,project_type,summary,client_goal,project_pressures,built_outcomes,tags,seo_title,seo_description,project_intent,stakes,challenge,delivery_approach,built_outcome,featured,project_media(id,media_type,role,url,alt,caption,sort_order)",
    )
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (error) {
    console.error("Failed to load project story", error);
    return null;
  }

  return data as PublishedProject;
}

export const getSiteSections = unstable_cache(
  async () => {
    const supabase = getSupabaseServiceClient();
    const { data, error } = await supabase
      .from("site_sections")
      .select(
        "id,section_key,page_slug,placement,label,description,headline,body,media_asset_id,media_assets(id,public_url,media_type,alt_text,caption)",
      )
      .eq("published", true)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Failed to load site sections", error);
      return {};
    }

    const sections = ((data ?? []) as RawSiteSection[]).map((section) => ({
      ...section,
      media_assets: Array.isArray(section.media_assets)
        ? section.media_assets[0] ?? null
        : section.media_assets,
    }));

    return Object.fromEntries(sections.map((section) => [section.section_key, section]));
  },
  ["site-sections"],
  { revalidate: 300 },
);
