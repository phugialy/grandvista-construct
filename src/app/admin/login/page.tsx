import { loginAdmin } from "./actions";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string }>;
}) {
  const { status } = searchParams ? await searchParams : {};

  return (
    <main className="min-h-screen bg-ink text-white">
      <section className="section-shell flex min-h-screen items-center py-20">
        <form action={loginAdmin} className="w-full max-w-xl border border-white/14 bg-white p-8 text-ink">
          <p className="eyebrow">Grandvista Admin</p>
          <h1 className="mt-4 text-4xl font-black leading-tight">Lead dashboard access</h1>
          <p className="mt-4 leading-7 text-steel">
            Enter the admin access token to review project inquiries.
          </p>
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
