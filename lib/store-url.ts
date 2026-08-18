const slugifyStoreName = (name: string) =>
  name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

export function getStoreUrl(name: string) {
  const slug = slugifyStoreName(name);
  const configuredDomain = process.env.NEXT_PUBLIC_STORE_DOMAIN?.trim();
  let storeDomain = configuredDomain;

  if (!storeDomain && typeof window !== "undefined") {
    const hostname = window.location.hostname.replace(/^www\./, "");
    storeDomain = hostname === "localhost" || hostname === "127.0.0.1"
      ? `${hostname}:${window.location.port || "3000"}`
      : hostname;
  }

  if (!storeDomain) return `/${slug}`;

  const protocol = storeDomain.includes("localhost") || storeDomain.startsWith("127.0.0.1") ? "http" : "https";
  return `${protocol}://${slug}.${storeDomain.replace(/^https?:\/\//, "").replace(/\/$/, "")}`;
}