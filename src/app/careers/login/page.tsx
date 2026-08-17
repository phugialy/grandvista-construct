import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { loginCandidate } from "./actions";

export const metadata: Metadata = {
  title: "Sign In | Grandvista Careers",
  robots: { index: false },
};

const statusMessages: Record<string, string> = {
  missing: "Enter your email and password.",
  invalid: "That email and password don't match an account on file.",
};

type PageProps = {
  searchParams: Promise<{ status?: string; next?: string }>;
};

export default function CandidateLoginPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={null}>
      <CandidateLoginContent searchParams={searchParams} />
    </Suspense>
  );
}

async function CandidateLoginContent({ searchParams }: PageProps) {
  await connection();
  const { status, next } = await searchParams;
  const message = status ? statusMessages[status] : null;
  const nextPath = next ?? "/careers/applications";
  const signupHref = `/careers/signup${next ? `?next=${encodeURIComponent(next)}` : ""}`;

  return (
    <MarketingShell>
      <section className="section-shell grid min-h-[70vh] place-items-center py-16">
        <div className="w-full max-w-md border border-ink/12 bg-white p-8">
          <p className="eyebrow">Sign In</p>
          <h1 className="mt-4 text-3xl font-black leading-tight">Check your applications</h1>
          <p className="mt-4 leading-7 text-steel">Sign in with the email and password from your account.</p>
          {message ? (
            <p className="mt-5 border border-brand-red/30 bg-brand-red/8 p-4 text-sm font-bold text-brand-red">
              {message}
            </p>
          ) : null}
          <form action={loginCandidate} className="mt-6 grid gap-4">
            <input name="next" type="hidden" value={nextPath} />
            <label className="grid gap-2 font-bold">
              Email
              <input
                className="min-h-12 border border-ink/14 bg-white p-4 text-base text-ink outline-none focus:border-navy"
                name="email"
                required
                type="email"
              />
            </label>
            <label className="grid gap-2 font-bold">
              Password
              <input
                className="min-h-12 border border-ink/14 bg-white p-4 text-base text-ink outline-none focus:border-navy"
                name="password"
                required
                type="password"
              />
            </label>
            <button
              className="mt-2 bg-navy px-6 py-4 text-sm font-black uppercase tracking-[0.08em] text-white hover:bg-brand-red"
              type="submit"
            >
              Sign In
            </button>
          </form>
          <p className="mt-5 text-center text-sm font-bold text-steel">
            Forgot your password?{" "}
            <Link className="font-black text-navy hover:text-brand-red" href="/careers/forgot-password">
              Reset it
            </Link>
          </p>
          <p className="mt-5 border-t border-ink/10 pt-5 text-center text-sm font-bold text-steel">
            New here?{" "}
            <Link className="font-black text-navy hover:text-brand-red" href={signupHref}>
              Create an account
            </Link>
          </p>
        </div>
      </section>
    </MarketingShell>
  );
}
