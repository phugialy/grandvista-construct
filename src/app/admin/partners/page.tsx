import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { AdminNav } from "@/components/admin/admin-nav";

type AdminPartner = {
  id: string;
  slug: string;
  name: string;
  trade_category: string | null;
  featured: boolean;
  published: boolean;
  updated_at: string;
};

export default async function AdminPartnersPage() {
  await requireAdmin();

  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("vendor_partners")
    .select("id,slug,name,trade_category,featured,published,updated_at")
    .order("sort_order", { ascending: true });

  const partners = (data ?? []) as AdminPartner[];
  const published = partners.filter((partner) => partner.published).length;
  const drafts = partners.filter((partner) => !partner.published).length;

  return (
    <main className="min-h-screen bg-warm-white text-ink">
      <AdminNav title="Partners" description="Manage vendors and trade partners shown across the site." />

      <section className="section-shell py-10">
        <div className="grid gap-4 md:grid-cols-2">
          <Metric label="Published" value={published} />
          <Metric label="Draft" value={drafts} />
        </div>

        <div className="mt-8 flex justify-end">
          <Link
            className="bg-navy px-5 py-3 text-sm font-black uppercase tracking-[0.08em] text-white hover:bg-brand-red"
            href="/admin/partners/new"
          >
            New Partner
          </Link>
        </div>

        {error ? (
          <p className="mt-8 border border-brand-red/30 bg-white p-5 font-bold text-brand-red">
            Unable to load partners right now.
          </p>
        ) : null}

        <div className="mt-6 grid gap-4">
          {partners.length === 0 ? (
            <article className="border border-ink/12 bg-white p-8">
              <h2 className="text-2xl font-black">No partners yet</h2>
              <p className="mt-3 text-steel">Add the first vendor or trade partner.</p>
            </article>
          ) : null}

          {partners.map((partner) => (
            <article key={partner.id} className="border border-ink/12 bg-white p-6">
              <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-brand-red">
                    {partner.trade_category || "Partner"}
                  </p>
                  <h2 className="mt-2 text-2xl font-black">{partner.name}</h2>
                  <p className="mt-2 text-sm font-bold text-steel">
                    {partner.published ? "Published" : "Draft"}
                    {partner.featured ? " · Featured on homepage" : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  {partner.published ? (
                    <Link
                      className="border border-ink/14 px-4 py-3 text-sm font-black uppercase tracking-[0.08em] text-ink hover:border-brand-red hover:text-brand-red"
                      href="/partners"
                      target="_blank"
                    >
                      View
                    </Link>
                  ) : null}
                  <Link
                    className="bg-navy px-4 py-3 text-sm font-black uppercase tracking-[0.08em] text-white hover:bg-brand-red"
                    href={`/admin/partners/${partner.id}`}
                  >
                    Manage
                  </Link>
                </div>
              </div>
            </article>
          ))}
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
