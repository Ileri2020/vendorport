"use client";

import { useVisitTracker } from "@/hooks/useVisitTracker";

/**
 * Client component to track visits
 * Include this in your root layout
 */
export function VisitTracker() {
    useVisitTracker();
    return null;
}
