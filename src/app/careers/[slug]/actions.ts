"use server";

import { redirect } from "next/navigation";
import { revalidateTag } from "next/cache";
import { getCandidateProfile, requireCandidate } from "@/lib/candidate-auth";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

const maxResumeBytes = 8 * 1024 * 1024;
const allowedResumeTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function nullableString(formData: FormData, key: string) {
  const value = getString(formData, key);
  return value.length > 0 ? value : null;
}

async function isPostingOpen(slug: string) {
  const supabase = getSupabaseServiceClient();
  const { data: posting } = await supabase
    .from("job_postings")
    .select("id,status,closes_at")
    .eq("slug", slug)
    .maybeSingle();

  if (!posting || posting.status !== "published") {
    return null;
  }

  if (posting.closes_at && new Date(posting.closes_at) < new Date()) {
    return null;
  }

  return posting;
}

export async function applyToJob(formData: FormData) {
  const slug = getString(formData, "slug");

  // Honeypot: real applicants never fill this hidden field.
  if (getString(formData, "company_website")) {
    redirect(`/careers/${slug}/thanks`);
  }

  const session = await requireCandidate(`/careers/${slug}`);
  const posting = await isPostingOpen(slug);

  if (!posting) {
    redirect(`/careers/${slug}?status=closed`);
  }

  const supabase = getSupabaseServiceClient();
  const coverLetter = nullableString(formData, "cover_letter");
  const resumeFile = formData.get("resume");

  if (resumeFile instanceof File && resumeFile.size > 0) {
    if (!allowedResumeTypes.has(resumeFile.type)) {
      redirect(`/careers/${slug}?status=bad_file_type`);
    }

    if (resumeFile.size > maxResumeBytes) {
      redirect(`/careers/${slug}?status=file_too_large`);
    }

    const extension = resumeFile.name.split(".").pop() ?? "pdf";
    const path = `${session.candidateId}/${Date.now()}.${extension}`;
    const { error: uploadError } = await supabase.storage.from("resumes").upload(path, resumeFile, {
      contentType: resumeFile.type,
      upsert: true,
    });

    if (uploadError) {
      console.error("Resume upload failed", uploadError.message);
      redirect(`/careers/${slug}?status=upload_error`);
    }

    await supabase
      .from("candidate_profiles")
      .update({ resume_url: path, resume_file_name: resumeFile.name, updated_at: new Date().toISOString() })
      .eq("id", session.candidateId);
  }

  const profile = await getCandidateProfile(session.candidateId);

  if (!profile?.resume_url) {
    redirect(`/careers/${slug}?status=resume_required`);
  }

  const { data: application, error: applicationError } = await supabase
    .from("applications")
    .upsert(
      {
        candidate_id: session.candidateId,
        job_posting_id: posting.id,
        cover_letter: coverLetter,
        source_page: `/careers/${slug}`,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "candidate_id,job_posting_id" },
    )
    .select("id")
    .single();

  if (applicationError || !application) {
    console.error("Application submission failed", applicationError?.message);
    redirect(`/careers/${slug}?status=error`);
  }

  await supabase.from("application_events").insert({
    application_id: application.id,
    event_name: "application_submitted",
    actor: `candidate:${session.email}`,
    event_payload: { job_posting_id: posting.id },
  });

  revalidateTag("published-job-postings", "default");
  redirect(`/careers/${slug}/thanks`);
}
