/**
 * Visit Tracking Utility
 * 
 * Tracks unique daily visits using browser fingerprinting stored in localStorage
 */

const FINGERPRINT_KEY = 'loisfood_visitor_fp';
const LAST_VISIT_KEY = 'loisfood_last_visit';

/**
 * Generate a simple browser fingerprint
 */
function generateFingerprint(): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    let fingerprint = '';

    // Screen resolution
    fingerprint += `${window.screen.width}x${window.screen.height}`;

    // Timezone
    fingerprint += `_${new Date().getTimezoneOffset()}`;

    // Language
    fingerprint += `_${navigator.language}`;

    // Platform
    fingerprint += `_${navigator.platform}`;

    // Canvas fingerprint
    if (ctx) {
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Lois Food & Spices', 2, 2);
        fingerprint += `_${canvas.toDataURL().slice(-50)}`;
    }

    // Create a hash
    return btoa(fingerprint).slice(0, 32);
}

/**
 * Get or create browser fingerprint
 */
export function getFingerprint(): string {
    if (typeof window === 'undefined') return '';

    let fingerprint = localStorage.getItem(FINGERPRINT_KEY);

    if (!fingerprint) {
        fingerprint = generateFingerprint();
        localStorage.setItem(FINGERPRINT_KEY, fingerprint);
    }

    return fingerprint;
}

/**
 * Check if user has visited today
 */
export function hasVisitedToday(): boolean {
    if (typeof window === 'undefined') return false;

    const lastVisit = localStorage.getItem(LAST_VISIT_KEY);

    if (!lastVisit) return false;

    const lastVisitDate = new Date(lastVisit);
    const today = new Date();

    return (
        lastVisitDate.getDate() === today.getDate() &&
        lastVisitDate.getMonth() === today.getMonth() &&
        lastVisitDate.getFullYear() === today.getFullYear()
    );
}

/**
 * Mark today as visited
 */
export function markVisitedToday(): void {
    if (typeof window === 'undefined') return;

    localStorage.setItem(LAST_VISIT_KEY, new Date().toISOString());
}

/**
 * Track visit to server
 */
export async function trackVisit(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    // Check if already visited today
    if (hasVisitedToday()) {
        console.log('Already tracked visit for today');
        return false;
    }

    const fingerprint = getFingerprint();

    try {
        const response = await fetch('/api/visit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fingerprint,
                userAgent: navigator.userAgent,
            }),
        });

        if (response.ok) {
            markVisitedToday();
            console.log('Visit tracked successfully');
            return true;
        }

        return false;
    } catch (error) {
        console.error('Failed to track visit:', error);
        return false;
    }
}
