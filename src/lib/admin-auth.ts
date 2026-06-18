import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { verifyAdminPassword } from "./admin-password";
import { getSupabaseServiceClient } from "./supabase/server";

const ADMIN_COOKIE = "grandvista_admin";
const SESSION_TTL_SECONDS = 60 * 60 * 8;

export type AdminRole = "master" | "web";

type AdminSessionPayload = {
  exp: number;
  iat: number;
  role: AdminRole;
  username: string;
};

type AdminAccount = {
  active: boolean;
  password_hash: string;
  password_salt: string;
  role: AdminRole;
  username: string;
};

const roleLabels: Record<AdminRole, string> = {
  master: "Master Admin",
  web: "Web Admin",
};

export function getAdminRoleLabel(role: AdminRole) {
  return roleLabels[role];
}

export function isAdminRole(value: unknown): value is AdminRole {
  return value === "master" || value === "web";
}

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || "";
}

function safeCompare(value: string, expected: string) {
  const valueBuffer = Buffer.from(value);
  const expectedBuffer = Buffer.from(expected);

  if (valueBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(valueBuffer, expectedBuffer);
}

async function getAdminAccount(username: string): Promise<AdminAccount | null> {
  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("admin_users")
    .select("username,role,password_hash,password_salt,active")
    .eq("username", username)
    .eq("active", true)
    .maybeSingle();

  if (error) {
    console.error("Failed to load admin user", error);
    return null;
  }

  if (!data || !isAdminRole(data.role)) {
    return null;
  }

  return data as AdminAccount;
}

export async function validateAdminCredentials({
  password,
  username,
}: {
  password: unknown;
  username: unknown;
}) {
  if (typeof username !== "string" || typeof password !== "string") {
    return null;
  }

  const normalizedUsername = username.trim().toLowerCase();
  const account = await getAdminAccount(normalizedUsername);

  if (!account) {
    return null;
  }

  if (
    !safeCompare(normalizedUsername, account.username) ||
    !verifyAdminPassword({
      password,
      passwordHash: account.password_hash,
      passwordSalt: account.password_salt,
    })
  ) {
    return null;
  }

  return { role: account.role, username: account.username };
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
    throw new Error("Missing ADMIN_SESSION_SECRET.");
  }

  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function createSessionCookie(payload: AdminSessionPayload) {
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = signPayload(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

function parseSessionCookie(value?: string): AdminSessionPayload | null {
  if (!value) {
    return null;
  }

  const [encodedPayload, signature] = value.split(".", 2);

  if (!encodedPayload || !signature || signPayload(encodedPayload) !== signature) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as Partial<AdminSessionPayload>;
    const now = Math.floor(Date.now() / 1000);

    if (
      typeof payload.exp !== "number" ||
      typeof payload.iat !== "number" ||
      !isAdminRole(payload.role) ||
      typeof payload.username !== "string" ||
      payload.exp <= now
    ) {
      return null;
    }

    return {
      exp: payload.exp,
      iat: payload.iat,
      role: payload.role,
      username: payload.username,
    };
  } catch {
    return null;
  }
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const session = parseSessionCookie(cookieStore.get(ADMIN_COOKIE)?.value);

  if (!session) {
    return null;
  }

  return { ...session, label: getAdminRoleLabel(session.role) };
}

export async function isAdminAuthenticated() {
  return Boolean(await getAdminSession());
}

export async function requireAdmin() {
  await connection();
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }
}

export async function requireMasterAdmin() {
  await connection();
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  if (session.role !== "master") {
    redirect("/admin");
  }
}

export async function setAdminSession({ role, username }: { role: AdminRole; username: string }) {
  const now = Math.floor(Date.now() / 1000);
  const cookieStore = await cookies();

  cookieStore.set(
    ADMIN_COOKIE,
    createSessionCookie({
      exp: now + SESSION_TTL_SECONDS,
      iat: now,
      role,
      username,
    }),
    {
      httpOnly: true,
      maxAge: SESSION_TTL_SECONDS,
      path: "/admin",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
  );
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
}
