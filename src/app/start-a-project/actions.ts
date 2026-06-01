"use server";

import { redirect } from "next/navigation";
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

export async function submitProjectInquiry(formData: FormData) {
  const name = getString(formData, "name");
  const email = getString(formData, "email");
  const projectType = nullableString(formData, "project_type");

  if (!name || !email || !projectType) {
    redirect("/start-a-project?status=missing");
  }

  const supabase = getSupabaseServiceClient();
  const { error } = await supabase.from("leads").insert({
    name,
    email,
    company: nullableString(formData, "company"),
    phone: nullableString(formData, "phone"),
    project_location: nullableString(formData, "project_location"),
    project_type: projectType,
    construction_context: nullableString(formData, "construction_context"),
    estimated_timeline: nullableString(formData, "estimated_timeline"),
    estimated_budget_range: nullableString(formData, "estimated_budget_range"),
    current_stage: nullableString(formData, "current_stage"),
    architect_involved: nullableString(formData, "architect_involved"),
    permit_status: nullableString(formData, "permit_status"),
    description: nullableString(formData, "description"),
    source_page: "/start-a-project",
    utm_source: nullableString(formData, "utm_source"),
    utm_medium: nullableString(formData, "utm_medium"),
    utm_campaign: nullableString(formData, "utm_campaign"),
  });

  if (error) {
    console.error("Lead submission failed", error);
    redirect("/start-a-project?status=error");
  }

  redirect("/start-a-project/thanks");
}
