export function getSafeAuthReturnUrl(input?: string | null, fallback = "/") {
  const value = input?.trim();

  if (value?.startsWith("/")) {
    return value.startsWith("//") ? `/${value.replace(/^\/+/, "")}` : value;
  }

  if (!value) {
    if (!fallback) return "/";

    if (fallback.startsWith("/")) {
      return fallback.startsWith("//") ? `/${fallback.replace(/^\/+/, "")}` : fallback;
    }

    try {
      const fallbackUrl = new URL(fallback);
      return new URL("/", fallbackUrl.origin).toString();
    } catch {
      return "/";
    }
  }

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
      return url.toString();
    }
  } catch {
    // Falls back to the site fallback if the input is malformed.
  }

  if (!fallback) return "/";

  if (fallback.startsWith("/")) {
    return fallback.startsWith("//") ? `/${fallback.replace(/^\/+/, "")}` : fallback;
  }

  try {
    const fallbackUrl = new URL(fallback);
    return new URL("/", fallbackUrl.origin).toString();
  } catch {
    return "/";
  }
}
