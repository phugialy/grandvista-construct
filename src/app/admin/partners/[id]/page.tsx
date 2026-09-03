import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { AdminNav } from "@/components/admin/admin-nav";
import { PartnerForm } from "@/components/admin/partner-form";

type Params = {
  id: string;
};

export default async function EditPartnerPage({ params }: { params: Promise<Params> }) {
  await requireAdmin();

  const { id } = await params;
  const supabase = getSupabaseServiceClient();
  const { data: partner, error } = await supabase
    .from("vendor_partners")
    .select("id,slug,name,trade_category,website_url,blurb,logo_url,featured,published,sort_order")
    .eq("id", id)
    .single();

  if (error || !partner) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-warm-white text-ink">
      <AdminNav title="Edit partner" description="Update this partner's details." />
      <section className="section-shell py-10">
        <PartnerForm partner={partner} />
      </section>
    </main>
  );
}
