"use client";

import { UploadCloud } from "lucide-react";
import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const maxImageSide = 2400;
const imageQuality = 0.91;
const maxVideoBytes = 50 * 1024 * 1024;
const maxFilesPerBatch = 20;
const iPhoneImageTypes = new Set(["image/heic", "image/heif"]);

type UploadState = {
  message: string;
  tone: "neutral" | "success" | "error";
};

export function MediaUploader() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<UploadState>({
    message: "Choose images or short clips. Large images will be prepared for web automatically.",
    tone: "neutral",
  });
  const [busy, setBusy] = useState(false);

  async function uploadFiles(event: ChangeEvent<HTMLInputElement>) {
    await uploadSelectedFiles(Array.from(event.target.files ?? []));
  }

  async function uploadSelectedFiles(selectedFiles: File[]) {
    if (selectedFiles.length === 0) {
      return;
    }

    if (selectedFiles.length > maxFilesPerBatch) {
      setState({ message: `Choose up to ${maxFilesPerBatch} files at one time.`, tone: "error" });
      inputRef.current?.form?.reset();
      return;
    }

    setBusy(true);
    setState({ message: `Preparing ${selectedFiles.length} file${selectedFiles.length === 1 ? "" : "s"} for the website...`, tone: "neutral" });

    try {
      const preparedFiles = [];

      for (const file of selectedFiles) {
        const prepared = await prepareFile(file);
        preparedFiles.push(prepared);
      }

      const signResponse = await fetch("/admin/media/upload/sign", {
        method: "POST",
        body: JSON.stringify({
          files: preparedFiles.map((file) => ({
            name: file.name,
            size: file.size,
            type: file.type,
          })),
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const signResult = (await signResponse.json()) as {
        error?: string;
        uploads?: Array<{ path: string; size: number; token: string; type: string }>;
      };

      if (!signResponse.ok || !signResult.uploads) {
        throw new Error(signResult.error ?? "Upload failed.");
      }

      const supabase = getSupabaseBrowserClient();

      for (const [index, upload] of signResult.uploads.entries()) {
        const file = preparedFiles[index];

        if (!file) {
          throw new Error("Upload preparation failed. Try again.");
        }

        const { error } = await supabase.storage
          .from("grandvista-media")
          .uploadToSignedUrl(upload.path, upload.token, file, {
            contentType: file.type,
          });

        if (error) {
          throw new Error(`${file.name} could not upload to storage. ${error.message}`);
        }
      }

      const completeResponse = await fetch("/admin/media/upload/complete", {
        method: "POST",
        body: JSON.stringify({
          uploads: signResult.uploads.map((upload) => ({
            path: upload.path,
            size: upload.size,
            type: upload.type,
          })),
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const result = (await completeResponse.json()) as { error?: string; uploaded?: unknown[] };

      if (!completeResponse.ok) {
        throw new Error(result.error ?? "Upload failed.");
      }

      setState({
        message: `${result.uploaded?.length ?? 0} file${result.uploaded?.length === 1 ? "" : "s"} uploaded and ready.`,
        tone: "success",
      });
      inputRef.current?.form?.reset();
      window.location.reload();
    } catch (error) {
      setState({
        message: error instanceof Error ? error.message : "Upload failed. Try again.",
        tone: "error",
      });
    } finally {
      setBusy(false);
    }
  }

  async function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();

    if (busy) {
      return;
    }

    await uploadSelectedFiles(Array.from(event.dataTransfer.files ?? []));
  }

  return (
    <form className="border border-ink/12 bg-white p-6">
      <p className="text-sm font-black uppercase tracking-[0.12em] text-brand-red">Upload jobsite proof</p>
      <h2 className="mt-3 text-3xl font-black">Add images and short clips</h2>
      <p className="mt-3 leading-7 text-steel">
        The portal prepares oversized images and iPhone photos before upload. Video uploads go directly to storage so
        larger clips do not overload the website server.
      </p>

      <label
        className="mt-6 grid cursor-pointer place-items-center border border-dashed border-ink/24 bg-warm-white p-8 text-center hover:border-brand-red"
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      >
        <UploadCloud className="mb-3 text-brand-red" size={32} />
        <span className="text-sm font-black uppercase tracking-[0.08em] text-navy">
          {busy ? "Uploading..." : "Drop or Choose Media"}
        </span>
        <span className="mt-2 text-sm font-bold text-steel">
          Up to {maxFilesPerBatch} files: JPG, PNG, WebP, HEIC, HEIF, MP4, WebM, or MOV. Videos up to 50MB.
        </span>
        <input
          ref={inputRef}
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif,video/mp4,video/webm,video/quicktime"
          className="hidden"
          disabled={busy}
          multiple
          onChange={uploadFiles}
          type="file"
        />
      </label>

      <p className={`mt-4 text-sm font-bold ${state.tone === "error" ? "text-brand-red" : state.tone === "success" ? "text-navy" : "text-steel"}`}>
        {state.message}
      </p>
    </form>
  );
}

async function prepareFile(file: File) {
  if (file.type.startsWith("video/")) {
    if (file.size > maxVideoBytes) {
      throw new Error(`${file.name} is too large for the current storage limit. Use a shorter clip under 50MB.`);
    }

    return file;
  }

  if (isIPhoneImage(file)) {
    const converted = await convertIPhoneImage(file);
    return resizeRasterImage(converted);
  }

  if (!file.type.startsWith("image/") || file.size < 2800 * 1024) {
    return file;
  }

  return resizeRasterImage(file);
}

function isIPhoneImage(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();
  return iPhoneImageTypes.has(file.type) || extension === "heic" || extension === "heif";
}

async function convertIPhoneImage(file: File) {
  try {
    const { default: heic2any } = await import("heic2any");
    const output = await heic2any({
      blob: file,
      toType: "image/jpeg",
      quality: imageQuality,
    });
    const blob = Array.isArray(output) ? output[0] : output;

    if (!blob) {
      throw new Error("No converted image was returned.");
    }

    return new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } catch (error) {
    console.error("iPhone image conversion failed", error);
    throw new Error(`${file.name} could not be prepared. Try one iPhone photo at a time, or export it as a JPG.`);
  }
}

async function resizeRasterImage(file: File) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxImageSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);

  const context = canvas.getContext("2d");

  if (!context) {
    return file;
  }

  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", imageQuality));

  if (!blob) {
    return file;
  }

  return new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}
