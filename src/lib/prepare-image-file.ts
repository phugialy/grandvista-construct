const maxImageSide = 2400;
const imageQuality = 0.91;
const iPhoneImageTypes = new Set(["image/heic", "image/heif"]);

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
    throw new Error(`${file.name} could not be prepared. Try exporting it as a JPG.`);
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

/** Converts iPhone HEIC/HEIF to JPEG and downsizes oversized images before upload. */
export async function prepareImageFile(file: File) {
  if (isIPhoneImage(file)) {
    const converted = await convertIPhoneImage(file);
    return resizeRasterImage(converted);
  }

  if (!file.type.startsWith("image/") || file.size < 2800 * 1024) {
    return file;
  }

  return resizeRasterImage(file);
}
