export const PLATFORM_LOGO = "/logo.png";
export const PLACEHOLDER_IMAGE = "/placeholderFemale.webp";

/**
 * Cloudinary cloud names that are known to return 401 / 403 for public access.
 * Images hosted on these clouds are skipped immediately without browser fetch attempts.
 * dplw2vykw = old cloud where original product images were uploaded before migration.
 */
const UNAVAILABLE_CLOUDINARY_CLOUDS = new Set<string>(["dplw2vykw"]);

function isUnavailableImage(value: string): boolean {
  if (!value) return false;
  for (const cloudName of UNAVAILABLE_CLOUDINARY_CLOUDS) {
    if (value.includes(`res.cloudinary.com/${cloudName}/`)) return true;
  }
  return false;
}

export function getProductImageUrl(value: string, width = 400): string {
  if (!value || typeof value !== "string" || !value.includes("res.cloudinary.com/") || !value.includes("/image/upload/")) return value;

  const [base, query] = value.split("?", 2);
  
  if (base.includes(`/c_limit,w_${width}`) || base.includes(`/w_${width},`)) {
    return value;
  }

  let transformed = base;
  if (base.includes("/upload/c_") || base.includes("/upload/v1/")) {
    transformed = base.replace(/\/image\/upload\/(?:c_[^/]+\/)?/, `/image/upload/c_limit,w_${width},q_auto:good,f_auto/`);
  } else {
    transformed = base.replace("/image/upload/", `/image/upload/c_limit,w_${width},q_auto:good,f_auto/`);
  }

  return query ? `${transformed}?${query}` : transformed;
}

export function getOptimizedImageUrl(value: string, width = 400): string {
  return getProductImageUrl(value, width);
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
