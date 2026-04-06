"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';

interface CachedPageData {
  pageData: any;
  timestamp: number;
  version: string;
}

export function usePageCache(storeNameOrId: string, pageSlug: string = 'home') {
  const [pageData, setPageData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Determine if input is businessId (24-char MongoDB ID) or storeName (slug format)
  const isBusinessId = storeNameOrId && storeNameOrId.length === 24 && /^[a-f0-9]{24}$/i.test(storeNameOrId);
  const cacheKeyId = isBusinessId ? storeNameOrId : `store_${storeNameOrId || 'temp'}`;
  const CACHE_KEY = `page_cache_${cacheKeyId}_${pageSlug}`;
  const CACHE_DURATION = 1000 * 60 * 10; // 10 minutes
  const CACHE_VERSION = '2.0'; // Increment when schema changes

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

      return data.pageData;
    } catch (e) {
      console.warn('Cache read error:', e);
      return null;
    }
  };

  const setCachedData = (data: any) => {
    try {
      const cacheData: CachedPageData = {
        pageData: data,
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
        const cachedData = getCachedData();
        if (cachedData) {
          setPageData(cachedData);
          setIsLoading(false);
          return;
        }

        // Fetch page data from the optimized pagehandler endpoint
        // Single request gets ALL data needed to render the page
        const queryParam = isBusinessId ? 'businessId' : 'storeName';
        const response = await axios.get(
          `/api/pagehandler?${queryParam}=${storeNameOrId}&pageSlug=${pageSlug}`
        );

        if (!response.data) {
          throw new Error('Invalid page data received');
        }

        // Cache the complete page data
        setCachedData(response.data);
        setPageData(response.data);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching page data:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to load page'
        );
        setIsLoading(false);
      }
    };

    if (storeNameOrId && pageSlug) {
      fetchPageData();
    }
  }, [storeNameOrId, pageSlug]);

  return {
    pageData,
    business: pageData?.business,
    sections: pageData?.sections || [],
    masterSections: pageData?.masterSections || [],
    products: pageData?.products || [],
    categories: pageData?.categories || [],
    posts: pageData?.posts || [],
    staff: pageData?.staff || [],
    promotions: pageData?.promotions || [],
    stats: pageData?.stats || [],
    partners: pageData?.partners || [],
    helpArticles: pageData?.helpArticles || [],
    reviews: pageData?.reviews || [],
    chatThreads: pageData?.chatThreads || [],
    siteSettings: pageData?.siteSettings,
    isLoading,
    error,
    invalidateCache,
    refetch: () => {
      invalidateCache();
      window.location.reload();
    },
  };
}
