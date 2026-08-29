const slugifyStoreName = (name: string) =>
  name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

export function getStoreUrl(name: string, path = "") {
  const slug = slugifyStoreName(name);
  const configuredDomain = process.env.NEXT_PUBLIC_STORE_DOMAIN?.trim();
  let storeDomain = configuredDomain;

  if (!storeDomain && typeof window !== "undefined") {
    const hostname = window.location.hostname.replace(/^www\./, "");
    storeDomain = hostname === "localhost" || hostname === "127.0.0.1"
      ? `${hostname}:${window.location.port || "3000"}`
      : hostname;
  }

  const normalizedPath = path ? `/${path.replace(/^\/+/, "")}` : "";
  if (!storeDomain) return `/${slug}${normalizedPath}`;

  const protocol = storeDomain.includes("localhost") || storeDomain.startsWith("127.0.0.1") ? "http" : "https";
  const normalizedDomain = storeDomain
    .replace(/^https?:\/\//, "")
    .replace(/^\*\./, "")
    .replace(/\/$/, "");

  // A deployment may configure the current store host itself, for example
  // `bokku.vport.store`. Do not prepend the same store slug twice.
  const qualifiedDomain = normalizedDomain === slug || normalizedDomain.startsWith(`${slug}.`)
    ? normalizedDomain
    : `${slug}.${normalizedDomain}`;

  return `${protocol}://${qualifiedDomain}${normalizedPath}`;
}