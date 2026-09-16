// Uploads photos already downloaded locally (via Claude's connected Google Drive
// session tool) into a project's media. Not a standalone Drive integration — Claude
// fetches the files from Drive first (search_files + download_file_content), writes
// them to disk, builds the manifest, then runs this to do the Supabase side.
//
// Usage:
//   node --env-file=.env.local scripts/import-drive-photos.mjs --project <slug> --manifest <manifest.json> [--folder-url <url>]
//
// manifest.json: [{ "driveFileId": "...", "name": "photo1.jpg", "mimeType": "image/jpeg", "localPath": "/path/to/photo1.jpg" }, ...]
//
// Safe to re-run: any driveFileId already in media_assets.source_drive_file_id is skipped.

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

function getArg(name) {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

const projectSlug = getArg("project");
const manifestPath = getArg("manifest");
const folderUrl = getArg("folder-url");

if (!projectSlug || !manifestPath) {
  console.error("Usage: node import-drive-photos.mjs --project <slug> --manifest <manifest.json> [--folder-url <url>]");
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const bucket = "grandvista-media";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: project, error: projectError } = await supabase
  .from("projects")
  .select("id")
  .eq("slug", projectSlug)
  .single();

if (projectError || !project) {
  console.error(`Project not found for slug "${projectSlug}".`, projectError?.message);
  process.exit(1);
}

if (folderUrl) {
  await supabase.from("projects").update({ drive_folder_url: folderUrl }).eq("id", project.id);
}

const { data: existingAssets } = await supabase
  .from("media_assets")
  .select("source_drive_file_id")
  .in(
    "source_drive_file_id",
    manifest.map((file) => file.driveFileId),
  );
const alreadyImported = new Set((existingAssets ?? []).map((row) => row.source_drive_file_id));

const { data: existingMedia } = await supabase
  .from("project_media")
  .select("role,sort_order")
  .eq("project_id", project.id);
let hasHero = (existingMedia ?? []).some((row) => row.role === "hero");
let nextSortOrder = (existingMedia ?? []).reduce((max, row) => Math.max(max, row.sort_order + 1), 20);

let imported = 0;

for (const file of manifest) {
  if (alreadyImported.has(file.driveFileId)) {
    console.log(`Skipping already-imported: ${file.name}`);
    continue;
  }

  const bytes = readFileSync(file.localPath);
  const extension = file.name.split(".").pop() || "jpg";
  const storagePath = `uploads/${new Date().getFullYear()}/drive-${file.driveFileId}.${extension}`;

  const { error: uploadError } = await supabase.storage.from(bucket).upload(storagePath, bytes, {
    contentType: file.mimeType,
    upsert: false,
  });

  if (uploadError) {
    console.error(`Upload failed for "${file.name}":`, uploadError.message);
    continue;
  }

  const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(storagePath);
  const { data: asset, error: assetError } = await supabase
    .from("media_assets")
    .insert({
      bucket,
      storage_path: storagePath,
      public_url: publicUrlData.publicUrl,
      media_type: "image",
      mime_type: file.mimeType,
      file_size: bytes.length,
      alt_text: file.name,
      status: "ready",
      source_drive_file_id: file.driveFileId,
    })
    .select("id,public_url")
    .single();

  if (assetError || !asset) {
    console.error(`Asset insert failed for "${file.name}":`, assetError?.message);
    continue;
  }

  const isHero = !hasHero;

  await supabase.from("project_media").insert({
    project_id: project.id,
    media_asset_id: asset.id,
    media_type: "image",
    role: isHero ? "hero" : "gallery",
    url: asset.public_url,
    alt: file.name,
    sort_order: isHero ? 10 : nextSortOrder++,
  });

  if (isHero) hasHero = true;
  imported += 1;
  console.log(`Imported: ${file.name}`);
}

console.log(`Done. Imported ${imported} new file(s) of ${manifest.length} listed.`);
