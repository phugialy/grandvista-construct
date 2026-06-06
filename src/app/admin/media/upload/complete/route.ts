import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

const bucket = "grandvista-media";
const allowedTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

type CompletedUpload = {
  path?: string;
  size?: number;
  type?: string;
};

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Admin access required." }, { status: 401 });
  }

  const { altText, tag, uploads } = (await request.json()) as {
    altText?: string;
    tag?: string;
    uploads?: CompletedUpload[];
  };

  if (!uploads?.length) {
    return NextResponse.json({ error: "No completed uploads were received." }, { status: 400 });
  }

  const supabase = getSupabaseServiceClient();
  const rows = [];

  for (const upload of uploads) {
    if (!upload.path?.startsWith("uploads/") || !upload.type || !allowedTypes.has(upload.type) || !upload.size) {
      return NextResponse.json({ error: "One upload could not be saved. Try again." }, { status: 400 });
    }

    const { data: publicUrl } = supabase.storage.from(bucket).getPublicUrl(upload.path);

    rows.push({
      alt_text: altText?.trim() || null,
      bucket,
      file_size: upload.size,
      media_type: upload.type.startsWith("video/") ? "video" : "image",
      mime_type: upload.type,
      public_url: publicUrl.publicUrl,
      status: "ready",
      storage_path: upload.path,
      tags: tag?.trim() ? [tag.trim()] : [],
    });
  }

  const { data, error } = await supabase
    .from("media_assets")
    .insert(rows)
    .select("id,public_url,media_type,file_size");

  if (error) {
    console.error("Media asset complete failed", error);
    return NextResponse.json({ error: "Uploaded, but the media library could not save it." }, { status: 500 });
  }

  return NextResponse.json({ uploaded: data ?? [] });
}
