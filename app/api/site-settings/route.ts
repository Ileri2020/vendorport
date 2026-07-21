import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const businessId = searchParams.get("businessId");
    if (!businessId) return NextResponse.json({ error: "Missing businessId" }, { status: 400 });

    const settings = await prisma.siteSettings.findUnique({ where: { businessId } });
    return NextResponse.json(settings || {});
  } catch (err) {
    console.error("site-settings GET error", err);
    return NextResponse.json({ error: "Failed to fetch site settings" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const businessId = body.businessId;
    if (!businessId) return NextResponse.json({ error: "Missing businessId" }, { status: 400 });

    const session = await auth();
    const userId = (session?.user as any)?.id;
    if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 });

    if (String(business.ownerId) !== String(userId) && (session as any)?.user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id, businessId: _b, updatedAt, ...updatedData } = body;

    const updated = await prisma.siteSettings.upsert({
      where: { businessId },
      update: updatedData,
      create: { businessId, ...updatedData },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("site-settings PUT error", err);
    return NextResponse.json({ error: "Failed to update site settings" }, { status: 500 });
  }
}
