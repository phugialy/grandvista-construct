import type { Metadata } from "next";
import { BlogWidgetPage } from "@/components/marketing/blog-widget-page";
import { getBlogSettings, getPublishedBlogPosts } from "@/lib/supabase/public-data";

export const metadata: Metadata = {
  title: "Insights | Commercial Construction Notes | Grandvista",
  description:
    "Commercial construction insights from Grandvista, focused on project readiness, field coordination, business spaces, and owner-minded construction decisions.",
  openGraph: {
    title: "Insights | Commercial Construction Notes | Grandvista",
    description:
      "Commercial construction insights from Grandvista, focused on project readiness, field coordination, business spaces, and owner-minded construction decisions.",
    url: "https://grandvista-construction.com/insights",
    siteName: "Grandvista Construction",
    type: "website",
  },
};

export default async function InsightsPage() {
  const [settings, posts] = await Promise.all([getBlogSettings(), getPublishedBlogPosts()]);

  return (
    <BlogWidgetPage
      copy="Practical construction notes for owners, operators, and project teams thinking through project readiness, field coordination, schedule pressure, and usable built outcomes."
      eyebrow="Insights"
      posts={posts}
      settings={settings}
      title="Grandvista Insights"
    />
  );
}
