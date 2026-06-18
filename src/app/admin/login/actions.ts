"use server";

import { redirect } from "next/navigation";
import { setAdminSession, validateAdminCredentials } from "@/lib/admin-auth";

export async function loginAdmin(formData: FormData) {
  let session;

  try {
    session = await validateAdminCredentials({
      password: formData.get("password"),
      username: formData.get("username"),
    });
  } catch (error) {
    console.error("Admin login failed", error);
    redirect("/admin/login?status=error");
  }

  if (!session) {
    redirect("/admin/login?status=invalid");
  }

  await setAdminSession(session);
  redirect(session.role === "master" ? "/admin/leads" : "/admin/website");
}
