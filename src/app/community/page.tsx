import type { Metadata } from "next";
import { JsonLd } from "@/components/marketing/json-ld";
import { CommunityIntelligencePage } from "@/components/marketing/community-intelligence-page";
import { breadcrumbJsonLd } from "@/lib/schema";
import { getPublishedBlogPosts } from "@/lib/supabase/public-data";

export const metadata: Metadata = {
  title: "Community | Grandvista",
  description:
    "Grandvista's own community hub - real project and market coverage for owners, operators, and project teams across DFW commercial and industrial construction.",
  alternates: {
    canonical: "/community",
  },
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
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: "https://grandvista-construction.com" },
          { name: "Community", url: "https://grandvista-construction.com/community" },
        ]) as Record<string, unknown>}
      />
      <CommunityIntelligencePage posts={posts} />
    </>
  );
}
