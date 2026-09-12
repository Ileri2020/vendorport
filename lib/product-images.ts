export const PLATFORM_LOGO = "/logo.png";
export const PLACEHOLDER_IMAGE = "/placeholderFemale.webp";
const UNAVAILABLE_CLOUDINARY_CLOUDS = new Set<string>([]);

function isUnavailableImage(value: string): boolean {
  return [...UNAVAILABLE_CLOUDINARY_CLOUDS].some((cloudName) => value.includes(`res.cloudinary.com/${cloudName}/`));
}

export function getProductImageUrl(value: string, width = 600): string {
  if (!value || !value.includes("res.cloudinary.com/") || !value.includes("/image/upload/")) return value;

  const [base, query] = value.split("?", 2);
  if (base.includes("/f_auto,q_auto,w_") || base.includes("/c_fill,g_auto,w_")) return value;

  const transformed = base.replace("/image/upload/", `/image/upload/c_limit,w_${width},q_auto:good,f_auto/`);
  return query ? `${transformed}?${query}` : transformed;
}

export function getOptimizedImageUrl(value: string, width: number): string {
  if (!value || !value.includes("res.cloudinary.com/") || !value.includes("/image/upload/")) return value;

  const [base, query] = value.split("?", 2);
  if (base.includes("/c_limit,w_") || base.includes("/f_auto,q_auto")) return value;

  const transformed = base.replace("/image/upload/", `/image/upload/c_limit,w_${width},q_auto:good,f_auto/`);
  return query ? `${transformed}?${query}` : transformed;
}

export function normalizeProductImageList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  const seen = new Set<string>();
  const cleaned: string[] = [];

  for (const item of value) {
    const url = typeof item === "string" ? item.trim() : "";
    if (!url || seen.has(url)) continue;

    cleaned.push(url);
    seen.add(url);
  }

  return cleaned;
}

export function getProductImageCandidates(product: any): string[] {
  if (!product) return [PLATFORM_LOGO];

  const thumbnails = normalizeProductImageList(product?.thumbnailUrls);
  const images = normalizeProductImageList(product?.images).map((url) => getProductImageUrl(url, 400));
  const singleImage = normalizeProductImageList(product?.image ? [product.image] : []).map((url) => getProductImageUrl(url, 400));
  const coverImage = normalizeProductImageList(product?.coverImage ? [product.coverImage] : []).map((url) => getProductImageUrl(url, 400));

  const candidates = [
    ...thumbnails,
    ...images,
    ...singleImage,
    ...coverImage,
    PLATFORM_LOGO,
    PLACEHOLDER_IMAGE,
  ];

  return [...new Set(candidates.filter((url) => typeof url === "string" && url.trim() !== "" && !isUnavailableImage(url)))];
}
