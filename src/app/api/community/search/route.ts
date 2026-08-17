import { NextResponse } from "next/server";
import { searchPublishedBlogPosts } from "@/lib/supabase/public-data";

const MAX_PAGE_SIZE = 24;

/**
 * Server-side search/filter/paginate for the community board. Only ever returns one
 * page of results — the client never holds the full archive, so a search or filter
 * change costs one small, indexed query instead of re-scanning everything in the browser.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Number(searchParams.get("pageSize")) || 12));
  const query = searchParams.get("q") ?? "";
  const area = searchParams.get("area") ?? "All Markets";
  const excludeId = searchParams.get("excludeId") || undefined;

  const { posts, totalCount } = await searchPublishedBlogPosts({ query, area, page, pageSize, excludeId });

  return NextResponse.json({ posts, totalCount });
}
