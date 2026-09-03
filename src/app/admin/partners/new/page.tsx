import { requireAdmin } from "@/lib/admin-auth";
import { AdminNav } from "@/components/admin/admin-nav";
import { PartnerForm } from "@/components/admin/partner-form";

export default async function NewPartnerPage() {
  await requireAdmin();

  return (
    <main className="min-h-screen bg-warm-white text-ink">
      <AdminNav title="New partner" description="Add a vendor or trade partner." />
      <section className="section-shell py-10">
        <PartnerForm />
      </section>
    </main>
  );
}
