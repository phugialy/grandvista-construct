import { cacheLife, cacheTag } from "next/cache";
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
  story_body: string | null;
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
  updated_at: string | null;
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
  content_source: "manual" | "featured_project" | "fallback";
  featured_project_id: string | null;
  featured_projects: PublishedProject[];
  media_assets: {
    id: string;
    public_url: string;
    media_type: "image" | "video";
    alt_text: string | null;
    caption: string | null;
  } | null;
  section_media: SiteSectionMediaAsset[];
};

export type SiteSectionMediaAsset = {
  id: string;
  public_url: string;
  media_type: "image" | "video";
  alt_text: string | null;
  caption: string | null;
};

export type BlogIntegrationSettings = {
  id: string;
  provider: string;
  enabled: boolean;
  default_status: "draft" | "published";
  embed_container_id: string | null;
  embed_script_url: string | null;
  posts_per_page: number;
  featured_post_id: string | null;
  last_sync_status: string | null;
  last_sync_at: string | null;
};

export type PublishedBlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string | null;
  hero_image_url: string | null;
  hero_image_alt: string | null;
  tags: string[] | null;
  seo_title: string | null;
  seo_description: string | null;
  featured: boolean;
  published_at: string | null;
  updated_at: string | null;
};

export function getSectionPrimaryMedia(section?: SiteSection) {
  if (!section || section.content_source === "fallback") {
    return null;
  }

  return section.section_media[0] ?? section.media_assets ?? null;
}

type RawSiteSection = Omit<SiteSection, "featured_projects" | "media_assets" | "section_media"> & {
  media_assets:
    | SiteSection["media_assets"]
    | SiteSection["media_assets"][];
};

type FeaturedProjectRow = {
  site_section_id: string;
  sort_order: number;
  projects: PublishedProject | PublishedProject[] | null;
};

type SectionMediaRow = {
  site_section_id: string;
  sort_order: number;
  media_assets: SiteSectionMediaAsset | SiteSectionMediaAsset[] | null;
};

export async function getProjectCategories(): Promise<ProjectCategory[]> {
  "use cache";
  cacheTag("project-categories");
  cacheLife({ revalidate: 300 });

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
}

export async function getPublishedProjects(): Promise<PublishedProject[]> {
  "use cache";
  cacheTag("published-projects");
  cacheLife({ revalidate: 300 });

  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("projects")
    .select(
      "id,slug,title,location,client_type,project_type,summary,story_body,client_goal,project_pressures,built_outcomes,tags,seo_title,seo_description,project_intent,stakes,challenge,delivery_approach,built_outcome,featured,updated_at,project_media(id,media_type,role,url,alt,caption,sort_order)",
    )
    .eq("published", true)
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load published projects", error);
    return [];
  }

  return (data ?? []) as PublishedProject[];
}

