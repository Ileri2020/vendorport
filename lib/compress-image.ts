import imageCompression from "browser-image-compression";

const MAX_IMAGE_BYTES = 100 * 1024;
const TARGET_SIZE_MB = 0.095;

/** Preserve small originals; convert oversized images to a WebP under 100 KB. */
export async function prepareImageForUpload(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please select an image file");
  }

  if (file.size < MAX_IMAGE_BYTES) {
    return file;
  }

  const attempts = [
    { maxWidthOrHeight: 1920, initialQuality: 0.8 },
    { maxWidthOrHeight: 1280, initialQuality: 0.7 },
    { maxWidthOrHeight: 900, initialQuality: 0.6 },
    { maxWidthOrHeight: 640, initialQuality: 0.5 },
  ];

  for (const attempt of attempts) {
    const compressed = await imageCompression(file, {
      maxSizeMB: TARGET_SIZE_MB,
      maxWidthOrHeight: attempt.maxWidthOrHeight,
      initialQuality: attempt.initialQuality,
      fileType: "image/webp",
      useWebWorker: true,
    });

    if (compressed.size < MAX_IMAGE_BYTES) {
      return new File(
        [compressed],
        `${file.name.replace(/\.[^/.]+$/, "")}.webp`,
        { type: "image/webp", lastModified: Date.now() },
      );
    }
  }

  throw new Error("Image could not be compressed below 100 KB. Please choose a smaller image.");
}
