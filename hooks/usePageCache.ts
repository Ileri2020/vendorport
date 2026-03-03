"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';

interface CachedPageData {
  business: any;
  timestamp: number;
  version: string;
}

export function usePageCache(storeName: string, pageSlug: string = 'home') {
  const [business, setBusiness] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const CACHE_KEY = `page_cache_${storeName}_${pageSlug}`;
  const CACHE_DURATION = 1000 * 60 * 10; // 10 minutes
  const CACHE_VERSION = '1.0'; // Increment when schema changes

  const getCachedData = () => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const data: CachedPageData = JSON.parse(cached);
      const now = Date.now();

      // Check cache version and expiry
      if (data.version !== CACHE_VERSION || now - data.timestamp > CACHE_DURATION) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }

      return data.business;
    } catch (e) {
      console.warn('Cache read error:', e);
      return null;
    }
  };

  const setCachedData = (businessData: any) => {
    try {
      const cacheData: CachedPageData = {
        business: businessData,
        timestamp: Date.now(),
        version: CACHE_VERSION,
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (e) {
      console.warn('Cache write error:', e);
    }
  };

  const invalidateCache = () => {
    try {
      localStorage.removeItem(CACHE_KEY);
      localStorage.removeItem(`${CACHE_KEY}_all_businesses`);
    } catch (e) {
      console.warn('Cache invalidation error:', e);
    }
  };

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Try to get from cache first
        const cachedBusiness = getCachedData();
        if (cachedBusiness) {
          setBusiness(cachedBusiness);
          setIsLoading(false);
          return;
        }

        // Fetch all businesses with full data
        const res = await axios.get(`/api/dbhandler?model=business`);
        const businesses = res.data;

        if (!Array.isArray(businesses) || businesses.length === 0) {
          throw new Error('No businesses found');
        }

        // Find by slug-ified name
        const biz = businesses.find((b: any) =>
          b.name.toLowerCase().replace(/\s+/g, '-') === storeName
        );

        if (!biz) {
          setError('Store not found');
          setIsLoading(false);
          return;
        }

        // Cache the business data
        setCachedData(biz);
        setBusiness(biz);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching page data:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to load store'
        );
        setIsLoading(false);
      }
    };

    if (storeName) {
      fetchPageData();
    }
  }, [storeName, pageSlug]);

  return {
    business,
    isLoading,
    error,
    invalidateCache,
    refetch: () => {
      invalidateCache();
      window.location.reload();
    },
  };
}
