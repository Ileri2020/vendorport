export function getSafeAuthReturnUrl(input?: string | null, fallback = "/") {
  const value = input?.trim();

  if (value) {
    try {
      const url = new URL(value);
      const hostname = url.hostname.replace(/^www\./, "");
      const isAllowedHost =
        hostname === "vport.store" ||
        hostname.endsWith(".vport.store") ||
        hostname === "localhost" ||
        hostname === "127.0.0.1" ||
        hostname.endsWith(".localhost") ||
        hostname.endsWith(".127.0.0.1");

      if (isAllowedHost && ["http:", "https:"].includes(url.protocol)) {
        const path = `${url.pathname}${url.search}${url.hash}`;
        return path && path !== "/" ? path : "/";
      }
    } catch {
      // Ignore malformed URL input and fall through.
    }
  }

  if (value?.startsWith("/")) {
    return value.startsWith("//") ? `/${value.replace(/^\/+/, "")}` : value;
  }

  if (!fallback) return "/";

  if (fallback.startsWith("/")) {
    return fallback.startsWith("//") ? `/${fallback.replace(/^\/+/, "")}` : fallback;
  }

  try {
    const fallbackUrl = new URL(fallback);
    const path = `${fallbackUrl.pathname}${fallbackUrl.search}${fallbackUrl.hash}`;
    return path && path !== "/" ? path : "/";
  } catch {
    return "/";
  }
}
