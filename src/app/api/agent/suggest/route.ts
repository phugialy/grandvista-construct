import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

type SuggestionPayload = {
  type: "seo_title" | "seo_description" | "story_body" | "project_summary" | "content_idea";
  target_type: "project" | "page" | "global";
  target_id?: string;
  content: string;
  rationale?: string;
};

function isValidPayload(body: unknown): body is SuggestionPayload {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  const validTypes = ["seo_title", "seo_description", "story_body", "project_summary", "content_idea"];
  const validTargetTypes = ["project", "page", "global"];
  return (
    typeof b.type === "string" &&
    validTypes.includes(b.type) &&
    typeof b.target_type === "string" &&
    validTargetTypes.includes(b.target_type) &&
    (typeof b.target_id === "undefined" || typeof b.target_id === "string") &&
    typeof b.content === "string" &&
    b.content.trim().length > 0
  );
}

function authenticate(request: NextRequest) {
  const auth = request.headers.get("authorization");
  const agentKey = process.env.AGENT_API_KEY?.trim();

  if (!agentKey) {
    return false;
  }

  return auth === `Bearer ${agentKey}`;
}

export async function POST(request: NextRequest) {
  if (!authenticate(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!isValidPayload(body)) {
    return NextResponse.json(
      {
        error: "Invalid payload. Required: type, target_type, content. Optional: target_id, rationale.",
        valid_types: ["seo_title", "seo_description", "story_body", "project_summary", "content_idea"],
        valid_target_types: ["project", "page", "global"],
      },
      { status: 422 },
    );
  }

  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("agent_suggestions")
    .insert({
      type: body.type,
      target_type: body.target_type,
      target_id: body.target_id ?? null,
      content: body.content.trim(),
      rationale: body.rationale?.trim() ?? null,
      source: "agent",
      status: "pending",
    })
    .select("id,type,target_type,target_id,status,created_at")
    .single();

  if (error) {
    console.error("Agent suggestion insert failed", error);
    return NextResponse.json({ error: "Failed to save suggestion" }, { status: 500 });
  }

  return NextResponse.json({ suggestion: data }, { status: 201 });
}

export async function GET(request: NextRequest) {
  if (!authenticate(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") ?? "pending";
  const target_type = searchParams.get("target_type");
  const requestedLimit = Number.parseInt(searchParams.get("limit") ?? "50", 10);
  const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 200) : 50;

  const supabase = getSupabaseServiceClient();
  let query = supabase
    .from("agent_suggestions")
    .select("id,type,target_type,target_id,content,rationale,status,source,created_at,reviewed_at")
    .eq("status", status)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (target_type) {
    query = query.eq("target_type", target_type);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: "Failed to fetch suggestions" }, { status: 500 });
  }

  return NextResponse.json({ suggestions: data ?? [], count: data?.length ?? 0 });
}
