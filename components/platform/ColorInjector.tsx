"use client";

import { useEffect } from "react";
import { useAppContext } from "@/hooks/useAppContext";
import { getBusinessColorOverrides, COLOR_OVERRIDES_CHANGED_EVENT } from "@/lib/business-colors";

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
      primary: "45 93% 62%",
      accent: "8365 100% 37%",
      accentSecondary: "43 96% 56%",
      accentForeground: "222 47% 12%",
    };

    const businessKey = activeBusiness?.id || activeBusiness?.name;
    const applyColors = () => {
      const isDark = root.classList.contains("dark");
      const settings = activeBusiness?.siteSettings;
      const localColors = businessKey ? getBusinessColorOverrides(String(businessKey)) : null;
      const colors = {
        accent: isDark ? settings?.accentDark : settings?.accentLight,
        accentSecondary: isDark ? settings?.accentSecondaryDark : settings?.accentSecondaryLight,
        accentForeground: isDark ? settings?.accentForegroundDark : settings?.accentForegroundLight,
      };
      const accent = localColors?.[isDark ? "accentDark" : "accentLight"] || colors.accent || platformColors.accent;
      const accentSecondary = localColors?.[isDark ? "accentSecondaryDark" : "accentSecondaryLight"] || colors.accentSecondary || platformColors.accentSecondary;
      root.style.setProperty("--accent", accent);
      root.style.setProperty("--accent-secondary", accentSecondary);
      root.style.setProperty("--accent-foreground", localColors?.[isDark ? "accentForegroundDark" : "accentForegroundLight"] || colors.accentForeground || platformColors.accentForeground);
    };

    if (!activeBusiness?.siteSettings && !businessKey) {
      root.style.setProperty("--accent", platformColors.accent);
      root.style.setProperty("--accent-secondary", platformColors.accentSecondary);
      root.style.setProperty("--primary", platformColors.primary);
      root.style.setProperty("--accent-foreground", platformColors.accentForeground);
      return;
    }

    applyColors();

    // Listen for dark mode changes and update accordingly
    const updateDarkModeColors = () => {
      applyColors();
    };

    // Watch for dark class changes using MutationObserver
    const observer = new MutationObserver(updateDarkModeColors);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    window.addEventListener(COLOR_OVERRIDES_CHANGED_EVENT, applyColors);

    return () => {
      observer.disconnect();
      window.removeEventListener(COLOR_OVERRIDES_CHANGED_EVENT, applyColors);
      root.style.setProperty("--accent", platformColors.accent);
      root.style.setProperty("--accent-secondary", platformColors.accentSecondary);
      root.style.setProperty("--accent-foreground", platformColors.accentForeground);
    };
  }, [activeBusiness?.id, activeBusiness?.name, activeBusiness?.siteSettings]);

  return null;
};

export default ColorInjector;
