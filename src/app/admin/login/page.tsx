import { loginAdmin } from "./actions";
import { AdminLoginForm } from "./admin-login-form";

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
            Internal access for the people managing Grandvista online.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/68">
            Sign in with a named internal account. The portal recognizes the role behind the
            account and opens the right workspace automatically.
          </p>
        </div>

        <AdminLoginForm action={loginAdmin} status={status} />
      </section>
    </main>
  );
}
