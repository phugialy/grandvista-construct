"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getSupabasePasswordAuthClient } from "@/lib/admin-auth";

async function getResetRedirectUrl() {
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const protocol = headerStore.get("x-forwarded-proto") ?? "https";
  const origin = host ? `${protocol}://${host}` : "https://grandvista-construction.com";

  return `${origin}/careers/reset-password`;
}

export async function requestCandidatePasswordReset(formData: FormData) {
  const email = (formData.get("email") as string | null)?.trim().toLowerCase() ?? "";

  if (!email) {
    redirect("/careers/forgot-password?status=missing");
  }

  const authClient = getSupabasePasswordAuthClient();
  await authClient.auth.resetPasswordForEmail(email, {
    redirectTo: await getResetRedirectUrl(),
  });

  // Always show the same confirmation, whether or not the email has an account —
  // never reveal which emails are registered.
  redirect("/careers/forgot-password?status=sent");
}
