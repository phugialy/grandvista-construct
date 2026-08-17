"use server";

import { redirect } from "next/navigation";
import { createCandidateAccount, setCandidateSession } from "@/lib/candidate-auth";
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

function safeNext(value: string) {
  return value.startsWith("/careers/") ? value : "/careers/applications";
}

export async function signupCandidate(formData: FormData) {
  const next = safeNext(getString(formData, "next"));
  const email = getString(formData, "email").toLowerCase();
  const password = getString(formData, "password");
  const name = getString(formData, "name");
  const phone = nullableString(formData, "phone");
  const resumeFile = formData.get("resume");

  if (!email || !password || !name) {
    redirect(`/careers/signup?status=missing&next=${encodeURIComponent(next)}`);
  }

  const result = await createCandidateAccount({ email, password, name, phone });

  if (!result.ok) {
    redirect(`/careers/signup?status=${result.error}&next=${encodeURIComponent(next)}`);
  }

  if (resumeFile instanceof File && resumeFile.size > 0) {
    if (!allowedResumeTypes.has(resumeFile.type)) {
      redirect(`/careers/signup?status=bad_file_type&next=${encodeURIComponent(next)}`);
    }

    if (resumeFile.size > maxResumeBytes) {
      redirect(`/careers/signup?status=file_too_large&next=${encodeURIComponent(next)}`);
    }

    const supabase = getSupabaseServiceClient();
    const extension = resumeFile.name.split(".").pop() ?? "pdf";
    const path = `${result.candidateId}/${Date.now()}.${extension}`;
    const { error: uploadError } = await supabase.storage.from("resumes").upload(path, resumeFile, {
      contentType: resumeFile.type,
      upsert: true,
    });

    if (!uploadError) {
      await supabase
        .from("candidate_profiles")
        .update({ resume_url: path, resume_file_name: resumeFile.name, updated_at: new Date().toISOString() })
        .eq("id", result.candidateId);
    } else {
      console.error("Signup resume upload failed", uploadError.message);
    }
  }

  await setCandidateSession({ candidateId: result.candidateId, email });
  redirect(next);
}
