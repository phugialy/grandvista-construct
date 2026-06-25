import type { Metadata } from "next";
import { BlogWidgetPage } from "@/components/marketing/blog-widget-page";
import { getBlogSettings, getPublishedBlogPosts } from "@/lib/supabase/public-data";

export const metadata: Metadata = {
  title: "Blog Widgets Preview | Grandvista",
  description:
    "Hidden preview page for Grandvista blog widget content before it is enabled in public navigation.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function BlogWidgetsPreviewPage() {
  const [settings, posts] = await Promise.all([getBlogSettings(), getPublishedBlogPosts()]);

  return (
    <BlogWidgetPage
      copy="A hidden preview space for article cards, third-party blog intake, and approved Grandvista construction notes before this section is promoted into public navigation."
      eyebrow="Blog Widgets Preview"
      posts={posts}
      settings={settings}
      title="A ready space for approved construction articles."
    />
  );
}
