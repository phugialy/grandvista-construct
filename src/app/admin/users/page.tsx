import { Mail, Save, Shield, ToggleLeft, ToggleRight, Trash2, UserPlus } from "lucide-react";
import { AdminNav } from "@/components/admin/admin-nav";
import { getAdminSession, getAdminRoleLabel, requireMasterAdmin, type AdminRole } from "@/lib/admin-auth";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import {
  createAdminUser,
  deleteAdminUser,
  sendAdminReset,
  updateAdminActive,
  updateAdminRole,
} from "./actions";

type AdminProfile = {
  active: boolean;
  auth_user_id: string;
  created_at: string;
  email: string;
  role: AdminRole;
  updated_at: string;
};

const inputClass =
  "min-h-12 border border-ink/14 bg-white p-4 text-base text-ink outline-none transition placeholder:text-steel/70 focus:border-navy";

const statusMessages: Record<string, { tone: "good" | "warn"; text: string }> = {
  access_saved: { tone: "good", text: "Admin access updated." },
  created: { tone: "good", text: "Admin created and a password setup email was sent." },
  created_no_email: {
    tone: "warn",
    text: "Admin was created, but the setup email could not be sent. Try sending a reset email.",
  },
  deleted: { tone: "good", text: "Admin credential deleted." },
  email_error: { tone: "warn", text: "The reset email could not be sent. Check Supabase email limits or SMTP settings." },
  error: { tone: "warn", text: "Something failed while updating the admin account." },
  missing: { tone: "warn", text: "Required account information is missing." },
  reset_sent: { tone: "good", text: "Password reset email sent." },
  role_saved: { tone: "good", text: "Admin role updated." },
  self_protected: { tone: "warn", text: "You cannot change, deactivate, or delete your own master account here." },
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string }>;
}) {
  await requireMasterAdmin();

  const [params, session] = await Promise.all([searchParams, getAdminSession()]);
  const status = params?.status;
  const statusMessage = status ? statusMessages[status] : null;
  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("admin_profiles")
    .select("auth_user_id,email,role,active,created_at,updated_at")
    .order("created_at", { ascending: true });

  const admins = ((data ?? []) as AdminProfile[]).filter((admin) => admin.email);

  return (
    <main className="min-h-screen bg-warm-white text-ink">
      <AdminNav
        title="Admin Users"
        description="Create accounts, restore access, and control who can manage the website."
      />

      <section className="section-shell py-10">
        {statusMessage ? (
          <p
            className={`mb-6 border p-4 text-sm font-bold ${
              statusMessage.tone === "good"
                ? "border-navy/20 bg-white text-navy"
                : "border-brand-red/20 bg-white text-brand-red"
            }`}
          >
            {statusMessage.text}
          </p>
        ) : null}

        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="border border-ink/12 bg-white p-6">
            <div className="flex items-center gap-3">
              <UserPlus className="text-brand-red" size={22} />
              <p className="text-sm font-black uppercase tracking-[0.12em] text-brand-red">
                Invite-only access
              </p>
            </div>
            <h2 className="mt-3 text-3xl font-black leading-tight">Create a website admin</h2>
            <p className="mt-4 leading-7 text-steel">
              Add the team member here instead of sending them to Supabase. They will receive a
              password setup link and the site will open the correct workspace based on their role.
            </p>

            <form action={createAdminUser} className="mt-6 grid gap-4">
              <label className="grid gap-2">
                <span className="text-xs font-black uppercase tracking-[0.12em] text-steel">
                  Email address
                </span>
                <input
                  className={inputClass}
                  name="email"
                  placeholder="team@grandvista-construction.com"
                  required
                  type="email"
                />
              </label>
              <label className="grid gap-2">
                <span className="text-xs font-black uppercase tracking-[0.12em] text-steel">
                  Starting role
                </span>
                <select className={inputClass} defaultValue="web" name="role">
                  <option value="web">Web Admin</option>
                  <option value="master">Master Admin</option>
                </select>
              </label>
              <button
                className="bg-navy px-5 py-4 text-sm font-black uppercase tracking-[0.08em] text-white hover:bg-brand-red"
                type="submit"
              >
                Create + Send Setup Email
              </button>
            </form>
          </section>

          <section className="border border-ink/12 bg-white p-6">
            <div className="flex items-center gap-3">
              <Shield className="text-brand-red" size={22} />
              <p className="text-sm font-black uppercase tracking-[0.12em] text-brand-red">
                Current access
              </p>
            </div>
            <h2 className="mt-3 text-3xl font-black leading-tight">Manage account permissions</h2>
            <p className="mt-4 leading-7 text-steel">
              Master admins can create, reset, promote, deactivate, or delete admin credentials. Web
              admins can manage website content, but cannot manage other admin accounts.
            </p>

            {error ? (
              <div className="mt-6 border-l-4 border-brand-red bg-warm-white p-5">
                <p className="text-sm font-black uppercase tracking-[0.12em] text-brand-red">
                  Account table unavailable
                </p>
                <p className="mt-3 leading-7 text-steel">
                  The admin profile table could not be loaded. Check the Supabase admin_profiles
                  table and service role environment variable.
                </p>
              </div>
            ) : (
              <div className="mt-6 grid gap-4">
                {admins.length === 0 ? (
                  <div className="border border-ink/10 bg-warm-white p-5">
                    <p className="font-bold text-steel">No admin profiles found.</p>
                  </div>
                ) : null}

                {admins.map((admin) => {
                  const isSelf = admin.email.toLowerCase() === session?.email.toLowerCase();

                  return (
                    <article
                      className={`grid gap-4 border p-4 ${
                        admin.active ? "border-ink/12 bg-white" : "border-ink/8 bg-warm-white opacity-70"
                      }`}
                      key={admin.auth_user_id}
                    >
                      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="break-all font-black text-ink">{admin.email}</p>
                            {isSelf ? (
                              <span className="border border-navy/18 px-2 py-1 text-[0.6rem] font-black uppercase tracking-[0.1em] text-navy">
                                You
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-1 text-xs font-bold uppercase tracking-[0.1em] text-steel">
                            {getAdminRoleLabel(admin.role)} / {admin.active ? "Active" : "Inactive"}
                          </p>
                        </div>

                        <form action={sendAdminReset}>
                          <input name="email" type="hidden" value={admin.email} />
                          <button
                            className="inline-flex items-center gap-2 border border-ink/12 px-4 py-2 text-xs font-black uppercase tracking-[0.08em] hover:border-brand-red hover:text-brand-red"
                            type="submit"
                          >
                            <Mail size={14} />
                            Send Reset
                          </button>
                        </form>
                      </div>

                      <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
                        <form action={updateAdminRole} className="grid gap-2 md:grid-cols-[1fr_auto]">
                          <input name="authUserId" type="hidden" value={admin.auth_user_id} />
                          <select
                            className="min-h-11 border border-ink/14 bg-white px-3 text-sm font-bold text-ink outline-none focus:border-navy disabled:opacity-50"
                            defaultValue={admin.role}
                            disabled={isSelf}
                            name="role"
                          >
                            <option value="web">Web Admin</option>
                            <option value="master">Master Admin</option>
                          </select>
                          <button
                            className="flex min-h-11 items-center justify-center gap-2 border border-ink/12 px-4 text-xs font-black uppercase tracking-[0.08em] hover:border-brand-red hover:text-brand-red disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={isSelf}
                            type="submit"
                          >
                            <Save size={14} />
                            Save Role
                          </button>
                        </form>

                        <form action={updateAdminActive}>
                          <input name="authUserId" type="hidden" value={admin.auth_user_id} />
                          <input name="active" type="hidden" value={String(!admin.active)} />
                          <button
                            className="flex min-h-11 w-full items-center justify-center gap-2 border border-ink/12 px-4 text-xs font-black uppercase tracking-[0.08em] hover:border-brand-red hover:text-brand-red disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={isSelf}
                            type="submit"
                          >
                            {admin.active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                            {admin.active ? "Deactivate" : "Activate"}
                          </button>
                        </form>

                        <form action={deleteAdminUser}>
                          <input name="authUserId" type="hidden" value={admin.auth_user_id} />
                          <button
                            className="flex min-h-11 w-full items-center justify-center gap-2 border border-ink/12 px-4 text-xs font-black uppercase tracking-[0.08em] hover:border-brand-red hover:text-brand-red disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={isSelf}
                            type="submit"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </form>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
