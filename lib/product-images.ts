export const PLATFORM_LOGO = "/logo.png";
export const PLACEHOLDER_IMAGE = "/placeholderFemale.webp";

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

  const candidates = [
    ...normalizeProductImageList(product?.images),
    ...normalizeProductImageList(product?.thumbnailUrls),
    ...normalizeProductImageList(product?.image ? [product.image] : []),
    ...normalizeProductImageList(product?.coverImage ? [product.coverImage] : []),
    PLATFORM_LOGO,
    PLACEHOLDER_IMAGE,
  ];

  return [...new Set(candidates.filter((url) => typeof url === "string" && url.trim() !== ""))];
}
