import Link from "next/link";
import type { ReactNode } from "react";
import { BarChart3, ImageIcon, Inbox, Layers, PanelsTopLeft, PenLine, TrendingUp } from "lucide-react";
import { requireAdmin } from "@/lib/admin-auth";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { AdminNav } from "@/components/admin/admin-nav";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  await requireAdmin();

  const supabase = getSupabaseServiceClient();
  const now = new Date();
  const sevenDaysAgo = daysAgo(now, 7);
  const fourteenDaysAgo = daysAgo(now, 14);
  const [{ count: leadCount }, { count: projectCount }, { count: draftCount }, { count: mediaCount }, { data: events }] = await Promise.all([
    supabase.from("leads").select("id", { count: "exact", head: true }),
    supabase.from("projects").select("id", { count: "exact", head: true }).eq("published", true),
    supabase.from("projects").select("id", { count: "exact", head: true }).eq("published", false),
    supabase.from("media_assets").select("id", { count: "exact", head: true }).eq("status", "ready"),
    supabase
      .from("analytics_events")
      .select("event_name,page_path,target_path,session_id,created_at")
      .gte("created_at", fourteenDaysAgo.toISOString())
      .order("created_at", { ascending: false })
      .limit(3000),
  ]);
  const traffic = summarizeTraffic(events ?? [], sevenDaysAgo, fourteenDaysAgo);

  return (
    <main className="min-h-screen bg-warm-white text-ink">
      <AdminNav
        title="Control hub"
        description="Upload proof, shape project stories, publish safely, and keep a pulse on the website."
      />

      <section className="section-shell py-10">
        <div className="grid gap-4 md:grid-cols-4">
          <Metric label="Visits this week" note={`${traffic.growthLabel} vs last week`} value={traffic.thisWeekViews} />
          <Metric label="Unique visitors" note={`${traffic.revisitRate}% revisit rate`} value={traffic.uniqueVisitors} />
          <Metric label="CTA clicks" note="Tracked public calls to action" value={traffic.ctaClicks} />
          <Metric label="New leads" note="Total project inquiries" value={leadCount ?? 0} />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="border border-ink/12 bg-white p-6">
            <div className="flex items-center gap-3">
              <BarChart3 className="text-brand-red" size={24} />
              <h2 className="text-2xl font-black">What people are viewing</h2>
            </div>
            <div className="mt-6 grid gap-3">
              {traffic.topPages.length === 0 ? (
                <p className="text-sm font-bold text-steel">Traffic will appear here after visitors browse the site.</p>
              ) : null}
              {traffic.topPages.map((page) => (
                <div key={page.path} className="flex items-center justify-between border border-ink/10 bg-warm-white p-4">
                  <span className="font-bold text-ink">{page.path}</span>
                  <span className="text-sm font-black text-navy">{page.views} views</span>
                </div>
              ))}
            </div>
          </section>

          <section className="border border-ink/12 bg-white p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="text-brand-red" size={24} />
              <h2 className="text-2xl font-black">Content health</h2>
            </div>
            <div className="mt-6 grid gap-3">
              <HealthRow label="Published stories" value={projectCount ?? 0} />
              <HealthRow label="Draft stories" value={draftCount ?? 0} />
              <HealthRow label="Ready media" value={mediaCount ?? 0} />
            </div>
          </section>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-5">
          <HubCard
            copy="Add selected photos and short clips. The portal prepares images for website use."
            href="/admin/media"
            icon={<ImageIcon size={24} />}
            title="Upload Proof"
          />
          <HubCard
            copy="Create stories from a short summary, dropdowns, tags, and selected media."
            href="/admin/projects/new"
            icon={<PenLine size={24} />}
            title="Create Story"
          />
          <HubCard
            copy="Rearrange, publish, unpublish, or archive project proof as Grandvista grows."
            href="/admin/projects"
            icon={<Layers size={24} />}
            title="Manage Projects"
          />
          <HubCard
            copy="Choose homepage and page-level visuals without touching code or layout."
            href="/admin/website"
            icon={<PanelsTopLeft size={24} />}
            title="Website Sections"
          />
          <HubCard
            copy="Review incoming project conversations and qualify the next opportunity."
            href="/admin/leads"
            icon={<Inbox size={24} />}
            title="Review Leads"
          />
        </div>
      </section>
    </main>
  );
}

function Metric({ label, note, value }: { label: string; note: string; value: number }) {
  return (
    <div className="border border-ink/12 bg-white p-6">
      <p className="text-sm font-black uppercase tracking-[0.12em] text-steel">{label}</p>
      <p className="mt-3 text-4xl font-black text-navy">{value}</p>
      <p className="mt-2 text-sm font-bold text-steel">{note}</p>
    </div>
  );
}

function HealthRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between border border-ink/10 bg-warm-white p-4">
      <span className="font-bold text-steel">{label}</span>
      <span className="text-lg font-black text-navy">{value}</span>
    </div>
  );
}

function HubCard({
  copy,
  href,
  icon,
  title,
}: {
  copy: string;
  href: string;
  icon: ReactNode;
  title: string;
}) {
  return (
    <Link className="border border-ink/12 bg-white p-6 hover:border-brand-red" href={href}>
      <div className="text-brand-red">{icon}</div>
      <h2 className="mt-5 text-2xl font-black">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-steel">{copy}</p>
    </Link>
  );
}

type AnalyticsEvent = {
  event_name: "page_view" | "cta_click";
  page_path: string;
  target_path: string | null;
  session_id: string;
  created_at: string;
};

function summarizeTraffic(events: AnalyticsEvent[], sevenDaysAgo: Date, fourteenDaysAgo: Date) {
  const currentEvents = events.filter((event) => new Date(event.created_at) >= sevenDaysAgo);
  const previousEvents = events.filter((event) => {
    const createdAt = new Date(event.created_at);
    return createdAt >= fourteenDaysAgo && createdAt < sevenDaysAgo;
  });
  const currentPageViews = currentEvents.filter((event) => event.event_name === "page_view");
  const previousPageViews = previousEvents.filter((event) => event.event_name === "page_view");
  const uniqueSessions = new Set(currentPageViews.map((event) => event.session_id));
  const sessionsWithMultipleViews = Array.from(uniqueSessions).filter(
    (sessionId) => currentPageViews.filter((event) => event.session_id === sessionId).length > 1,
  ).length;
  const topPages = Object.entries(
    currentPageViews.reduce<Record<string, number>>((accumulator, event) => {
      const path = event.page_path.split("?")[0] || "/";
      accumulator[path] = (accumulator[path] ?? 0) + 1;
      return accumulator;
    }, {}),
  )
    .map(([path, views]) => ({ path, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);
  const growth = previousPageViews.length
    ? Math.round(((currentPageViews.length - previousPageViews.length) / previousPageViews.length) * 100)
    : currentPageViews.length > 0
      ? 100
      : 0;

  return {
    ctaClicks: currentEvents.filter((event) => event.event_name === "cta_click").length,
    growthLabel: `${growth >= 0 ? "+" : ""}${growth}%`,
    revisitRate: uniqueSessions.size ? Math.round((sessionsWithMultipleViews / uniqueSessions.size) * 100) : 0,
    thisWeekViews: currentPageViews.length,
    topPages,
    uniqueVisitors: uniqueSessions.size,
  };
}

function daysAgo(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() - days);
  return next;
}
