"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  getAdminSession,
  getSupabasePasswordAuthClient,
  isAdminRole,
  requireMasterAdmin,
  type AdminRole,
} from "@/lib/admin-auth";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

const USERS_PATH = "/admin/users";

function normalizeEmail(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function getRole(value: FormDataEntryValue | null): AdminRole | null {
  return isAdminRole(value) ? value : null;
}

async function getResetRedirectUrl() {
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const protocol = headerStore.get("x-forwarded-proto") ?? "https";
  const origin = host ? `${protocol}://${host}` : "https://grandvista-construction.com";

  return `${origin}/admin/reset-password`;
}

async function sendPasswordSetupEmail(email: string) {
  const authClient = getSupabasePasswordAuthClient();
  const { error } = await authClient.auth.resetPasswordForEmail(email, {
    redirectTo: await getResetRedirectUrl(),
  });

  if (error) {
    console.error("Admin password setup email failed", error.message);
    return false;
  }

  return true;
}

async function findAuthUserByEmail(email: string) {
  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });

  if (error) {
    console.error("Admin auth user lookup failed", error.message);
    return null;
  }

  return data.users.find((user) => user.email?.toLowerCase() === email) ?? null;
}

async function protectCurrentUser(authUserId: string) {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  const supabase = getSupabaseServiceClient();
  const { data } = await supabase
    .from("admin_profiles")
    .select("auth_user_id")
    .eq("auth_user_id", authUserId)
    .eq("email", session.email)
    .maybeSingle();

  if (data) {
    redirect(`${USERS_PATH}?status=self_protected`);
  }
}

export async function createAdminUser(formData: FormData) {
  await requireMasterAdmin();

  const email = normalizeEmail(formData.get("email"));
  const role = getRole(formData.get("role")) ?? "web";

  if (!email) {
    redirect(`${USERS_PATH}?status=missing`);
  }

  const supabase = getSupabaseServiceClient();
  let authUser = await findAuthUserByEmail(email);

  if (!authUser) {
    const temporaryPassword = randomBytes(24).toString("base64url");
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
      password: temporaryPassword,
    });

    if (error || !data.user) {
      console.error("Create admin auth user failed", error?.message);
      redirect(`${USERS_PATH}?status=error`);
    }

    authUser = data.user;
  }

  const { error: profileError } = await supabase.from("admin_profiles").upsert(
    {
      active: true,
      auth_user_id: authUser.id,
      email,
      role,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "auth_user_id" },
  );

  if (profileError) {
    console.error("Create admin profile failed", profileError.message);
    redirect(`${USERS_PATH}?status=error`);
  }

  const sent = await sendPasswordSetupEmail(email);
  revalidatePath(USERS_PATH);
  redirect(`${USERS_PATH}?status=${sent ? "created" : "created_no_email"}`);
}

export async function sendAdminReset(formData: FormData) {
  await requireMasterAdmin();

  const email = normalizeEmail(formData.get("email"));

  if (!email) {
    redirect(`${USERS_PATH}?status=missing`);
  }

  const sent = await sendPasswordSetupEmail(email);
  redirect(`${USERS_PATH}?status=${sent ? "reset_sent" : "email_error"}`);
}

export async function updateAdminRole(formData: FormData) {
  await requireMasterAdmin();

  const authUserId = (formData.get("authUserId") as string | null)?.trim() ?? "";
  const role = getRole(formData.get("role"));

  if (!authUserId || !role) {
    redirect(`${USERS_PATH}?status=missing`);
  }

  await protectCurrentUser(authUserId);

  const supabase = getSupabaseServiceClient();
  const { error } = await supabase
    .from("admin_profiles")
    .update({ role, updated_at: new Date().toISOString() })
    .eq("auth_user_id", authUserId);

  if (error) {
    console.error("Admin role update failed", error.message);
    redirect(`${USERS_PATH}?status=error`);
  }

  revalidatePath(USERS_PATH);
  redirect(`${USERS_PATH}?status=role_saved`);
}

export async function updateAdminActive(formData: FormData) {
  await requireMasterAdmin();

  const authUserId = (formData.get("authUserId") as string | null)?.trim() ?? "";
  const active = formData.get("active") === "true";

  if (!authUserId) {
    redirect(`${USERS_PATH}?status=missing`);
  }

  await protectCurrentUser(authUserId);

  const supabase = getSupabaseServiceClient();
  const { error } = await supabase
    .from("admin_profiles")
    .update({ active, updated_at: new Date().toISOString() })
    .eq("auth_user_id", authUserId);

  if (error) {
    console.error("Admin active update failed", error.message);
    redirect(`${USERS_PATH}?status=error`);
  }

  revalidatePath(USERS_PATH);
  redirect(`${USERS_PATH}?status=access_saved`);
}

export async function deleteAdminUser(formData: FormData) {
  await requireMasterAdmin();

  const authUserId = (formData.get("authUserId") as string | null)?.trim() ?? "";

  if (!authUserId) {
    redirect(`${USERS_PATH}?status=missing`);
  }

  await protectCurrentUser(authUserId);

  const supabase = getSupabaseServiceClient();
  const { error } = await supabase.auth.admin.deleteUser(authUserId);

  if (error) {
    console.error("Admin credential delete failed", error.message);
    redirect(`${USERS_PATH}?status=error`);
  }

  revalidatePath(USERS_PATH);
  redirect(`${USERS_PATH}?status=deleted`);
}
