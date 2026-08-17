import { getAdminAccount, getSupabasePasswordAuthClient, setAdminSession } from "./admin-auth";
import { setCandidateSession } from "./candidate-auth";
import { getSupabaseServiceClient } from "./supabase/server";

type AccountResolver = (authUserId: string, email: string) => Promise<string | null>;

async function resolveAdminLogin(authUserId: string, email: string): Promise<string | null> {
  const account = await getAdminAccount(authUserId);

  if (!account || account.email.toLowerCase() !== email) {
    return null;
  }

  await setAdminSession({ email: account.email, role: account.role, username: account.email });
  return account.role === "master" ? "/admin/leads" : "/admin/website";
}

async function resolveCandidateLogin(authUserId: string, email: string): Promise<string | null> {
  const supabase = getSupabaseServiceClient();
  const { data: profile } = await supabase
    .from("candidate_profiles")
    .select("id")
    .eq("auth_user_id", authUserId)
    .eq("active", true)
    .maybeSingle();

  if (!profile) {
    return null;
  }

  await setCandidateSession({ candidateId: profile.id, email });
  return "/careers/applications";
}

// Checked in order, admin first: one login form works for every account type without
// admins and candidates sharing a trust boundary. Add a new account type by appending
// a resolver here, not by branching inside the login actions that call this.
const accountResolvers: AccountResolver[] = [resolveAdminLogin, resolveCandidateLogin];

/**
 * Verifies credentials once against Supabase Auth, then finds which kind of account
 * (if any) they belong to and sets the matching session cookie. Returns where to send
 * the signed-in user, or null if the credentials are invalid or match no known account.
 */
export async function resolveAccountLogin({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<string | null> {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail || !password) {
    return null;
  }

  const authClient = getSupabasePasswordAuthClient();
  const { data, error } = await authClient.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });
  await authClient.auth.signOut({ scope: "local" });

  if (error || !data.user) {
    return null;
  }

  for (const resolve of accountResolvers) {
    const redirectTo = await resolve(data.user.id, normalizedEmail);

    if (redirectTo) {
      return redirectTo;
    }
  }

  return null;
}
