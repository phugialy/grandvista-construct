"use client";

import { UploadCloud, X } from "lucide-react";
import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { prepareImageFile } from "@/lib/prepare-image-file";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const inputClass =
  "min-h-12 border border-ink/14 bg-white p-4 text-base text-ink outline-none transition placeholder:text-steel/70 focus:border-navy";

export function ImageUploadField({ defaultUrl, name }: { defaultUrl?: string | null; name: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(defaultUrl ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: File[]) {
    const file = files[0];

    if (!file) {
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const prepared = await prepareImageFile(file);

      const signResponse = await fetch("/admin/media/upload/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: [{ name: prepared.name, size: prepared.size, type: prepared.type }] }),
      });
      const signResult = (await signResponse.json()) as {
        error?: string;
        uploads?: Array<{ path: string; size: number; token: string; type: string }>;
      };
      const upload = signResult.uploads?.[0];

      if (!signResponse.ok || !upload) {
        throw new Error(signResult.error ?? "Upload failed.");
      }

      const supabase = getSupabaseBrowserClient();
      const { error: uploadError } = await supabase.storage
        .from("grandvista-media")
        .uploadToSignedUrl(upload.path, upload.token, prepared, { contentType: prepared.type });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      const completeResponse = await fetch("/admin/media/upload/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uploads: [{ path: upload.path, size: upload.size, type: upload.type }] }),
      });
      const completeResult = (await completeResponse.json()) as {
        error?: string;
        uploaded?: Array<{ public_url: string }>;
      };
      const asset = completeResult.uploaded?.[0];

      if (!completeResponse.ok || !asset) {
        throw new Error(completeResult.error ?? "Upload failed.");
      }

      setUrl(asset.public_url);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed. Try again.");
    } finally {
      setBusy(false);
    }
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();

    if (busy) {
      return;
    }

    void handleFiles(Array.from(event.dataTransfer.files ?? []));
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    void handleFiles(Array.from(event.target.files ?? []));
  }

  return (
    <div className="grid gap-3">
      <input name={name} type="hidden" value={url} />

      {url ? (
        <div className="relative overflow-hidden border border-ink/12 bg-ink">
          {/* eslint-disable-next-line @next/next/no-img-element -- small admin preview, not a page asset */}
          <img alt="" className="h-40 w-full object-cover" src={url} />
          <button
            aria-label="Remove image"
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center bg-ink/70 text-white hover:bg-brand-red"
            onClick={() => setUrl("")}
            type="button"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <label
          className="grid cursor-pointer place-items-center border border-dashed border-ink/24 bg-warm-white p-6 text-center hover:border-brand-red"
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
        >
          <UploadCloud className="mb-2 text-brand-red" size={24} />
          <span className="text-sm font-black uppercase tracking-[0.08em] text-navy">
            {busy ? "Uploading..." : "Drop or Choose Image"}
          </span>
          <span className="mt-1 text-xs font-bold text-steel">JPG, PNG, WebP, or HEIC, up to 8MB.</span>
          <input
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
            className="hidden"
            disabled={busy}
            onChange={handleChange}
            ref={inputRef}
            type="file"
          />
        </label>
      )}

      {error ? <p className="text-sm font-bold text-brand-red">{error}</p> : null}

      <label className="grid gap-2 text-xs font-bold text-steel">
        Or paste an image URL directly
        <input
          className={inputClass}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://..."
          type="url"
          value={url}
        />
      </label>
    </div>
  );
}
