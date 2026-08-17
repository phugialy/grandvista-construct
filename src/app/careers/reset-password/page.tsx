import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { CandidateResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = {
  title: "Reset Password | Grandvista Careers",
  robots: { index: false },
};

export default function CandidateResetPasswordPage() {
  return (
    <MarketingShell>
      <section className="section-shell grid min-h-[70vh] place-items-center py-16">
        <CandidateResetPasswordForm />
      </section>
    </MarketingShell>
  );
}
