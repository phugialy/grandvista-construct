import type { Metadata } from "next";
import { JsonLd } from "@/components/marketing/json-ld";
import { CommunityIntelligencePage } from "@/components/marketing/community-intelligence-page";
import { breadcrumbJsonLd } from "@/lib/schema";
import {
  getCommunityMarketCount,
  getFeaturedBlogPost,
  getPublishedBlogPostsPage,
} from "@/lib/supabase/public-data";

const INITIAL_PAGE_SIZE = 12;

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
  const featuredPost = await getFeaturedBlogPost();
  const [{ posts, totalCount }, marketCount] = await Promise.all([
    getPublishedBlogPostsPage({ page: 1, pageSize: INITIAL_PAGE_SIZE, excludeId: featuredPost?.id }),
    getCommunityMarketCount(),
  ]);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: "https://grandvista-construction.com" },
          { name: "Community", url: "https://grandvista-construction.com/community" },
        ]) as Record<string, unknown>}
      />
      <CommunityIntelligencePage
        featuredPost={featuredPost}
        initialPosts={posts}
        marketCount={marketCount}
        totalCount={totalCount}
      />
    </>
  );
}
