import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

const bucket = "grandvista-media";
const maxImageBytes = 8 * 1024 * 1024;
const maxVideoBytes = 30 * 1024 * 1024;
const allowedTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Admin access required." }, { status: 401 });
  }

  const formData = await request.formData();
  const files = formData.getAll("files").filter((value): value is File => value instanceof File);
  const tag = getString(formData, "tag");
  const altText = getString(formData, "alt_text");

  if (files.length === 0) {
    return NextResponse.json({ error: "Choose at least one image or short video." }, { status: 400 });
  }

  const supabase = getSupabaseServiceClient();
  const uploaded = [];

  for (const file of files) {
    const validation = validateFile(file);

    if (validation) {
      return NextResponse.json({ error: validation }, { status: 400 });
    }

    const extension = getExtension(file);
    const storagePath = `uploads/${new Date().getFullYear()}/${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage.from(bucket).upload(storagePath, file, {
      contentType: file.type,
      upsert: false,
    });

    if (uploadError) {
      console.error("Media upload failed", uploadError);
      return NextResponse.json({ error: "Upload failed. Try again with fewer files." }, { status: 500 });
    }

    const { data: publicUrl } = supabase.storage.from(bucket).getPublicUrl(storagePath);
    const mediaType = file.type.startsWith("video/") ? "video" : "image";
    const { data: asset, error: insertError } = await supabase
      .from("media_assets")
      .insert({
        bucket,
        storage_path: storagePath,
        public_url: publicUrl.publicUrl,
        media_type: mediaType,
        mime_type: file.type,
        file_size: file.size,
        alt_text: altText || null,
        tags: tag ? [tag] : [],
        status: "ready",
      })
      .select("id,public_url,media_type,file_size")
      .single();

    if (insertError) {
      console.error("Media asset insert failed", insertError);
      return NextResponse.json({ error: "File uploaded, but the media library could not save it." }, { status: 500 });
    }

    uploaded.push(asset);
  }

  return NextResponse.json({ uploaded });
}

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function validateFile(file: File) {
  if (!allowedTypes.has(file.type)) {
    return "This file type is not ready for website upload. Use JPG, PNG, WebP, MP4, WebM, or MOV.";
  }

  if (file.type.startsWith("image/") && file.size > maxImageBytes) {
    return "This image is still too large after preparation. Try exporting a smaller copy.";
  }

  if (file.type.startsWith("video/") && file.size > maxVideoBytes) {
    return "This video is too large for the website. Use a shorter clip under 30MB.";
  }

  return null;
}

function getExtension(file: File) {
  const fromName = file.name.split(".").pop()?.toLowerCase();

  if (fromName && /^[a-z0-9]+$/.test(fromName)) {
    return fromName === "jpeg" ? "jpg" : fromName;
  }

  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  if (file.type === "video/webm") return "webm";
  if (file.type === "video/quicktime") return "mov";
  if (file.type === "video/mp4") return "mp4";
  return "jpg";
}
