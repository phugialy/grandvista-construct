import { NextResponse } from "next/server";
import { searchPublishedProjects } from "@/lib/supabase/public-data";

const MAX_PAGE_SIZE = 24;

/**
 * Server-side filter/paginate for the project archive. Only ever returns one page —
 * the client never holds the full archive, so a filter or page change costs one small
 * query instead of re-scanning everything already loaded in the browser.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Number(searchParams.get("pageSize")) || 6));
  const type = searchParams.get("type") ?? "All Types";
  const status = searchParams.get("status") ?? "All";
  const excludeIds = searchParams.get("excludeIds")?.split(",").filter(Boolean);

  const { projects, totalCount } = await searchPublishedProjects({ type, status, page, pageSize, excludeIds });

  return NextResponse.json({ projects, totalCount });
}
