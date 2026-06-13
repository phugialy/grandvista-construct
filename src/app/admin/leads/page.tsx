import { requireAdmin } from "@/lib/admin-auth";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { AdminNav } from "@/components/admin/admin-nav";
import { updateLeadStatus } from "./actions";

type Lead = {
  id: string;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  project_location: string | null;
  project_type: string | null;
  construction_context: string | null;
  estimated_timeline: string | null;
  estimated_budget_range: string | null;
  current_stage: string | null;
  architect_involved: string | null;
  permit_status: string | null;
  description: string | null;
  status: string;
  created_at: string;
};

const statuses = [
  { label: "New", value: "new" },
  { label: "Reviewing", value: "reviewing" },
  { label: "Qualified", value: "qualified" },
  { label: "Followed Up", value: "followed_up" },
  { label: "Archived", value: "archived" },
];

export default async function AdminLeadsPage() {
  await requireAdmin();

  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("leads")
    .select(
      "id,name,company,email,phone,project_location,project_type,construction_context,estimated_timeline,estimated_budget_range,current_stage,architect_involved,permit_status,description,status,created_at",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  const leads = (data ?? []) as Lead[];
  const activeLeads = leads.filter((lead) => lead.status !== "archived").length;
  const newLeads = leads.filter((lead) => lead.status === "new").length;
  const qualifiedLeads = leads.filter((lead) => lead.status === "qualified").length;

  return (
    <main className="min-h-screen bg-warm-white text-ink">
      <AdminNav
        title="Project inquiries"
        description="Review incoming project conversations and track follow-up status."
      />

      <section className="section-shell py-10">
        <div className="grid gap-4 md:grid-cols-3">
          <AdminMetric label="Active leads" value={activeLeads} />
          <AdminMetric label="New" value={newLeads} />
          <AdminMetric label="Qualified" value={qualifiedLeads} />
        </div>

        {error ? (
          <p className="mt-8 border border-brand-red/30 bg-white p-5 font-bold text-brand-red">
            Unable to load leads right now.
          </p>
        ) : null}

        <div className="mt-8 grid gap-5">
          {leads.length === 0 ? (
            <div className="border border-ink/12 bg-white p-8">
              <h2 className="text-2xl font-black">No inquiries yet</h2>
              <p className="mt-3 text-steel">
                New submissions from the Start a Project form will appear here.
              </p>
            </div>
          ) : null}

          {leads.map((lead) => (
            <article key={lead.id} className="border border-ink/12 bg-white p-6">
              <div className="flex flex-col justify-between gap-5 lg:flex-row">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-brand-red">
                    {formatDate(lead.created_at)}
                  </p>
                  <h2 className="mt-2 text-2xl font-black">{lead.name}</h2>
                  <p className="mt-1 text-steel">
                    {[lead.company, lead.project_type, lead.project_location].filter(Boolean).join(" / ")}
                  </p>
                </div>
                <form action={updateLeadStatus} className="flex h-fit gap-2">
                  <input name="lead_id" type="hidden" value={lead.id} />
                  <select
                    className="border border-ink/14 bg-white px-3 py-2 text-sm font-bold"
                    defaultValue={lead.status}
                    name="status"
                  >
                    {statuses.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                  <button className="bg-navy px-4 py-2 text-sm font-black text-white hover:bg-brand-red">
                    Save
                  </button>
                </form>
              </div>
              <p className="mt-5 inline-flex border border-ink/10 bg-warm-white px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-navy">
                Status: {statusLabel(lead.status)}
              </p>

              <dl className="mt-6 grid gap-4 text-sm md:grid-cols-3">
                <LeadField label="Email" value={lead.email} />
                <LeadField label="Phone" value={lead.phone} />
                <LeadField label="Timeline" value={lead.estimated_timeline} />
                <LeadField label="Budget" value={lead.estimated_budget_range} />
                <LeadField label="Stage" value={lead.current_stage} />
                <LeadField label="Context" value={lead.construction_context} />
                <LeadField label="Architect" value={lead.architect_involved} />
                <LeadField label="Permit" value={lead.permit_status} />
              </dl>

              {lead.description ? (
                <div className="mt-6 border-l-4 border-navy bg-warm-white p-5">
                  <p className="text-sm font-black uppercase tracking-[0.12em] text-navy">
                    Project Description
                  </p>
                  <p className="mt-3 leading-7 text-steel">{lead.description}</p>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function AdminMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-ink/12 bg-white p-6">
      <p className="text-sm font-black uppercase tracking-[0.12em] text-steel">{label}</p>
      <p className="mt-3 text-4xl font-black text-navy">{value}</p>
    </div>
  );
}

function LeadField({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="font-black uppercase tracking-[0.1em] text-steel">{label}</dt>
      <dd className="mt-1 font-semibold text-ink">{value || "Not provided"}</dd>
    </div>
  );
}

function statusLabel(status: string) {
  return statuses.find((item) => item.value === status)?.label ?? status;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
