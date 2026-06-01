import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ADMIN_COOKIE = "grandvista_admin";

export function getAdminToken() {
  return process.env.ADMIN_ACCESS_TOKEN ?? "";
}

export async function isAdminAuthenticated() {
  const token = getAdminToken();

  if (!token) {
    return false;
  }

  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_COOKIE)?.value === token;
}

export async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }
}

export async function setAdminSession() {
  const token = getAdminToken();

  if (!token) {
    throw new Error("Missing ADMIN_ACCESS_TOKEN.");
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, token, {
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
