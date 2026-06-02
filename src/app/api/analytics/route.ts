import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

const allowedEvents = new Set(["page_view", "cta_click"]);

type AnalyticsPayload = {
  event_name?: string;
  page_path?: string;
  target_path?: string;
  session_id?: string;
  referrer?: string;
  metadata?: Record<string, unknown>;
};

export async function POST(request: Request) {
  let payload: AnalyticsPayload;

  try {
    payload = (await request.json()) as AnalyticsPayload;
  } catch {
    return NextResponse.json({ error: "Invalid analytics payload." }, { status: 400 });
  }

  if (!payload.event_name || !allowedEvents.has(payload.event_name)) {
    return NextResponse.json({ error: "Unsupported analytics event." }, { status: 400 });
  }

  if (!payload.page_path || !payload.session_id) {
    return NextResponse.json({ error: "Missing analytics fields." }, { status: 400 });
  }

  const supabase = getSupabaseServiceClient();
  const { error } = await supabase.from("analytics_events").insert({
    event_name: payload.event_name,
    page_path: payload.page_path.slice(0, 500),
    target_path: payload.target_path?.slice(0, 500) ?? null,
    session_id: payload.session_id.slice(0, 80),
    referrer: payload.referrer?.slice(0, 500) ?? null,
    user_agent: request.headers.get("user-agent")?.slice(0, 500) ?? null,
    metadata: payload.metadata ?? {},
  });

  if (error) {
    console.error("Analytics insert failed", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
