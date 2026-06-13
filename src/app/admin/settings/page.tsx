import { Mail, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";
import { requireAdmin } from "@/lib/admin-auth";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { AdminNav } from "@/components/admin/admin-nav";
import { addRecipient, deleteRecipient, toggleRecipient } from "./actions";

type Recipient = {
  id: string;
  email: string;
  name: string | null;
  active: boolean;
  created_at: string;
};

const inputClass =
  "min-h-12 border border-ink/14 bg-white p-4 text-base text-ink outline-none transition placeholder:text-steel/70 focus:border-navy";

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string }>;
}) {
  await requireAdmin();

  const params = await searchParams;
  const status = params?.status;

  const supabase = getSupabaseServiceClient();
  const { data: recipients, error: tableError } = await supabase
    .from("notification_recipients")
    .select("id,email,name,active,created_at")
    .order("created_at", { ascending: true });

  const typedRecipients = (recipients ?? []) as Recipient[];
  const fromAddress = process.env.LEAD_NOTIFY_FROM?.trim() ?? "noreply@grandvista-construction.com";
  const fallbackEmail = process.env.LEAD_NOTIFY_EMAIL?.trim();
  const tableReady = !tableError;

  return (
    <main className="min-h-screen bg-warm-white text-ink">
      <AdminNav
        title="Settings"
        description="Manage lead notification recipients and system configuration."
      />

      <section className="section-shell py-10">
        {status === "added" ? (
          <p className="mb-6 border border-navy/20 bg-white p-4 text-sm font-bold text-navy">
            Recipient added.
          </p>
        ) : status === "saved" ? (
          <p className="mb-6 border border-navy/20 bg-white p-4 text-sm font-bold text-navy">
            Recipient updated.
          </p>
        ) : status === "deleted" ? (
          <p className="mb-6 border border-navy/20 bg-white p-4 text-sm font-bold text-navy">
            Recipient removed.
          </p>
        ) : status === "duplicate" ? (
          <p className="mb-6 border border-brand-red/20 bg-white p-4 text-sm font-bold text-brand-red">
            That email is already in the list.
          </p>
        ) : status === "missing" ? (
          <p className="mb-6 border border-brand-red/20 bg-white p-4 text-sm font-bold text-brand-red">
            Email address is required.
          </p>
        ) : null}

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="grid gap-6">
            <section className="border border-ink/12 bg-white p-6">
              <div className="flex items-center gap-3">
                <Mail className="text-brand-red" size={22} />
                <p className="text-sm font-black uppercase tracking-[0.12em] text-brand-red">
                  Lead notification recipients
                </p>
              </div>
              <h2 className="mt-3 text-3xl font-black leading-tight">
                Who receives project inquiries
              </h2>
              <p className="mt-4 leading-7 text-steel">
                When a project inquiry or company message is submitted, a notification goes to every
                active recipient below. Customer confirmation emails are sent separately to the
                person who submitted the form.
              </p>

              {!tableReady ? (
                <div className="mt-6 border-l-4 border-brand-red bg-warm-white p-5">
                  <p className="text-sm font-black uppercase tracking-[0.12em] text-brand-red">
                    Migration pending
                  </p>
                  <p className="mt-3 leading-7 text-steel">
                    The notification recipients table has not been applied yet. Run the SQL in{" "}
                    <code className="bg-ink/8 px-2 py-1 text-xs">
                      supabase/migrations/20260609000002_notification_recipients.sql
                    </code>{" "}
                    in your Supabase dashboard SQL editor to activate this feature.
                  </p>
                  {fallbackEmail ? (
                    <p className="mt-3 text-sm font-bold text-steel">
                      Currently falling back to <strong>{fallbackEmail}</strong> from the{" "}
                      <code className="bg-ink/8 px-1">LEAD_NOTIFY_EMAIL</code> environment variable.
                    </p>
                  ) : null}
                </div>
              ) : (
                <>
                  <div className="mt-6 grid gap-4">
                    {typedRecipients.length === 0 ? (
                      <div className="border border-ink/10 bg-warm-white p-5">
                        <p className="font-bold text-steel">
                          No recipients configured.
                          {fallbackEmail ? (
                            <span>
                              {" "}
                              Notifications are going to{" "}
                              <strong>{fallbackEmail}</strong> from the{" "}
                              <code className="bg-ink/8 px-1 text-xs">LEAD_NOTIFY_EMAIL</code> env
                              var.
                            </span>
                          ) : (
                            <span> Add at least one email to receive lead notifications.</span>
                          )}
                        </p>
                      </div>
                    ) : null}

                    {typedRecipients.map((recipient) => (
                      <article
                        key={recipient.id}
                        className={`flex items-center justify-between gap-4 border p-4 ${
                          recipient.active
                            ? "border-ink/12 bg-white"
                            : "border-ink/8 bg-warm-white opacity-60"
                        }`}
                      >
                        <div className="min-w-0">
                          {recipient.name ? (
                            <p className="font-black text-ink">{recipient.name}</p>
                          ) : null}
                          <p className={`text-sm font-bold ${recipient.name ? "text-steel" : "font-black text-ink"}`}>
                            {recipient.email}
                          </p>
                          <p className="mt-1 text-xs font-bold uppercase tracking-[0.1em] text-steel">
                            {recipient.active ? "Active" : "Inactive"}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <form action={toggleRecipient}>
                            <input name="id" type="hidden" value={recipient.id} />
                            <input name="active" type="hidden" value={String(!recipient.active)} />
                            <button
                              className="flex h-10 w-10 items-center justify-center border border-ink/12 text-ink hover:border-brand-red hover:text-brand-red"
                              title={recipient.active ? "Deactivate" : "Activate"}
                              type="submit"
                            >
                              {recipient.active ? (
                                <ToggleRight size={18} />
                              ) : (
                                <ToggleLeft size={18} />
                              )}
                            </button>
                          </form>
                          <form action={deleteRecipient}>
                            <input name="id" type="hidden" value={recipient.id} />
                            <button
                              className="flex h-10 w-10 items-center justify-center border border-ink/12 text-ink hover:border-brand-red hover:text-brand-red"
                              title="Remove recipient"
                              type="submit"
                            >
                              <Trash2 size={16} />
                            </button>
                          </form>
                        </div>
                      </article>
                    ))}
                  </div>

                  <form action={addRecipient} className="mt-6 grid gap-4 border-t border-ink/10 pt-6">
                    <p className="text-sm font-black uppercase tracking-[0.12em] text-steel">
                      Add recipient
                    </p>
                    <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
                      <input
                        className={inputClass}
                        name="email"
                        placeholder="Email address"
                        required
                        type="email"
                      />
                      <input
                        className={inputClass}
                        name="name"
                        placeholder="Display name (optional)"
                      />
                      <button
                        className="bg-navy px-5 py-3 text-sm font-black uppercase tracking-[0.08em] text-white hover:bg-brand-red"
                        type="submit"
                      >
                        Add
                      </button>
                    </div>
                  </form>
                </>
              )}
            </section>
          </div>

          <aside className="grid content-start gap-6">
            <section className="border border-ink/12 bg-white p-6">
              <p className="text-sm font-black uppercase tracking-[0.12em] text-brand-red">
                From address
              </p>
              <p className="mt-3 text-lg font-black leading-snug break-all">{fromAddress}</p>
              <p className="mt-3 leading-7 text-steel">
                All outgoing emails are sent from this address. Configured via the{" "}
                <code className="bg-ink/8 px-1 text-xs">LEAD_NOTIFY_FROM</code> environment
                variable in Vercel.
              </p>
            </section>

            {fallbackEmail ? (
              <section className="border border-ink/12 bg-white p-6">
                <p className="text-sm font-black uppercase tracking-[0.12em] text-brand-red">
                  Fallback email
                </p>
                <p className="mt-3 font-bold break-all">{fallbackEmail}</p>
                <p className="mt-3 leading-7 text-steel">
                  Used when no active recipients are configured. Set via{" "}
                  <code className="bg-ink/8 px-1 text-xs">LEAD_NOTIFY_EMAIL</code> in Vercel.
                </p>
              </section>
            ) : null}
          </aside>
        </div>
      </section>
    </main>
  );
}
