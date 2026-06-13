import type { MetadataRoute } from "next";
import { getPublishedProjects } from "@/lib/supabase/public-data";

const siteUrl = "https://grandvista-construction.com";

const staticRoutes: Array<{
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
}> = [
  { path: "/", priority: 1, changeFrequency: "monthly" },
  { path: "/what-we-build", priority: 0.85, changeFrequency: "monthly" },
  { path: "/how-we-work", priority: 0.85, changeFrequency: "monthly" },
  { path: "/project-stories", priority: 0.9, changeFrequency: "weekly" },
  { path: "/our-direction", priority: 0.75, changeFrequency: "monthly" },
  { path: "/company", priority: 0.75, changeFrequency: "monthly" },
  { path: "/start-a-project", priority: 0.9, changeFrequency: "monthly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const projects = await getPublishedProjects();
  const staticPages = staticRoutes.map((route) => ({
    url: `${siteUrl}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
  const projectPages = projects.map((project) => ({
    url: `${siteUrl}/project-stories/${project.slug}`,
    lastModified: project.updated_at ? new Date(project.updated_at) : now,
    changeFrequency: "monthly" as const,
    priority: project.featured ? 0.85 : 0.75,
    images:
      project.project_media
        ?.filter((media) => media.media_type === "image" && media.url)
        .map((media) => media.url) ?? [],
  }));

  return [...staticPages, ...projectPages];
}
