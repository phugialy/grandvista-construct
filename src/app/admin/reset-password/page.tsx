import { ResetPasswordForm } from "./reset-password-form";

export default function AdminResetPasswordPage() {
  return (
    <main className="min-h-screen bg-ink text-white">
      <section className="section-shell grid min-h-screen gap-10 py-20 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="eyebrow">Grandvista Admin</p>
          <h1 className="mt-5 max-w-3xl text-5xl font-black leading-tight">
            Reset access for a Supabase Auth account.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/68">
            Use this page from a Supabase password recovery email. The link must open on the
            Grandvista domain so the recovery token can be used safely.
          </p>
        </div>

        <ResetPasswordForm />
      </section>
    </main>
  );
}
