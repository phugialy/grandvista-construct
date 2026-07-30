import type { Metadata } from "next";
import { JsonLd } from "@/components/marketing/json-ld";
import { BlogWidgetPage } from "@/components/marketing/blog-widget-page";
import { breadcrumbJsonLd } from "@/lib/schema";
import { getBlogSettings, getPublishedBlogPosts } from "@/lib/supabase/public-data";

export const metadata: Metadata = {
  title: "Insights | Commercial Construction Notes | Grandvista",
  description:
    "Commercial construction insights from Grandvista, focused on project readiness, field coordination, business spaces, and owner-minded construction decisions.",
  alternates: {
    canonical: "/insights",
  },
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
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: "https://grandvista-construction.com" },
          { name: "Insights", url: "https://grandvista-construction.com/insights" },
        ]) as Record<string, unknown>}
      />
      <BlogWidgetPage
        copy="Practical construction notes for owners, operators, and project teams thinking through project readiness, field coordination, schedule pressure, and usable built outcomes."
        eyebrow="Insights"
        posts={posts}
        settings={settings}
        title="Grandvista Insights"
      />
    </>
  );
}
