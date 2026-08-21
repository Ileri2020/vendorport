/**
 * getCachedBusiness
 *
 * Centralised, cached business loader used by every page inside app/[storeName]/.
 * - Converts the URL storeName slug back to a business name and fetches from DB.
 * - Uses Next.js `unstable_cache` so the DB is only hit once per storeName per
 *   revalidation window (5 minutes).
 *
 * Only CONTENT data is fetched here. Page structure / layout / navbar are
 * defined statically in the filesystem.
 */

import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

/** The shape returned to all storefront pages */
export interface StorefrontBusiness {
  id: string;
  name: string;
  slug: string;           // url-safe slug (same as storeName param)
  ownerId: string;
  template: string;
  isArchived: boolean;
  _count: { categories: number; products: number };
  siteSettings: {
    id: string;
    aboutText: string;
    heroTitle: string;
    heroSubtitle: string;
    heroCTA: string | null;
    heroCTALink: string | null;
    heroImage: string | null;
    storefrontImageUrl: string | null;
    contactEmail: string | null;
    contactPhone: string | null;
    contactDesc: string | null;
    address: string | null;
    facebook: string | null;
    instagram: string | null;
    twitter: string | null;
    linkedin: string | null;
    headerCTA: string | null;
    footerText: string | null;
    newsletterTitle: string | null;
    newsletterText: string | null;
    iconMode: string;
    iconText: string | null;
    iconFontSize: number;
    iconFontColor: string;
    iconImageUrl: string | null;
    iconImageWidth: number;
    iconImageHeight: number;
    addToHome: string;
    animatedTexts: string[];
    operatingStates: string[];
    aboutSub: string;
    whoWeAreText: string;
    visionText: string;
    promiseText: string;
    whatWeDoText: string;
    aiSystemText: string;
    integrityText: string;
    accentLight: string;
    accentDark: string;
    accentSecondaryLight: string;
    accentSecondaryDark: string;
    accentForegroundLight: string;
    accentForegroundDark: string;
  } | null;
  staff: { id: string; name: string; role: string; bio: string | null; image: string | null }[];
  stats: { id: string; label: string; value: string; icon: string | null }[];
  partners: { id: string; name: string; logo: string | null; website: string | null }[];
  promotions: { id: string; title: string; description: string | null; image: string | null; discount: number | null }[];
  helpArticles: { id: string; title: string; content: string; category: string | null }[];
}

/**
 * Convert URL storeName (slug format, e.g. "my-store") back to business name
 */
async function resolveBusinessSlug(storeName: string): Promise<StorefrontBusiness | null> {
  const businesses = await prisma.business.findMany({
    select: { id: true, name: true },
    take: 500,
  });

  const match = businesses.find(
    (b) => b.name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") === storeName
  );

  if (!match) return null;

  const business = await prisma.business.findUnique({
    where: { id: match.id },
    select: {
      id: true,
      name: true,
      ownerId: true,
      template: true,
      isArchived: true,
      _count: { select: { categories: true, products: true } },
      siteSettings: {
        select: {
          id: true,
          aboutText: true,
          heroTitle: true,
          heroSubtitle: true,
          heroCTA: true,
          heroCTALink: true,
          heroImage: true,
          storefrontImageUrl: true,
          contactEmail: true,
          contactPhone: true,
          contactDesc: true,
          address: true,
          facebook: true,
          instagram: true,
          twitter: true,
          linkedin: true,
          headerCTA: true,
          footerText: true,
          newsletterTitle: true,
          newsletterText: true,
          iconMode: true,
          iconText: true,
          iconFontSize: true,
          iconFontColor: true,
          iconImageUrl: true,
          iconImageWidth: true,
          iconImageHeight: true,
          addToHome: true,
          animatedTexts: true,
          operatingStates: true,
          aboutSub: true,
          whoWeAreText: true,
          visionText: true,
          promiseText: true,
          whatWeDoText: true,
          aiSystemText: true,
          integrityText: true,
          accentLight: true,
          accentDark: true,
          accentSecondaryLight: true,
          accentSecondaryDark: true,
          accentForegroundLight: true,
          accentForegroundDark: true,
        },
      },
      staff: {
        select: { id: true, name: true, role: true, bio: true, image: true },
      },
      stats: {
        select: { id: true, label: true, value: true, icon: true },
      },
      partners: {
        select: { id: true, name: true, logo: true, website: true },
      },
      promotions: {
        select: { id: true, title: true, description: true, image: true, discount: true },
      },
      helpArticles: {
        take: 50,
        select: { id: true, title: true, content: true, category: true },
      },
    },
  });

  if (!business) return null;

  return {
    ...business,
    slug: storeName,
  } as StorefrontBusiness;
}

export const getCachedBusiness = unstable_cache(
  (storeName: string) => resolveBusinessSlug(storeName),
  ["business-by-slug"],
  { revalidate: 300, tags: ["business"] }
);
