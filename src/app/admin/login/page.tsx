import { loginAdmin } from "./actions";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string; role?: string }>;
}) {
  const { status, role } = searchParams ? await searchParams : {};
  const selectedRole = role === "master" ? "master" : "web";

  return (
    <main className="min-h-screen bg-ink text-white">
      <section className="section-shell grid min-h-screen gap-10 py-20 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="eyebrow">Grandvista Admin</p>
          <h1 className="mt-5 max-w-3xl text-5xl font-black leading-tight">
            Internal access for the people managing Grandvista online.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/68">
            Sign in with a named internal account. Master admin is for owner-level control;
            web admin is for media, project stories, and website updates.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {["Master Admin", "Web Admin"].map((item) => (
              <div key={item} className="border border-white/14 p-4 text-sm font-black uppercase tracking-[0.08em]">
                {item}
              </div>
            ))}
          </div>
        </div>

        <form action={loginAdmin} className="w-full border border-white/14 bg-white p-8 text-ink">
          <p className="text-sm font-black uppercase tracking-[0.14em] text-brand-red">Secure Access</p>
          <h2 className="mt-4 text-4xl font-black leading-tight">Sign in to an internal portal</h2>
          <p className="mt-4 leading-7 text-steel">
            Use the account assigned to your lane. Registration stays closed unless a master admin creates the access.
          </p>
          {status === "invalid" ? (
            <p className="mt-6 border border-brand-red/30 bg-brand-red/8 p-4 text-sm font-bold text-brand-red">
              The username or password did not match {selectedRole === "master" ? "master admin" : "web admin"} access.
            </p>
          ) : null}
          <input
            className="mt-8 w-full border border-ink/14 p-4 outline-none focus:border-navy"
            autoComplete="username"
            name="username"
            placeholder="Username"
            required
            type="text"
          />
          <input
            className="mt-3 w-full border border-ink/14 p-4 outline-none focus:border-navy"
            autoComplete="current-password"
            name="password"
            placeholder="Password"
            required
            type="password"
          />
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <button
              className="border border-ink/12 bg-warm-white p-5 text-left transition hover:border-brand-red hover:bg-white"
              name="admin_role"
              type="submit"
              value="master"
            >
              <span className="text-xs font-black uppercase tracking-[0.14em] text-brand-red">
                Master
              </span>
              <span className="mt-3 block text-2xl font-black leading-tight">Master Admin</span>
              <span className="mt-3 block text-sm font-bold leading-6 text-steel">
                Owner-level access for leads, metrics, settings, and future user controls.
              </span>
            </button>
            <button
              className="border border-ink/12 bg-navy p-5 text-left text-white transition hover:border-brand-red hover:bg-brand-red"
              name="admin_role"
              type="submit"
              value="web"
            >
              <span className="text-xs font-black uppercase tracking-[0.14em] text-white/70">
                Website
              </span>
              <span className="mt-3 block text-2xl font-black leading-tight">Web Admin</span>
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
