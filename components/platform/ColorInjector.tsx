"use client";

import { useEffect } from "react";
import { useAppContext } from "@/hooks/useAppContext";

/**
 * Injects business-specific accent colors into CSS variables
 * so they override the global defaults in globals.css
 * 
 * Uses light mode colors by default, dark mode colors when dark class is present
 */
interface ColorInjectorProps {
  business?: any | null;
}

const ColorInjector: React.FC<ColorInjectorProps> = ({ business }) => {
  const { currentBusiness } = useAppContext();
  const activeBusiness = business === undefined ? currentBusiness : business;

  useEffect(() => {
    const root = document.documentElement;
    const platformColors = {
      accent: "8365 100% 37%",
      accentSecondary: "43 96% 56%",
      accentForeground: "222 47% 12%",
    };

    if (!activeBusiness?.siteSettings) {
      root.style.setProperty("--accent", platformColors.accent);
      root.style.setProperty("--accent-secondary", platformColors.accentSecondary);
      root.style.setProperty("--accent-foreground", platformColors.accentForeground);
      return;
    }

    const {
      accentLight,
      accentDark,
      accentSecondaryLight,
      accentSecondaryDark,
      accentForegroundLight,
      accentForegroundDark,
    } = activeBusiness.siteSettings;

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

    return () => {
      observer.disconnect();
      root.style.setProperty("--accent", platformColors.accent);
      root.style.setProperty("--accent-secondary", platformColors.accentSecondary);
      root.style.setProperty("--accent-foreground", platformColors.accentForeground);
    };
  }, [activeBusiness?.siteSettings]);

  return null;
};

export default ColorInjector;
