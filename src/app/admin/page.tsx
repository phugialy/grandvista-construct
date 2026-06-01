import Link from "next/link";
import type { ReactNode } from "react";
import { ImageIcon, Inbox, Layers, PanelsTopLeft, PenLine } from "lucide-react";
import { requireAdmin } from "@/lib/admin-auth";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { AdminNav } from "@/components/admin/admin-nav";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  await requireAdmin();

  const supabase = getSupabaseServiceClient();
  const [{ count: leadCount }, { count: projectCount }, { count: draftCount }, { count: mediaCount }] = await Promise.all([
    supabase.from("leads").select("id", { count: "exact", head: true }),
    supabase.from("projects").select("id", { count: "exact", head: true }).eq("published", true),
    supabase.from("projects").select("id", { count: "exact", head: true }).eq("published", false),
    supabase.from("media_assets").select("id", { count: "exact", head: true }).eq("status", "ready"),
  ]);

  return (
    <main className="min-h-screen bg-warm-white text-ink">
      <AdminNav
        title="Control hub"
        description="Upload proof, shape project stories, publish safely, and keep a pulse on the website."
      />

      <section className="section-shell py-10">
        <div className="grid gap-4 md:grid-cols-4">
          <Metric label="Leads" value={leadCount ?? 0} />
          <Metric label="Published stories" value={projectCount ?? 0} />
          <Metric label="Draft stories" value={draftCount ?? 0} />
          <Metric label="Ready media" value={mediaCount ?? 0} />
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-4">
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

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-ink/12 bg-white p-6">
      <p className="text-sm font-black uppercase tracking-[0.12em] text-steel">{label}</p>
      <p className="mt-3 text-4xl font-black text-navy">{value}</p>
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
