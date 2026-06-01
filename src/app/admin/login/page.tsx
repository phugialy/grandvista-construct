import { loginAdmin } from "./actions";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string }>;
}) {
  const { status } = searchParams ? await searchParams : {};

  return (
    <main className="min-h-screen bg-ink text-white">
      <section className="section-shell grid min-h-screen gap-10 py-20 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="eyebrow">Grandvista Admin</p>
          <h1 className="mt-5 max-w-3xl text-5xl font-black leading-tight">
            Lead dashboard access for project conversations.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/68">
            The admin area is intentionally practical: review inquiries, understand project context,
            and track follow-up status without distracting from the work.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {["Review", "Qualify", "Follow up"].map((item) => (
              <div key={item} className="border border-white/14 p-4 text-sm font-black uppercase tracking-[0.08em]">
                {item}
              </div>
            ))}
          </div>
        </div>

        <form action={loginAdmin} className="w-full border border-white/14 bg-white p-8 text-ink">
          <p className="text-sm font-black uppercase tracking-[0.14em] text-brand-red">Secure Access</p>
          <h2 className="mt-4 text-4xl font-black leading-tight">Open the dashboard</h2>
          <p className="mt-4 leading-7 text-steel">Enter the admin access token to review project inquiries.</p>
          {status === "invalid" ? (
            <p className="mt-6 border border-brand-red/30 bg-brand-red/8 p-4 text-sm font-bold text-brand-red">
              The access token did not match.
            </p>
          ) : null}
          <input
            className="mt-8 w-full border border-ink/14 p-4 outline-none focus:border-navy"
            name="access_token"
            placeholder="Access token"
            required
            type="password"
          />
          <button
            className="mt-4 w-full bg-navy px-6 py-4 text-sm font-black uppercase tracking-[0.08em] text-white hover:bg-brand-red"
            type="submit"
          >
            Open Dashboard
          </button>
        </form>
      </section>
    </main>
  );
}
