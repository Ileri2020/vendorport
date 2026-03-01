"use client";

import { useEffect } from 'react';
import { trackVisit } from '@/lib/visit-tracker';

/**
 * Hook to track user visits
 * Call this in your root layout or main page component
 */
export function useVisitTracker() {
    useEffect(() => {
        // Track visit after a short delay to ensure page has loaded
        const timer = setTimeout(() => {
            trackVisit();
        }, 1000);

        return () => clearTimeout(timer);
    }, []);
}
