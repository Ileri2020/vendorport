export const USER_LOCATION_STORAGE_KEY = "hcvp-user-location";
export const USER_LOCATION_PERMISSION_KEY = "hcvp-user-location-permission";
export const USER_LOCATION_CHANGED_EVENT = "hcvp-user-location-changed";
const GEOCODE_CACHE_KEY = "hcvp-business-geocode-cache";

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
  window.dispatchEvent(new CustomEvent(USER_LOCATION_CHANGED_EVENT, { detail: location }));
}

export type LocationPermissionStatus = "prompt" | "granted" | "denied" | "unavailable";

export function getLocationPermissionStatus(): LocationPermissionStatus {
  if (typeof window === "undefined") return "prompt";
  const saved = localStorage.getItem(USER_LOCATION_PERMISSION_KEY);
  if (saved === "granted" || saved === "denied" || saved === "unavailable") return saved;
  return "prompt";
}

export function saveLocationPermissionStatus(status: LocationPermissionStatus) {
  localStorage.setItem(USER_LOCATION_PERMISSION_KEY, status);
}

export async function getBrowserLocation(): Promise<UserLocation> {
  if (!navigator.geolocation) {
    saveLocationPermissionStatus("unavailable");
    throw new Error("Location is not available in this browser");
  }

  const position = await new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: false, timeout: 10000 });
  }).catch((error) => {
    saveLocationPermissionStatus(error?.code === 1 ? "denied" : "prompt");
    throw error;
  });
  saveLocationPermissionStatus("granted");
  const { latitude, longitude } = position.coords;
  const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
  const data = response.ok ? await response.json() : null;
  const address = data?.address || {};
  const label = [address.city || address.town || address.village || address.county, address.state]
    .filter(Boolean)
    .join(", ") || `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`;

  return { label, latitude, longitude, source: "browser" };
}

function businessAddress(business: any) {
  return [
    business?.siteSettings?.physicalLocation,
    business?.siteSettings?.address,
    business?.address,
    business?.name,
  ].filter(Boolean).map(String).join(", ").trim();
}

function readGeocodeCache(): Record<string, { latitude: number; longitude: number }> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(sessionStorage.getItem(GEOCODE_CACHE_KEY) || "{}") || {};
  } catch {
    return {};
  }
}

function writeGeocodeCache(cache: Record<string, { latitude: number; longitude: number }>) {
  if (typeof window !== "undefined") sessionStorage.setItem(GEOCODE_CACHE_KEY, JSON.stringify(cache));
}

export async function getBusinessCoordinates(business: any) {
  const address = businessAddress(business);
  if (!address || typeof window === "undefined") return null;
  const cache = readGeocodeCache();
  const cached = cache[address.toLowerCase()];
  if (cached) return cached;

  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`);
    const result = response.ok ? (await response.json())?.[0] : null;
    if (!result) return null;
    const coordinates = { latitude: Number(result.lat), longitude: Number(result.lon) };
    if (!Number.isFinite(coordinates.latitude) || !Number.isFinite(coordinates.longitude)) return null;
    cache[address.toLowerCase()] = coordinates;
    writeGeocodeCache(cache);
    return coordinates;
  } catch {
    return null;
  }
}

export function distanceInKilometres(first: UserLocation, second: { latitude: number; longitude: number } | null) {
  if (first.latitude === undefined || first.longitude === undefined) return null;
  if (!second) return null;
  const radians = (value: number) => value * Math.PI / 180;
  const latitudeDelta = radians(second.latitude - first.latitude);
  const longitudeDelta = radians(second.longitude - first.longitude);
  const a = Math.sin(latitudeDelta / 2) ** 2 + Math.cos(radians(first.latitude)) * Math.cos(radians(second.latitude)) * Math.sin(longitudeDelta / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function rankByDistance<T>(items: T[], location: UserLocation | null, getBusiness: (item: T) => any) {
  if (!location) return items;
  if (location.latitude === undefined || location.longitude === undefined) {
    return [...items].sort((first, second) => Number(locationMatchesBusiness(location, getBusiness(second))) - Number(locationMatchesBusiness(location, getBusiness(first))));
  }
  const coordinatePromises = new Map<string, Promise<{ latitude: number; longitude: number } | null>>();
  const ranked = await Promise.all(items.map(async (item, index) => ({
    item,
    index,
    distance: distanceInKilometres(location, await (() => {
      const business = getBusiness(item);
      const key = business?.id || businessAddress(business).toLowerCase();
      if (!coordinatePromises.has(key)) coordinatePromises.set(key, getBusinessCoordinates(business));
      return coordinatePromises.get(key)!;
    })()),
  })));
  return ranked.sort((first, second) => (first.distance ?? Number.POSITIVE_INFINITY) - (second.distance ?? Number.POSITIVE_INFINITY) || first.index - second.index).map(({ item }) => item);
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