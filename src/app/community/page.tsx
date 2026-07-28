import type { Metadata } from "next";
import { BlogWidgetPage } from "@/components/marketing/blog-widget-page";
import { getPublishedBlogPosts } from "@/lib/supabase/public-data";

export const metadata: Metadata = {
  title: "Community | Grandvista",
  description:
    "Grandvista's own community hub - real project and market coverage for owners, operators, and project teams across DFW commercial and industrial construction.",
  openGraph: {
    title: "Community | Grandvista",
    description:
      "Grandvista's own community hub - real project and market coverage for owners, operators, and project teams across DFW commercial and industrial construction.",
    url: "https://grandvista-construction.com/community",
    siteName: "Grandvista Construction",
    type: "website",
  },
};

export default async function CommunityPage() {
  const posts = await getPublishedBlogPosts();

  return (
    <BlogWidgetPage
      basePath="/community"
      copy="Real project and market coverage from the DFW commercial and industrial construction world - what's breaking ground, what it signals, and why it matters for owners and operators."
      eyebrow="Community"
      posts={posts}
      settings={null}
      title="Grandvista Community"
    />
  );
}
