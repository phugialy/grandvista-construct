"use server";

import { redirect } from "next/navigation";
import { type AdminRole, getAdminTokenForRole, setAdminSession } from "@/lib/admin-auth";

function getRequestedRole(formData: FormData): AdminRole {
  const requestedRole = formData.get("admin_role");

  return requestedRole === "owner" ? "owner" : "management";
}

export async function loginAdmin(formData: FormData) {
  const submittedToken = formData.get("access_token");
  const role = getRequestedRole(formData);
  const expectedToken = getAdminTokenForRole(role);

  if (!expectedToken || typeof submittedToken !== "string" || submittedToken !== expectedToken) {
    redirect(`/admin/login?status=invalid&role=${role}`);
  }

  await setAdminSession(role);
  redirect("/admin");
}
