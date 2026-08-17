"use server";

import { redirect } from "next/navigation";
import { resolveAccountLogin } from "@/lib/account-login";

export async function loginAdmin(formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");
  let redirectTo: string | null = null;

  try {
    redirectTo = await resolveAccountLogin({
      email: typeof email === "string" ? email : "",
      password: typeof password === "string" ? password : "",
    });
  } catch (error) {
    console.error("Admin login failed", error);
    redirect("/admin/login?status=error");
  }

  if (!redirectTo) {
    redirect("/admin/login?status=invalid");
  }

  redirect(redirectTo);
}
