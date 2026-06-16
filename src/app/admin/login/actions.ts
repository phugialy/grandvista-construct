"use server";

import { redirect } from "next/navigation";
import { type AdminRole, isAdminRole, setAdminSession, validateAdminCredentials } from "@/lib/admin-auth";

function getRequestedRole(formData: FormData): AdminRole {
  const requestedRole = formData.get("admin_role");

  return isAdminRole(requestedRole) ? requestedRole : "web";
}

export async function loginAdmin(formData: FormData) {
  const role = getRequestedRole(formData);
  const session = validateAdminCredentials({
    email: formData.get("email"),
    password: formData.get("password"),
    role,
  });

  if (!session) {
    redirect(`/admin/login?status=invalid&role=${role}`);
  }

  await setAdminSession(session);
  redirect("/admin");
}
