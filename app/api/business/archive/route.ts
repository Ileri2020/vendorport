import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/getSession";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();

    // Only app owner with supreme role can archive businesses
    if (!session?.user || session.user.role !== "supreme") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { businessId } = await req.json();

    if (!businessId) {
      return NextResponse.json({ error: "Missing businessId" }, { status: 400 });
    }

    // Update business to archived
    const updatedBusiness = await prisma.business.update({
      where: { id: businessId },
      data: { isArchived: true },
    });

    return NextResponse.json({
      success: true,
      message: "Business archived successfully",
      business: updatedBusiness,
    });
  } catch (error: any) {
    console.error("Archive business error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to archive business" },
      { status: 500 }
    );
  }
}
