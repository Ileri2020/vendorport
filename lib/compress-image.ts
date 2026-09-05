import imageCompression from "browser-image-compression";

const DEFAULT_MAX_BYTES = 100 * 1024;
const THUMBNAIL_MAX_BYTES = 20 * 1024;

/** Preserve small originals; convert oversized images to a WebP under the target size. */
export async function prepareImageForUpload(file: File, maxBytes = DEFAULT_MAX_BYTES): Promise<File> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please select an image file");
  }

  if (file.size < maxBytes) {
    return file;
  }

  const targetSizeMb = Math.min(Math.max((maxBytes / (1024 * 1024)) * 0.9, 0.05), 0.2);
  const attempts = [
    { maxWidthOrHeight: 1920, initialQuality: 0.8 },
    { maxWidthOrHeight: 1600, initialQuality: 0.72 },
    { maxWidthOrHeight: 1280, initialQuality: 0.64 },
    { maxWidthOrHeight: 900, initialQuality: 0.56 },
    { maxWidthOrHeight: 640, initialQuality: 0.48 },
  ];

  for (const attempt of attempts) {
    const compressed = await imageCompression(file, {
      maxSizeMB: targetSizeMb,
      maxWidthOrHeight: attempt.maxWidthOrHeight,
      initialQuality: attempt.initialQuality,
      fileType: "image/webp",
      useWebWorker: true,
    });

    if (compressed.size < maxBytes) {
      return new File(
        [compressed],
        `${file.name.replace(/\.[^/.]+$/, "")}.webp`,
        { type: "image/webp", lastModified: Date.now() },
      );
    }
  }

  throw new Error(`Image could not be compressed below ${Math.round(maxBytes / 1024)} KB. Please choose a smaller image.`);
}

export async function prepareThumbnailForUpload(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please select an image file");
  }

  const attempts = [
    { maxWidthOrHeight: 480, initialQuality: 0.62 },
    { maxWidthOrHeight: 360, initialQuality: 0.52 },
    { maxWidthOrHeight: 280, initialQuality: 0.42 },
    { maxWidthOrHeight: 220, initialQuality: 0.34 },
    { maxWidthOrHeight: 160, initialQuality: 0.26 },
  ];

  for (const attempt of attempts) {
    const compressed = await imageCompression(file, {
      maxSizeMB: THUMBNAIL_MAX_BYTES / (1024 * 1024),
      maxWidthOrHeight: attempt.maxWidthOrHeight,
      initialQuality: attempt.initialQuality,
      fileType: "image/webp",
      useWebWorker: true,
    });

    if (compressed.size < THUMBNAIL_MAX_BYTES) {
      return new File(
        [compressed],
        `${file.name.replace(/\.[^/.]+$/, "")}-thumbnail.webp`,
        { type: "image/webp", lastModified: Date.now() },
      );
    }
  }

  throw new Error("Image thumbnail could not be compressed below 20 KB. Please choose a simpler image.");
}
