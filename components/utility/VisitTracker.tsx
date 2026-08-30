"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAppContext } from "@/hooks/useAppContext";

/**
 * VisitTracker
 * Silently POSTs a visit record to /api/visit whenever the pathname changes.
 * Works for all users — signed in or not — since it uses only browser-side info.
 * Uses sessionStorage to debounce: one record per unique path per browser session.
 */
export function VisitTracker() {
  const pathname = usePathname();
  const { currentBusiness } = useAppContext();
  const sentRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!pathname) return;

    // Get or create browser ID
    let browserId = localStorage.getItem("health-clique-browser-id");
    if (!browserId) {
      browserId = crypto.randomUUID();
      localStorage.setItem("health-clique-browser-id", browserId);
    }

    // Debounce: only send once per path per browser tab session
    const platformRoutes = new Set(["/", "/home", "/store", "/jobs", "/about", "/help", "/account", "/contact", "/create-store", "/new-product", "/cart", "/wishlist", "/orders", "/privacy", "/terms", "/admin", "/analytics"]);
    const businessId = platformRoutes.has(pathname) ? undefined : currentBusiness?.id;
    const key = `visit:${pathname}:${businessId || "platform"}`;
    if (sentRef.current.has(key)) return;
    sentRef.current.add(key);

    // Fire-and-forget — never block the page
    try {
      fetch("/api/visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: pathname, browserId, businessId }),
        // keepalive so it completes even if the user navigates away
        keepalive: true,
      }).catch(() => {}); // swallow errors silently
    } catch {
      // noop
    }

  }, [pathname, currentBusiness?.id]);

  return null; // renders nothing
}
