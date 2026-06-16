import { loginAdmin } from "./actions";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string; role?: string }>;
}) {
  const { status, role } = searchParams ? await searchParams : {};
  const selectedRole = role === "owner" ? "owner" : "management";

  return (
    <main className="min-h-screen bg-ink text-white">
      <section className="section-shell grid min-h-screen gap-10 py-20 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="eyebrow">Grandvista Admin</p>
          <h1 className="mt-5 max-w-3xl text-5xl font-black leading-tight">
            Lead dashboard access for project conversations.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/68">
            Choose the internal lane first. Owner access focuses on business pulse and inquiries;
            management web control focuses on media, project stories, and website updates.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {["Owner", "Management Web Control"].map((item) => (
              <div key={item} className="border border-white/14 p-4 text-sm font-black uppercase tracking-[0.08em]">
                {item}
              </div>
            ))}
          </div>
        </div>

        <form action={loginAdmin} className="w-full border border-white/14 bg-white p-8 text-ink">
          <p className="text-sm font-black uppercase tracking-[0.14em] text-brand-red">Secure Access</p>
          <h2 className="mt-4 text-4xl font-black leading-tight">Open an internal portal</h2>
          <p className="mt-4 leading-7 text-steel">
            Enter the access token, then choose the lane you need for this session.
          </p>
          {status === "invalid" ? (
            <p className="mt-6 border border-brand-red/30 bg-brand-red/8 p-4 text-sm font-bold text-brand-red">
              The access token did not match {selectedRole === "owner" ? "owner" : "management"} access.
            </p>
          ) : null}
          <input
            className="mt-8 w-full border border-ink/14 p-4 outline-none focus:border-navy"
            name="access_token"
            placeholder="Access token"
            required
            type="password"
          />
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <button
              className="border border-ink/12 bg-warm-white p-5 text-left transition hover:border-brand-red hover:bg-white"
              name="admin_role"
              type="submit"
              value="owner"
            >
              <span className="text-xs font-black uppercase tracking-[0.14em] text-brand-red">
                Owner
              </span>
              <span className="mt-3 block text-2xl font-black leading-tight">Business Pulse</span>
              <span className="mt-3 block text-sm font-bold leading-6 text-steel">
                Leads, metrics, follow-up visibility, and company-level controls.
              </span>
            </button>
            <button
              className="border border-ink/12 bg-navy p-5 text-left text-white transition hover:border-brand-red hover:bg-brand-red"
              name="admin_role"
              type="submit"
              value="management"
            >
              <span className="text-xs font-black uppercase tracking-[0.14em] text-white/70">
                Management
              </span>
              <span className="mt-3 block text-2xl font-black leading-tight">Web Control</span>
              <span className="mt-3 block text-sm font-bold leading-6 text-white/70">
                Media, page placements, project stories, and content publishing.
              </span>
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
