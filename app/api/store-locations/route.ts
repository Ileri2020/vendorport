import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const businessId = new URL(request.url).searchParams.get("businessId");
    const businesses = await prisma.business.findMany({
      where: businessId ? { id: businessId } : { isArchived: false },
      select: { siteSettings: { select: { operatingStates: true } } },
    });

    const locationValues: string[] = businesses.flatMap((business) => business.siteSettings?.operatingStates || [])
    const locations = [...new Set(locationValues)]
      .map((location) => location.trim())
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));

    return NextResponse.json(locations);
  } catch (error) {
    console.error("store-locations GET error", error);
    return NextResponse.json({ error: "Failed to fetch store locations" }, { status: 500 });
  }
}