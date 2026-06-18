import { redirect } from "next/navigation";
import { getAdminSession, requireAdmin } from "@/lib/admin-auth";

export default async function AdminDashboardPage() {
  await requireAdmin();
  const session = await getAdminSession();

  redirect(session?.role === "master" ? "/admin/leads" : "/admin/website");
}
