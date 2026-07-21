"use client";

import { useEffect } from "react";
import { useAppContext } from "@/hooks/useAppContext";

/**
 * Injects business-specific accent colors into CSS variables
 * so they override the global defaults in globals.css
 * 
 * Uses light mode colors by default, dark mode colors when dark class is present
 */
const ColorInjector: React.FC = () => {
  const { currentBusiness } = useAppContext();

  useEffect(() => {
    if (!currentBusiness?.siteSettings) return;

    const {
      accentLight,
      accentDark,
      accentSecondaryLight,
      accentSecondaryDark,
      accentForegroundLight,
      accentForegroundDark,
    } = currentBusiness.siteSettings;

    const root = document.documentElement;

    // Apply light mode colors to root (default, light mode)
    if (accentLight) root.style.setProperty("--accent", accentLight);
    if (accentSecondaryLight) root.style.setProperty("--accent-secondary", accentSecondaryLight);
    if (accentForegroundLight) root.style.setProperty("--accent-foreground", accentForegroundLight);

    // Listen for dark mode changes and update accordingly
    const updateDarkModeColors = () => {
      const isDark = root.classList.contains("dark");
      if (isDark) {
        if (accentDark) root.style.setProperty("--accent", accentDark);
        if (accentSecondaryDark) root.style.setProperty("--accent-secondary", accentSecondaryDark);
        if (accentForegroundDark) root.style.setProperty("--accent-foreground", accentForegroundDark);
      } else {
        if (accentLight) root.style.setProperty("--accent", accentLight);
        if (accentSecondaryLight) root.style.setProperty("--accent-secondary", accentSecondaryLight);
        if (accentForegroundLight) root.style.setProperty("--accent-foreground", accentForegroundLight);
      }
    };

    // Watch for dark class changes using MutationObserver
    const observer = new MutationObserver(updateDarkModeColors);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });

    return () => observer.disconnect();
  }, [currentBusiness?.siteSettings]);

  return null;
};

export default ColorInjector;
