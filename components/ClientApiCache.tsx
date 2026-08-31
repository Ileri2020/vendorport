"use client";

import axios, { AxiosResponse } from "axios";

const CACHE_TTL = 3000;
const publicModels = new Set([
  "activeIngredient",
  "brand",
  "business",
  "category",
  "featuredProduct",
  "healthConcern",
  "product",
]);

const requestCache = new Map<string, { timestamp: number; response: Response }>();
const inFlight = new Map<string, Promise<Response>>();

type CachedFetch = {
  timestamp: number;
  status: number;
  statusText: string;
  headers: [string, string][];
  body: string;
};

type CachedAxios = {
  timestamp: number;
  response: AxiosResponse;
};

const fetchCache = new Map<string, CachedFetch>();
const fetchPending = new Map<string, Promise<CachedFetch>>();
const axiosCache = new Map<string, CachedAxios>();
const axiosPending = new Map<string, Promise<AxiosResponse>>();

function clearClientApiCache() {
  requestCache.clear();
  inFlight.clear();
  fetchCache.clear();
  fetchPending.clear();
  axiosCache.clear();
  axiosPending.clear();
}

if (typeof window !== "undefined") {
  (window as any).__clearClientApiCache = clearClientApiCache;
  window.addEventListener("vport:clear-api-cache", clearClientApiCache);
}

function buildUrl(urlValue: string, params?: any): URL | null {
  try {
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost";
    const url = new URL(urlValue, origin);
    if (params && typeof params === "object") {
      if (params instanceof URLSearchParams) {
        params.forEach((v, k) => url.searchParams.set(k, v));
      } else {
        Object.entries(params).forEach(([k, v]) => {
          if (v !== undefined && v !== null) {
            url.searchParams.set(k, String(v));
          }
        });
      }
    }
    return url;
  } catch {
    return null;
  }
}

function isCacheable(urlValue: string, params?: any) {
  const url = buildUrl(urlValue, params);
  if (!url) return false;
  if (typeof window !== "undefined" && url.origin !== window.location.origin) return false;
  if (url.pathname !== "/api/dbhandler") return false;
  if (!publicModels.has(url.searchParams.get("model") || "")) return false;
  if (url.searchParams.has("userId") || url.searchParams.has("code")) return false;
  return true;
}

function getCacheKey(method: string, urlValue: string, params?: any) {
  const url = buildUrl(urlValue, params);
  if (!url) return `${method.toUpperCase()}:${urlValue}`;
  url.searchParams.sort();
  url.hash = "";
  return `${method.toUpperCase()}:${url.toString()}`;
}

function isFresh(timestamp: number) {
  return Date.now() - timestamp < CACHE_TTL;
}

export default function ClientApiCache() {
  return null;
}

if (typeof window !== "undefined" && !(window as any).__clientApiCachePatched) {
  (window as any).__clientApiCachePatched = true;

  const originalFetch = window.fetch.bind(window);
  const originalAxiosGet = axios.get.bind(axios);
  const originalAxiosPost = axios.post.bind(axios);
  const originalAxiosPut = axios.put.bind(axios);
  const originalAxiosDelete = axios.delete.bind(axios);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const method = (init?.method || (input instanceof Request ? input.method : "GET")).toUpperCase();
    const url = input instanceof Request ? input.url : input.toString();

    if (method !== "GET" || !isCacheable(url)) {
      if (method !== "GET" && isCacheable(url)) clearClientApiCache();
      return originalFetch(input, init);
    }

    const key = getCacheKey(method, url);
    const cached = requestCache.get(key);
    if (cached && isFresh(cached.timestamp)) return cached.response.clone();
    if (cached) requestCache.delete(key);

    const pending = inFlight.get(key);
    if (pending) return pending.then((value) => value.clone());

    const request = originalFetch(input, init).then(async (response) => {
      const body = await response.clone().text();
      const cachedResponse = new Response(body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });

      if (response.ok) {
        requestCache.set(key, { timestamp: Date.now(), response: cachedResponse });
      }

      return cachedResponse;
    });

    inFlight.set(key, request);
    try {
      return await request;
    } finally {
      inFlight.delete(key);
    }
  };

  axios.get = (async (url: string, config?: any) => {
    const params = config?.params;
    if (!isCacheable(url, params)) return originalAxiosGet(url, config);

    const key = getCacheKey("GET", url, params);
    const cached = axiosCache.get(key);
    if (cached && isFresh(cached.timestamp)) return cached.response;
    if (cached) axiosCache.delete(key);

    const pending = axiosPending.get(key);
    if (pending) return pending;

    const request = originalAxiosGet(url, config).then((response) => {
      if (response.status >= 200 && response.status < 300) {
        axiosCache.set(key, { timestamp: Date.now(), response });
      }
      return response;
    });

    axiosPending.set(key, request);
    try {
      return await request;
    } finally {
      axiosPending.delete(key);
    }
  }) as typeof axios.get;

  axios.post = (async (...args: any[]) => {
    clearClientApiCache();
    return (originalAxiosPost as any)(...args);
  }) as any;

  axios.put = (async (...args: any[]) => {
    clearClientApiCache();
    return (originalAxiosPut as any)(...args);
  }) as any;

  axios.delete = (async (...args: any[]) => {
    clearClientApiCache();
    return (originalAxiosDelete as any)(...args);
  }) as any;
}
