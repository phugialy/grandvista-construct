"use server";

import { redirect } from "next/navigation";
import { getAdminToken, setAdminSession } from "@/lib/admin-auth";

export async function loginAdmin(formData: FormData) {
  const submittedToken = formData.get("access_token");

  if (typeof submittedToken !== "string" || submittedToken !== getAdminToken()) {
    redirect("/admin/login?status=invalid");
  }

  await setAdminSession();
  redirect("/admin");
}
