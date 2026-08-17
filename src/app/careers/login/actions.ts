"use server";

import { redirect } from "next/navigation";
import { getSupabasePasswordAuthClient } from "@/lib/admin-auth";
import { clearCandidateSession, findCandidateAuthUserByEmail, setCandidateSession } from "@/lib/candidate-auth";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

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

  const existingUser = await findCandidateAuthUserByEmail(email);

  if (!existingUser) {
    redirect(`/careers/login?status=invalid&next=${encodeURIComponent(next)}`);
  }

  const authClient = getSupabasePasswordAuthClient();
  const { data, error } = await authClient.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    redirect(`/careers/login?status=invalid&next=${encodeURIComponent(next)}`);
  }

  await authClient.auth.signOut({ scope: "local" });

  const supabase = getSupabaseServiceClient();
  const { data: profile } = await supabase
    .from("candidate_profiles")
    .select("id")
    .eq("auth_user_id", existingUser.id)
    .maybeSingle();

  if (!profile) {
    redirect(`/careers/login?status=invalid&next=${encodeURIComponent(next)}`);
  }

  await setCandidateSession({ candidateId: profile.id, email });
  redirect(next);
}

export async function logoutCandidate() {
  await clearCandidateSession();
  redirect("/careers");
}
