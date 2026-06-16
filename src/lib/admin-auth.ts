import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";

const ADMIN_COOKIE = "grandvista_admin";
const SESSION_TTL_SECONDS = 60 * 60 * 8;

export type AdminRole = "master" | "web";

type AdminSessionPayload = {
  email: string;
  exp: number;
  iat: number;
  role: AdminRole;
};

type AdminAccount = {
  email: string;
  password: string;
  role: AdminRole;
};

const roleLabels: Record<AdminRole, string> = {
  master: "Master Admin",
  web: "Web Admin",
};

const credentialEnvByRole: Record<AdminRole, { email: string; password: string }> = {
  master: {
    email: "ADMIN_MASTER_EMAIL",
    password: "ADMIN_MASTER_PASSWORD",
  },
  web: {
    email: "ADMIN_WEB_ADMIN_EMAIL",
    password: "ADMIN_WEB_ADMIN_PASSWORD",
  },
};

export function getAdminRoleLabel(role: AdminRole) {
  return roleLabels[role];
}

export function isAdminRole(value: unknown): value is AdminRole {
  return value === "master" || value === "web";
}

function getSessionSecret() {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.ADMIN_ACCESS_TOKEN ||
    process.env.ADMIN_MASTER_PASSWORD ||
    process.env.ADMIN_WEB_ADMIN_PASSWORD ||
    ""
  );
}

function getAdminAccount(role: AdminRole): AdminAccount | null {
  const env = credentialEnvByRole[role];
  const email = process.env[env.email]?.trim().toLowerCase();
  const password = process.env[env.password] ?? "";

  if (!email || !password) {
    return null;
  }

  return { email, password, role };
}

function safeCompare(value: string, expected: string) {
  const valueBuffer = Buffer.from(value);
  const expectedBuffer = Buffer.from(expected);

  if (valueBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(valueBuffer, expectedBuffer);
}

export function validateAdminCredentials({
  email,
  password,
  role,
}: {
  email: unknown;
  password: unknown;
  role: AdminRole;
}) {
  if (typeof email !== "string" || typeof password !== "string") {
    return null;
  }

  const account = getAdminAccount(role);

  if (!account) {
    return null;
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (!safeCompare(normalizedEmail, account.email) || !safeCompare(password, account.password)) {
    return null;
  }

  return { email: account.email, role: account.role };
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
    throw new Error("Missing ADMIN_SESSION_SECRET or admin credentials.");
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
      typeof payload.email !== "string" ||
      typeof payload.exp !== "number" ||
      typeof payload.iat !== "number" ||
      !isAdminRole(payload.role) ||
      payload.exp <= now
    ) {
      return null;
    }

    return {
      email: payload.email,
      exp: payload.exp,
      iat: payload.iat,
      role: payload.role,
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

export async function setAdminSession({ email, role }: { email: string; role: AdminRole }) {
  const now = Math.floor(Date.now() / 1000);
  const cookieStore = await cookies();

  cookieStore.set(
    ADMIN_COOKIE,
    createSessionCookie({
      email,
      exp: now + SESSION_TTL_SECONDS,
      iat: now,
      role,
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
