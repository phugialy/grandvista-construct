import Link from "next/link";
import { logoutAdmin } from "@/app/admin/leads/actions";

export function AdminNav({ title, description }: { title: string; description: string }) {
  return (
    <section className="border-b border-ink/10 bg-ink text-white">
      <div className="section-shell flex flex-col justify-between gap-6 py-10 md:flex-row md:items-end">
        <div>
          <p className="eyebrow">Grandvista Admin</p>
          <h1 className="mt-3 text-4xl font-black leading-tight">{title}</h1>
          <p className="mt-3 text-white/66">{description}</p>
          <nav className="mt-6 flex flex-wrap gap-3 text-sm font-black uppercase tracking-[0.08em]">
            <Link className="border border-white/18 px-4 py-2 hover:border-brand-red" href="/admin">
              Hub
            </Link>
            <Link className="border border-white/18 px-4 py-2 hover:border-brand-red" href="/admin/leads">
              Leads
            </Link>
            <Link className="border border-white/18 px-4 py-2 hover:border-brand-red" href="/admin/media">
              Media
            </Link>
            <Link className="border border-white/18 px-4 py-2 hover:border-brand-red" href="/admin/website">
              Website
            </Link>
            <Link className="border border-white/18 px-4 py-2 hover:border-brand-red" href="/admin/projects">
              Projects
            </Link>
            <Link className="border border-white/18 px-4 py-2 hover:border-brand-red" href="/admin/projects/new">
              New Project
            </Link>
          </nav>
        </div>
        <form action={logoutAdmin}>
          <button className="border border-white/24 px-5 py-3 text-sm font-black uppercase tracking-[0.08em] text-white hover:border-brand-red hover:text-brand-red">
            Log Out
          </button>
        </form>
      </div>
    </section>
  );
}
