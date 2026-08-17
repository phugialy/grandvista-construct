import { createHmac } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getSupabaseServiceClient } from "./supabase/server";

const CANDIDATE_COOKIE = "grandvista_candidate";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

type CandidateSessionPayload = {
  candidateId: string;
  email: string;
  exp: number;
  iat: number;
};

export type CandidateProfile = {
  id: string;
  auth_user_id: string;
  email: string;
  name: string;
  phone: string | null;
  resume_url: string | null;
  resume_file_name: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  active: boolean;
};

function getSessionSecret() {
  return process.env.CANDIDATE_SESSION_SECRET || "";
}

function base64UrlEncode(value: string) {
  return Buffer.from(value).toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signPayload(payload: string) {
  const secret = getSessionSecret();

  if (!secret) {
    throw new Error("Missing CANDIDATE_SESSION_SECRET.");
  }

  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function createSessionCookie(payload: CandidateSessionPayload) {
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = signPayload(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

function parseSessionCookie(value?: string): CandidateSessionPayload | null {
  if (!value) {
    return null;
  }

  const [encodedPayload, signature] = value.split(".", 2);

  if (!encodedPayload || !signature || signPayload(encodedPayload) !== signature) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as Partial<CandidateSessionPayload>;
    const now = Math.floor(Date.now() / 1000);

    if (
      typeof payload.exp !== "number" ||
      typeof payload.iat !== "number" ||
      typeof payload.candidateId !== "string" ||
      typeof payload.email !== "string" ||
      payload.exp <= now
    ) {
      return null;
    }

    return {
      candidateId: payload.candidateId,
      email: payload.email,
      exp: payload.exp,
      iat: payload.iat,
    };
  } catch {
    return null;
  }
}

export async function getCandidateSession() {
  const cookieStore = await cookies();
  return parseSessionCookie(cookieStore.get(CANDIDATE_COOKIE)?.value);
}

export async function requireCandidate(next?: string) {
  await connection();
  const session = await getCandidateSession();

  if (!session) {
    redirect(next ? `/careers/signup?next=${encodeURIComponent(next)}` : "/careers/signup");
  }

  return session;
}

export async function setCandidateSession({ candidateId, email }: { candidateId: string; email: string }) {
  const now = Math.floor(Date.now() / 1000);
  const cookieStore = await cookies();

  cookieStore.set(
    CANDIDATE_COOKIE,
    createSessionCookie({
      candidateId,
      email,
      exp: now + SESSION_TTL_SECONDS,
      iat: now,
    }),
    {
      httpOnly: true,
      maxAge: SESSION_TTL_SECONDS,
      path: "/careers",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
  );
}

export async function clearCandidateSession() {
  const cookieStore = await cookies();
  cookieStore.delete(CANDIDATE_COOKIE);
}

export async function getCandidateProfile(candidateId: string): Promise<CandidateProfile | null> {
  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("candidate_profiles")
    .select("id,auth_user_id,email,name,phone,resume_url,resume_file_name,linkedin_url,portfolio_url,active")
    .eq("id", candidateId)
    .eq("active", true)
    .maybeSingle();

  if (error) {
    console.error("Failed to load candidate profile", error);
    return null;
  }

  return data as CandidateProfile | null;
}

/**
 * Looks up a Supabase Auth user by email, or null if none exists. Used to decide
 * whether an apply-form submission should sign the candidate in or create a new account.
 */
export async function findCandidateAuthUserByEmail(email: string) {
  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });

  if (error) {
    console.error("Candidate auth user lookup failed", error.message);
    return null;
  }

  return data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase()) ?? null;
}

export type CandidateAuthResult =
  | { ok: true; candidateId: string; email: string }
  | { ok: false; error: "email_taken" | "signup_failed" | "profile_failed" };

/**
 * Signup only — errors if the email already has an account, rather than silently
 * signing them in. Signing in is a separate, dedicated flow (see /careers/login).
 * Never used for admin accounts, and never grants admin access.
 */
export async function createCandidateAccount({
  email,
  password,
  name,
  phone,
}: {
  email: string;
  password: string;
  name: string;
  phone: string | null;
}): Promise<CandidateAuthResult> {
  const supabase = getSupabaseServiceClient();
  const existingUser = await findCandidateAuthUserByEmail(email);

  if (existingUser) {
    return { ok: false, error: "email_taken" };
  }

  const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createError || !newUser.user) {
    console.error("Candidate account creation failed", createError?.message);
    return { ok: false, error: "signup_failed" };
  }

  const { data: profile, error: profileError } = await supabase
    .from("candidate_profiles")
    .insert({ auth_user_id: newUser.user.id, email, name, phone })
    .select("id")
    .single();

  if (profileError || !profile) {
    console.error("Candidate profile creation failed", profileError?.message);
    return { ok: false, error: "profile_failed" };
  }

  return { ok: true, candidateId: profile.id, email };
}
