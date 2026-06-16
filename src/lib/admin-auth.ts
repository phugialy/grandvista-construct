import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";

const ADMIN_COOKIE = "grandvista_admin";

export type AdminRole = "owner" | "management";

const roleLabels: Record<AdminRole, string> = {
  owner: "Owner",
  management: "Management Web Control",
};

export function getAdminToken() {
  return process.env.ADMIN_ACCESS_TOKEN ?? "";
}

export function getAdminRoleLabel(role: AdminRole) {
  return roleLabels[role];
}

export function getAdminTokenForRole(role: AdminRole) {
  const fallbackToken = getAdminToken();

  if (role === "owner") {
    return process.env.ADMIN_OWNER_ACCESS_TOKEN || fallbackToken;
  }

  return process.env.ADMIN_MANAGEMENT_ACCESS_TOKEN || fallbackToken;
}

function parseAdminCookie(value?: string) {
  if (!value) {
    return null;
  }

  const [role, token] = value.split(":", 2);

  if ((role === "owner" || role === "management") && token) {
    return { role, token } as { role: AdminRole; token: string };
  }

  return { role: "management" as AdminRole, token: value };
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const session = parseAdminCookie(cookieStore.get(ADMIN_COOKIE)?.value);

  if (!session) {
    return null;
  }

  const expectedToken = getAdminTokenForRole(session.role);

  if (!expectedToken || session.token !== expectedToken) {
    return null;
  }

  return { role: session.role, label: getAdminRoleLabel(session.role) };
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

export async function setAdminSession(role: AdminRole) {
  const token = getAdminTokenForRole(role);

  if (!token) {
    throw new Error(`Missing access token for ${role}.`);
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, `${role}:${token}`, {
    httpOnly: true,
    maxAge: 60 * 60 * 8,
    path: "/admin",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
}
