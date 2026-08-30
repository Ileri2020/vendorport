"use client";

/**
 * BusinessContextProvider
 *
 * A thin client boundary that receives the server-fetched business object
 * and sets it in AppContext so all deeply nested client components
 * (Hero, FeaturedProducts, StoreNavbar, etc.) can access currentBusiness
 * without triggering any additional DB fetches.
 *
 * This is the bridge between server-side data fetching and client-side context.
 */

import { useEffect } from "react";
import { useTheme } from "next-themes";
import { useAppContext } from "@/hooks/useAppContext";

interface Props {
  business: any;
  children: React.ReactNode;
}

function BusinessInjector({ business }: { business: any }) {
  const { setCurrentBusiness, currentBusiness } = useAppContext();
  const { setTheme } = useTheme();
  const cacheKey = business?.slug ? `storefront.business.${business.slug}` : null;

  useEffect(() => {
    if (!business?.slug || typeof window === "undefined") return;

    if (!currentBusiness?.id) {
      const cached = window.localStorage.getItem(cacheKey!);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setCurrentBusiness(parsed);
        } catch (error) {
          console.warn("Failed to parse cached business", error);
        }
      }
    }
  }, [business?.slug, currentBusiness?.id, setCurrentBusiness, cacheKey]);

  useEffect(() => {
    // Only update if business actually changed (prevents infinite re-renders)
    if (business === null && currentBusiness !== null) {
      setCurrentBusiness(null);
    } else if (business && business.id !== currentBusiness?.id) {
      setCurrentBusiness(business);
    }
  }, [business, currentBusiness, setCurrentBusiness]);

  useEffect(() => {
    if (!business?.slug || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(cacheKey!, JSON.stringify(business));
    } catch (error) {
      console.warn("Failed to cache current business", error);
    }
  }, [business, cacheKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const userThemePreference = window.localStorage.getItem("vport-user-theme-preference");
    const businessTheme = business?.siteSettings?.defaultTheme;
    if (!userThemePreference && (businessTheme === "light" || businessTheme === "dark")) {
      setTheme(businessTheme);
    }
  }, [business?.siteSettings?.defaultTheme, setTheme]);

  return null;
}

export default function BusinessContextProvider({ business, children }: Props) {
  return (
    <>
      <BusinessInjector business={business} />
      {children}
    </>
  );
}