export async function getPublishedProjectBySlug(slug: string): Promise<PublishedProject | null> {
  "use cache";
  cacheTag(`project-${slug}`);
  cacheLife({ revalidate: 300 });

  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("projects")
    .select(
      "id,slug,title,location,client_type,project_type,summary,story_body,client_goal,project_pressures,built_outcomes,tags,seo_title,seo_description,project_intent,stakes,challenge,delivery_approach,built_outcome,featured,updated_at,project_media(id,media_type,role,url,alt,caption,sort_order)",
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

export async function getSiteSections(): Promise<Record<string, SiteSection>> {
  "use cache";
  cacheTag("site-sections");
  cacheLife({ revalidate: 300 });

  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("site_sections")
    .select(
      "id,section_key,page_slug,placement,label,description,headline,body,media_asset_id,content_source,featured_project_id,media_assets(id,public_url,media_type,alt_text,caption)",
    )
    .eq("published", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Failed to load site sections", error);
    return {};
  }

  const rawSections = (data ?? []) as RawSiteSection[];
  const sectionIds = rawSections.map((section) => section.id);
  const [featuredProjectsBySectionId, mediaBySectionId] = await Promise.all([
    getFeaturedProjectsBySectionId(sectionIds),
    getSectionMediaBySectionId(sectionIds),
  ]);
  const sections = rawSections.map((section) => ({
    ...section,
    media_assets: Array.isArray(section.media_assets)
      ? section.media_assets[0] ?? null
      : section.media_assets,
    featured_projects: featuredProjectsBySectionId.get(section.id) ?? [],
    section_media: mediaBySectionId.get(section.id) ?? [],
  }));

  return Object.fromEntries(sections.map((section) => [section.section_key, section]));
}

export async function getBlogSettings(): Promise<BlogIntegrationSettings | null> {
  "use cache";
  cacheTag("blog-settings");
  cacheLife({ revalidate: 300 });

  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("blog_integration_settings")
    .select("id,provider,enabled,default_status,embed_container_id,embed_script_url,posts_per_page,featured_post_id,last_sync_status,last_sync_at")
    .eq("provider", "soro")
    .maybeSingle();

  if (error) {
    console.error("Failed to load blog settings", error);
    return null;
  }

  return data as BlogIntegrationSettings | null;
}

export async function getPublishedBlogPosts(): Promise<PublishedBlogPost[]> {
  "use cache";
  cacheTag("published-blog-posts");
  cacheLife({ revalidate: 300 });

  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select(
      "id,title,slug,excerpt,body,hero_image_url,hero_image_alt,tags,seo_title,seo_description,featured,published_at,updated_at",
    )
    .eq("status", "published")
    .order("featured", { ascending: false })
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Failed to load published blog posts", error);
    return [];
  }

  return (data ?? []) as PublishedBlogPost[];
}

export async function getPublishedBlogPostBySlug(slug: string): Promise<PublishedBlogPost | null> {
  "use cache";
  cacheTag(`blog-post-${slug}`);
  cacheLife({ revalidate: 300 });

  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select(
      "id,title,slug,excerpt,body,hero_image_url,hero_image_alt,tags,seo_title,seo_description,featured,published_at,updated_at",
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    console.error("Failed to load blog post", error);
    return null;
  }

  return data as PublishedBlogPost | null;
}

async function getFeaturedProjectsBySectionId(sectionIds: string[]) {
  const featuredProjectsBySectionId = new Map<string, PublishedProject[]>();

  if (sectionIds.length === 0) {
    return featuredProjectsBySectionId;
  }

  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("site_section_projects")
    .select(
      "site_section_id,sort_order,projects(id,slug,title,location,client_type,project_type,summary,story_body,client_goal,project_pressures,built_outcomes,tags,seo_title,seo_description,project_intent,stakes,challenge,delivery_approach,built_outcome,featured,updated_at,project_media(id,media_type,role,url,alt,caption,sort_order))",
    )
    .in("site_section_id", sectionIds)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Failed to load featured section projects", error);
    return featuredProjectsBySectionId;
  }

  for (const row of (data ?? []) as FeaturedProjectRow[]) {
    const project = Array.isArray(row.projects) ? row.projects[0] ?? null : row.projects;

    if (!project) {
      continue;
    }

    const projects = featuredProjectsBySectionId.get(row.site_section_id) ?? [];
    projects.push(project);
    featuredProjectsBySectionId.set(row.site_section_id, projects);
  }

  return featuredProjectsBySectionId;
}

async function getSectionMediaBySectionId(sectionIds: string[]) {
  const mediaBySectionId = new Map<string, SiteSectionMediaAsset[]>();

  if (sectionIds.length === 0) {
    return mediaBySectionId;
  }

  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("site_section_media")
    .select("site_section_id,sort_order,media_assets(id,public_url,media_type,alt_text,caption)")
    .in("site_section_id", sectionIds)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Failed to load section media", error);
    return mediaBySectionId;
  }

  for (const row of (data ?? []) as SectionMediaRow[]) {
    const media = Array.isArray(row.media_assets) ? row.media_assets[0] ?? null : row.media_assets;

    if (!media) {
      continue;
    }

    const sectionMedia = mediaBySectionId.get(row.site_section_id) ?? [];
    sectionMedia.push(media);
    mediaBySectionId.set(row.site_section_id, sectionMedia);
  }

  return mediaBySectionId;
}
