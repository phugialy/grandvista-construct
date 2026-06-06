"use server";

import { redirect } from "next/navigation";
import { sendLeadNotification } from "@/lib/email/lead-notification";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function nullableString(formData: FormData, key: string) {
  const value = getString(formData, key);
  return value.length > 0 ? value : null;
}

export async function submitCompanyMessage(formData: FormData) {
  const name = getString(formData, "name");
  const email = getString(formData, "email");
  const message = getString(formData, "message");
  const reason = getString(formData, "reason") || "General message";

  if (!name || !email || !message) {
    redirect("/company?status=missing#company-message");
  }

  const supabase = getSupabaseServiceClient();
  const projectType = `Company Message - ${reason}`;
  const leadPayload = {
    name,
    email,
    company: nullableString(formData, "company"),
    phone: nullableString(formData, "phone"),
    project_type: projectType,
    current_stage: reason,
    description: message,
    source_page: "/company",
  };
  const { error } = await supabase.from("leads").insert(leadPayload);

  if (error) {
    console.error("Company message submission failed", error);
    redirect("/company?status=error#company-message");
  }

  await sendLeadNotification({
    name,
    company: leadPayload.company,
    email,
    phone: leadPayload.phone,
    projectLocation: null,
    projectType,
    timeline: null,
    budget: null,
    description: message,
  });

  redirect("/company?status=message-sent#company-message");
}
