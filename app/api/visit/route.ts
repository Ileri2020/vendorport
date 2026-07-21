import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** Rejects after `ms` milliseconds — used to fail-fast when DB is unreachable */
const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> =>
  Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`DB timeout after ${ms}ms`)), ms)
    ),
  ]);

// POST /api/visit - Record a page visit (called from browser, works for all users including unauthenticated)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const path = body.path || "/";
    const browserId = body.browserId || body.fingerprint || "unknown";
    const userAgent = req.headers.get("user-agent") || "";
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    // Resolve businessId if visiting a storefront
    let businessId: string | null = null;
    const pathParts = path.split("/").filter(Boolean);
    if (pathParts.length > 0) {
      const possibleStore = pathParts[0];
      const platformRoutes = ["home", "about", "store", "account", "contact", "create-store", "admin", "api"];
      if (!platformRoutes.includes(possibleStore)) {
        const businesses = await prisma.business.findMany({ select: { id: true, name: true } });
        const match = businesses.find(
          (b) => b.name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") === possibleStore
        );
        if (match) businessId = match.id;
      }
    }

    // Only record once per browserId per business per day
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await withTimeout(
      prisma.visit.findFirst({
        where: { fingerprint: browserId, businessId, createdAt: { gte: today } },
      }),
      5000
    );

    if (!existing) {
      await withTimeout(
        prisma.visit.create({
          data: { fingerprint: browserId, userAgent, ipAddress: ip, businessId },
        }),
        5000
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    if (!err?.message?.includes('DB timeout')) {
      console.error("Visit tracking error:", err);
    }
    return NextResponse.json({ ok: true });
  }
}


// GET /api/visit - Returns daily visit counts for the analytics dashboard
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const fromStr = searchParams.get("from");
    const toStr = searchParams.get("to");
    const from = fromStr ? new Date(fromStr) : new Date(Date.now() - 30 * 86400000);
    const to = toStr ? new Date(toStr) : new Date();

    const visitsRaw = await prisma.visit.findMany({
      where: { createdAt: { gte: from, lte: to } },
      select: { createdAt: true },
    });

    // Group by day
    const byDay: Record<string, number> = {};
    visitsRaw.forEach((v: any) => {
      const day = v.createdAt.toISOString().split("T")[0];
      byDay[day] = (byDay[day] || 0) + 1;
    });

    const dailyVisits = Object.entries(byDay)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({ dailyVisits, total: visitsRaw.length });
  } catch (err) {
    console.error("Visit GET error:", err);
    return NextResponse.json({ error: "Failed to fetch visits" }, { status: 500 });
  }
}
