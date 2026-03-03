"use client";

import React from 'react';

/**
 * Lightweight localStorage-based cache utility for API responses
 * Automatically handles cache expiration and versioning
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  version: string;
}

const CACHE_VERSION = "1.0";
const DEFAULT_CACHE_DURATION = 1000 * 60 * 10; // 10 minutes

export class DataCache {
  private static readonly prefix = "vendorport_cache_";
  private static readonly versionKey = "vendorport_cache_version";

  /**
   * Get cached data if it exists and is not expired
   */
  static get<T>(key: string, duration = DEFAULT_CACHE_DURATION): T | null {
    try {
      const cached = localStorage.getItem(`${this.prefix}${key}`);
      if (!cached) return null;

      const entry: CacheEntry<T> = JSON.parse(cached);
      const now = Date.now();

      // Check version and expiry
      if (
        entry.version !== CACHE_VERSION ||
        now - entry.timestamp > duration
      ) {
        this.remove(key);
        return null;
      }

      return entry.data;
    } catch (e) {
      console.warn(`Cache read error for key: ${key}`, e);
      return null;
    }
  }

  /**
   * Set data in cache
   */
  static set<T>(key: string, data: T): void {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        version: CACHE_VERSION,
      };
      localStorage.setItem(`${this.prefix}${key}`, JSON.stringify(entry));
    } catch (e) {
      console.warn(`Cache write error for key: ${key}`, e);
    }
  }

  /**
   * Remove specific cache entry
   */
  static remove(key: string): void {
    try {
      localStorage.removeItem(`${this.prefix}${key}`);
    } catch (e) {
      console.warn(`Cache remove error for key: ${key}`, e);
    }
  }

  /**
   * Clear all cache entries matching a pattern
   */
  static clearByPattern(pattern: string): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (
          key.startsWith(this.prefix) &&
          key.includes(pattern)
        ) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {
      console.warn(`Cache clear error for pattern: ${pattern}`, e);
    }
  }

  /**
   * Clear all app cache
   */
  static clearAll(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {
      console.warn("Cache clear all error", e);
    }
  }
}

/**
 * Hook to manage cached data fetching
 */
export function useCachedData<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options?: {
    duration?: number;
    autoFetch?: boolean;
  }
): {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  invalidate: () => void;
} {
  const [data, setData] = React.useState<T | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const { duration = DEFAULT_CACHE_DURATION, autoFetch = true } = options || {};

  const refetch = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check cache first
      const cached = DataCache.get<T>(key, duration);
      if (cached) {
        setData(cached);
        setIsLoading(false);
        return;
      }

      // Fetch from API
      const freshData = await fetchFn();
      DataCache.set(key, freshData);
      setData(freshData);
      setIsLoading(false);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      setError(error);
      setIsLoading(false);
      throw error;
    }
  }, [key, fetchFn, duration]);

  const invalidate = React.useCallback(() => {
    DataCache.remove(key);
    setData(null);
  }, [key]);

  React.useEffect(() => {
    if (autoFetch) {
      refetch();
    }
  }, [key, refetch, autoFetch]);

  return { data, isLoading, error, refetch, invalidate };
}
