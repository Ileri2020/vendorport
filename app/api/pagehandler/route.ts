import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Page Handler - Optimized single endpoint for fetching all data needed to render a page
 * GET /api/pagehandler?businessId=XXX&pageSlug=home
 * OR
 * GET /api/pagehandler?storeName=my-store&pageSlug=home
 * 
 * Returns complete page data including:
 * - Business info
 * - Page structure and sections
 * - Site settings
 * - Master sections (BusinessSection)
 * - Related content (products, posts, categories, staff, etc.)
 */

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  let businessId = searchParams.get("businessId");
  const storeName = searchParams.get("storeName");
  const pageSlug = searchParams.get("pageSlug") || "home";

  // If storeName is provided instead of businessId, resolve it
  if (!businessId && storeName) {
    try {
      const businesses = await prisma.business.findMany({
        take: 100,
      });
      
      const biz = businesses.find((b: any) =>
        b.name.toLowerCase().replace(/\s+/g, '-') === storeName
      );
      
      if (!biz) {
        return NextResponse.json(
          { error: "Store not found" },
          { status: 404 }
        );
      }
      businessId = biz.id;
    } catch (error) {
      console.error('Error resolving store name:', error);
      return NextResponse.json(
        { error: "Failed to resolve store" },
        { status: 400 }
      );
    }
  }

  if (!businessId) {
    return NextResponse.json(
      { error: "businessId or storeName is required" },
      { status: 400 }
    );
  }

  try {
    // Fetch complete business data with all relations
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: {
        settings: {
          include: {
            pages: {
              include: {
                sections: true,
              },
            },
          },
        },
        siteSettings: true,
        sections: true, // Master sections if using new system
        products: {
          take: 100,
          include: {
            category: true,
            stock: true,
            reviews: {
              take: 5,
            },
          },
        },
        categories: {
          include: {
            products: {
              take: 10,
            },
          },
        },
        posts: {
          take: 20,
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        staff: true,
        promotions: true,
        stats: true,
        partners: true,
        helpArticles: {
          take: 50,
        },
        reviews: {
          take: 20,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        chatThreads: {
          where: {
            businessId: businessId,
          },
          take: 10,
          include: {
            messages: {
              take: 10,
              orderBy: { createdAt: "desc" },
            },
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
    });

    if (!business) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    // Find the page if using legacy system
    const page =
      business.settings?.pages?.find((p) => p.slug === pageSlug) ||
      business.settings?.pages?.[0] ||
      null;

    // Prepare comprehensive page data
    const pageData = {
      business,
      page,
      pageSlug,
      // Legacy system data
      sections: page?.sections || [],
      // Master system data
      masterSections: business.sections
        ?.filter((s: any) => s.page === pageSlug)
        .sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0)) || [],
      // Content data
      products: business.products,
      categories: business.categories,
      posts: business.posts,
      staff: business.staff,
      promotions: business.promotions,
      stats: business.stats,
      partners: business.partners,
      helpArticles: business.helpArticles,
      reviews: business.reviews,
      chatThreads: business.chatThreads,
      siteSettings: business.siteSettings,
    };

    // Set cache headers for CDN/browser
    const response = NextResponse.json(pageData);
    response.headers.set("Cache-Control", "public, max-age=300"); // 5 min server cache
    return response;
  } catch (error) {
    console.error("Page handler error:", error);
    return NextResponse.json(
      { error: "Failed to fetch page data" },
      { status: 500 }
    );
  }
}
