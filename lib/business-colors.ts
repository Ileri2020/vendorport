export const COLOR_OVERRIDES_CHANGED_EVENT = "hcvp-business-colors-changed";

export type BusinessColorOverrides = {
  accentLight?: string;
  accentDark?: string;
  accentSecondaryLight?: string;
  accentSecondaryDark?: string;
  accentForegroundLight?: string;
  accentForegroundDark?: string;
};

const storageKey = (businessKey: string) => `hcvp-business-colors:${businessKey}`;

export function getBusinessColorOverrides(businessKey: string): BusinessColorOverrides | null {
  if (typeof window === "undefined") return null;
  try {
    const value = JSON.parse(localStorage.getItem(storageKey(businessKey)) || "null");
    return value && typeof value === "object" ? value : null;
  } catch {
    return null;
  }
}

export function saveBusinessColorOverrides(businessKey: string, colors: BusinessColorOverrides) {
  localStorage.setItem(storageKey(businessKey), JSON.stringify(colors));
  window.dispatchEvent(new Event(COLOR_OVERRIDES_CHANGED_EVENT));
}