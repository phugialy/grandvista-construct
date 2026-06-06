import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

const bucket = "grandvista-media";
const maxImageBytes = 8 * 1024 * 1024;
const maxVideoBytes = 50 * 1024 * 1024;
const allowedTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

type RequestedFile = {
  name?: string;
  size?: number;
  type?: string;
};

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Admin access required." }, { status: 401 });
  }

  const { files } = (await request.json()) as { files?: RequestedFile[] };

  if (!files?.length) {
    return NextResponse.json({ error: "Choose at least one image or short video." }, { status: 400 });
  }

  const supabase = getSupabaseServiceClient();
  const signedUploads = [];

  for (const file of files) {
    const validation = validateFile(file);

    if (validation) {
      return NextResponse.json({ error: validation }, { status: 400 });
    }

    const extension = getExtension(file.name ?? "", file.type ?? "");
    const path = `uploads/${new Date().getFullYear()}/${crypto.randomUUID()}.${extension}`;
    const { data, error } = await supabase.storage.from(bucket).createSignedUploadUrl(path);

    if (error || !data) {
      console.error("Signed media upload URL failed", error);
      return NextResponse.json({ error: "Could not prepare the upload. Try again." }, { status: 500 });
    }

    signedUploads.push({
      name: file.name,
      path,
      size: file.size,
      token: data.token,
      type: file.type,
    });
  }

  return NextResponse.json({ uploads: signedUploads });
}

function validateFile(file: RequestedFile) {
  if (!file.type || !allowedTypes.has(file.type)) {
    return "This file type is not ready for website upload. Use JPG, PNG, WebP, MP4, WebM, or MOV.";
  }

  if (!file.size || file.size <= 0) {
    return "This file could not be read. Try exporting a fresh copy and upload again.";
  }

  if (file.type.startsWith("image/") && file.size > maxImageBytes) {
    return "This image is still too large after preparation. Try exporting a smaller copy.";
  }

  if (file.type.startsWith("video/") && file.size > maxVideoBytes) {
    return "This video is too large for the current storage limit. Use a shorter clip under 50MB.";
  }

  return null;
}

function getExtension(name: string, type: string) {
  const fromName = name.split(".").pop()?.toLowerCase();

  if (fromName && /^[a-z0-9]+$/.test(fromName)) {
    return fromName === "jpeg" ? "jpg" : fromName;
  }

  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  if (type === "video/webm") return "webm";
  if (type === "video/quicktime") return "mov";
  if (type === "video/mp4") return "mp4";
  return "jpg";
}
