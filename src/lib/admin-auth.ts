import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";

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
  password: string;
  role: AdminRole;
  username: string;
};

const roleLabels: Record<AdminRole, string> = {
  master: "Master Admin",
  web: "Web Admin",
};

const credentialEnvByRole: Record<AdminRole, { legacyEmail: string; password: string; username: string }> = {
  master: {
    legacyEmail: "ADMIN_MASTER_EMAIL",
    password: "ADMIN_MASTER_PASSWORD",
    username: "ADMIN_MASTER_USERNAME",
  },
  web: {
    legacyEmail: "ADMIN_WEB_ADMIN_EMAIL",
    password: "ADMIN_WEB_ADMIN_PASSWORD",
    username: "ADMIN_WEB_ADMIN_USERNAME",
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
  const username = (process.env[env.username] || process.env[env.legacyEmail])?.trim().toLowerCase();
  const password = process.env[env.password] ?? "";

  if (!username || !password) {
    return null;
  }

  return { password, role, username };
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
  const account = (["master", "web"] as const)
    .map((role) => getAdminAccount(role))
    .find((candidate) => {
      if (!candidate) {
        return false;
      }

      return safeCompare(normalizedUsername, candidate.username) && safeCompare(password, candidate.password);
    });

  if (!account) {
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
