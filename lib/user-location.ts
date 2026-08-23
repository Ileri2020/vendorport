export const USER_LOCATION_STORAGE_KEY = "hcvp-user-location";

export interface UserLocation {
  label: string;
  latitude?: number;
  longitude?: number;
  source: "browser" | "manual";
}

export function getSavedUserLocation(): UserLocation | null {
  if (typeof window === "undefined") return null;
  try {
    const value = JSON.parse(localStorage.getItem(USER_LOCATION_STORAGE_KEY) || "null");
    return value && typeof value.label === "string" ? value : null;
  } catch {
    return null;
  }
}

export function saveUserLocation(location: UserLocation) {
  localStorage.setItem(USER_LOCATION_STORAGE_KEY, JSON.stringify(location));
}

export async function getBrowserLocation(): Promise<UserLocation> {
  if (!navigator.geolocation) throw new Error("Location is not available in this browser");

  const position = await new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: false, timeout: 10000 });
  });
  const { latitude, longitude } = position.coords;
  const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
  const data = response.ok ? await response.json() : null;
  const address = data?.address || {};
  const label = [address.city || address.town || address.village || address.county, address.state]
    .filter(Boolean)
    .join(", ") || `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`;

  return { label, latitude, longitude, source: "browser" };
}

export function locationMatchesBusiness(location: UserLocation, business: any) {
  const values = [
    ...(Array.isArray(business?.siteSettings?.operatingStates) ? business.siteSettings.operatingStates : []),
    business?.siteSettings?.physicalLocation,
    business?.siteSettings?.address,
    business?.name,
  ].filter(Boolean).map((value) => String(value).toLowerCase());
  return location.label.toLowerCase().split(/[,\s]+/).filter((part) => part.length > 2).some((part) => values.some((value) => value.includes(part)));
}