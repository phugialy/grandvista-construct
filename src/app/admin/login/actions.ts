"use server";

import { redirect } from "next/navigation";
import { setAdminSession, validateAdminCredentials } from "@/lib/admin-auth";

export async function loginAdmin(formData: FormData) {
  const session = validateAdminCredentials({
    password: formData.get("password"),
    username: formData.get("username"),
  });

  if (!session) {
    redirect("/admin/login?status=invalid");
  }

  await setAdminSession(session);
  redirect("/admin");
}
