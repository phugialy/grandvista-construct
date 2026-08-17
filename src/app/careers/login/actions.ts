"use server";

import { redirect } from "next/navigation";
import { resolveAccountLogin } from "@/lib/account-login";
import { clearCandidateSession } from "@/lib/candidate-auth";

function safeNext(value: string) {
  return value.startsWith("/careers/") ? value : "/careers/applications";
}

export async function loginCandidate(formData: FormData) {
  const email = (formData.get("email") as string | null)?.trim().toLowerCase() ?? "";
  const password = (formData.get("password") as string | null) ?? "";
  const next = safeNext(((formData.get("next") as string | null) ?? "").trim());

  if (!email || !password) {
    redirect(`/careers/login?status=missing&next=${encodeURIComponent(next)}`);
  }

  let redirectTo: string | null = null;

  try {
    redirectTo = await resolveAccountLogin({ email, password });
  } catch (error) {
    console.error("Candidate login failed", error);
    redirect(`/careers/login?status=invalid&next=${encodeURIComponent(next)}`);
  }

  if (!redirectTo) {
    redirect(`/careers/login?status=invalid&next=${encodeURIComponent(next)}`);
  }

  // A signed-in candidate honors the requested next page; anything else (e.g. an
  // admin account signing in here) goes to whatever resolveAccountLogin decided.
  redirect(redirectTo === "/careers/applications" ? next : redirectTo);
}

export async function logoutCandidate() {
  await clearCandidateSession();
  redirect("/careers");
}
