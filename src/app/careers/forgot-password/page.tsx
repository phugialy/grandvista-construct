import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { requestCandidatePasswordReset } from "./actions";

export const metadata: Metadata = {
  title: "Reset Password | Grandvista Careers",
  robots: { index: false },
};

const statusMessages: Record<string, { tone: "neutral" | "success"; text: string }> = {
  missing: { tone: "neutral", text: "Enter the email on your account." },
  sent: {
    tone: "success",
    text: "If that email has an account, a reset link is on its way. Check your inbox.",
  },
};

type PageProps = {
  searchParams: Promise<{ status?: string }>;
};

export default function ForgotPasswordPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={null}>
      <ForgotPasswordContent searchParams={searchParams} />
    </Suspense>
  );
}

async function ForgotPasswordContent({ searchParams }: PageProps) {
  await connection();
  const { status } = await searchParams;
  const message = status ? statusMessages[status] : null;

  return (
    <MarketingShell>
      <section className="section-shell grid min-h-[70vh] place-items-center py-16">
        <div className="w-full max-w-md border border-ink/12 bg-white p-8">
          <p className="eyebrow">Reset Password</p>
          <h1 className="mt-4 text-3xl font-black leading-tight">Get back into your account</h1>
          <p className="mt-4 leading-7 text-steel">
            Enter your email and we&apos;ll send a link to set a new password.
          </p>
          {message ? (
            <p
              className={`mt-5 border p-4 text-sm font-bold ${
                message.tone === "success"
                  ? "border-navy/20 bg-navy/5 text-navy"
                  : "border-brand-red/30 bg-brand-red/8 text-brand-red"
              }`}
            >
              {message.text}
            </p>
          ) : null}
          <form action={requestCandidatePasswordReset} className="mt-6 grid gap-4">
            <label className="grid gap-2 font-bold">
              Email
              <input
                className="min-h-12 border border-ink/14 bg-white p-4 text-base text-ink outline-none focus:border-navy"
                name="email"
                required
                type="email"
              />
            </label>
            <button
              className="mt-2 bg-navy px-6 py-4 text-sm font-black uppercase tracking-[0.08em] text-white hover:bg-brand-red"
              type="submit"
            >
              Send Reset Link
            </button>
          </form>
          <p className="mt-5 text-center text-sm font-bold text-steel">
            <Link className="font-black text-navy hover:text-brand-red" href="/careers/login">
              Back to Sign In
            </Link>
          </p>
        </div>
      </section>
    </MarketingShell>
  );
}
