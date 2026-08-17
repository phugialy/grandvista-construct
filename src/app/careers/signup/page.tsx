import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { signupCandidate } from "./actions";

export const metadata: Metadata = {
  title: "Create an Account | Grandvista Careers",
  robots: { index: false },
};

const statusMessages: Record<string, string> = {
  missing: "Fill in your name, email, and password to continue.",
  email_taken: "An account already exists for that email — sign in instead.",
  bad_file_type: "Resumes need to be a PDF, DOC, or DOCX file.",
  file_too_large: "That resume is too large — keep it under 8MB.",
  signup_failed: "We couldn't create your account. Try again.",
  profile_failed: "We couldn't finish setting up your profile. Try again.",
};

type PageProps = {
  searchParams: Promise<{ status?: string; next?: string }>;
};

export default function CandidateSignupPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={null}>
      <CandidateSignupContent searchParams={searchParams} />
    </Suspense>
  );
}

async function CandidateSignupContent({ searchParams }: PageProps) {
  await connection();
  const { status, next } = await searchParams;
  const message = status ? statusMessages[status] : null;
  const nextPath = next ?? "/careers/applications";
  const loginHref = `/careers/login${next ? `?next=${encodeURIComponent(next)}` : ""}`;

  return (
    <MarketingShell>
      <section className="section-shell grid min-h-[70vh] place-items-center py-16">
        <div className="w-full max-w-md border border-ink/12 bg-white p-8">
          <p className="eyebrow">Create Your Account</p>
          <h1 className="mt-4 text-3xl font-black leading-tight">Set up your candidate profile</h1>
          <p className="mt-4 leading-7 text-steel">
            One account works for every role you apply to &mdash; no need to re-enter your info next time.
          </p>
          {message ? (
            <p className="mt-5 border border-brand-red/30 bg-brand-red/8 p-4 text-sm font-bold text-brand-red">
              {message}
            </p>
          ) : null}
          <form action={signupCandidate} className="mt-6 grid gap-4" encType="multipart/form-data">
            <input name="next" type="hidden" value={nextPath} />
            <Field label="Name" name="name" required type="text" />
            <Field label="Email" name="email" required type="email" />
            <Field label="Password" name="password" required type="password" />
            <Field label="Phone" name="phone" type="tel" />
            <label className="grid gap-2 font-bold">
              Resume
              <span className="text-xs font-normal text-steel">
                PDF, DOC, or DOCX, up to 8MB. Optional now &mdash; needed before your first application.
              </span>
              <input
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="border border-ink/14 bg-white p-3 text-sm text-ink outline-none focus:border-navy"
                name="resume"
                type="file"
              />
            </label>
            <button
              className="mt-2 bg-navy px-6 py-4 text-sm font-black uppercase tracking-[0.08em] text-white hover:bg-brand-red"
              type="submit"
            >
              Create Account
            </button>
          </form>
          <p className="mt-5 text-center text-sm font-bold text-steel">
            Already have an account?{" "}
            <Link className="font-black text-navy hover:text-brand-red" href={loginHref}>
              Sign In
            </Link>
          </p>
        </div>
      </section>
    </MarketingShell>
  );
}

function Field({
  label,
  name,
  required,
  type,
}: {
  label: string;
  name: string;
  required?: boolean;
  type: string;
}) {
  return (
    <label className="grid gap-2 font-bold">
      {label}
      <input
        className="min-h-12 border border-ink/14 bg-white p-4 text-base text-ink outline-none focus:border-navy"
        name={name}
        required={required}
        type={type}
      />
    </label>
  );
}
