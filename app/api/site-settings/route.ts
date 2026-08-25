import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
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

    const sanitizedData = Object.fromEntries(
      Object.entries(updatedData).filter(([, value]) => value !== undefined)
    );

    const lightAccent = sanitizedData.accentSecondaryLight ?? sanitizedData.accentLight;
    const darkAccent = sanitizedData.accentSecondaryDark ?? sanitizedData.accentDark;
    if (lightAccent !== undefined) {
      sanitizedData.accentLight = lightAccent;
      sanitizedData.accentSecondaryLight = lightAccent;
    }
    if (darkAccent !== undefined) {
      sanitizedData.accentDark = darkAccent;
      sanitizedData.accentSecondaryDark = darkAccent;
    }

    if (Object.keys(sanitizedData).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const chunkSize = 20;
    const entries = Object.entries(sanitizedData);
    const chunks = [] as Array<Record<string, any>>;

    for (let i = 0; i < entries.length; i += chunkSize) {
      chunks.push(Object.fromEntries(entries.slice(i, i + chunkSize)));
    }

    const existing = await prisma.siteSettings.findUnique({ where: { businessId } });

    if (!existing) {
      const [firstChunk, ...restChunks] = chunks;
      const created = await prisma.siteSettings.create({
        data: {
          businessId,
          ...(firstChunk ?? {}),
        },
      });

      for (const chunk of restChunks) {
        await prisma.siteSettings.update({
          where: { businessId },
          data: chunk,
        });
      }

      const updated = await prisma.siteSettings.findUnique({ where: { businessId } });
      revalidateTag("business", "max");
      return NextResponse.json(updated ?? created);
    }

    for (const chunk of chunks) {
      await prisma.siteSettings.update({
        where: { businessId },
        data: chunk,
      });
    }

    const updated = await prisma.siteSettings.findUnique({ where: { businessId } });
  revalidateTag("business", "max");
    return NextResponse.json(updated ?? existing);
  } catch (err) {
    console.error("site-settings PUT error", err);
    return NextResponse.json({ error: "Failed to update site settings" }, { status: 500 });
  }
}
