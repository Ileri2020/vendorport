import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/getSession";

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();

    // Only app owner with supreme role can delete businesses
    if (!session?.user || session.user.role !== "supreme") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { businessId } = await req.json();

    if (!businessId) {
      return NextResponse.json({ error: "Missing businessId" }, { status: 400 });
    }

    // Check if business exists
    const business = await prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    // Delete the business and all cascading relations
    const deletedBusiness = await prisma.business.delete({
      where: { id: businessId },
    });

    return NextResponse.json({
      success: true,
      message: "Business deleted successfully",
      businessName: deletedBusiness.name,
    });
  } catch (error: any) {
    console.error("Delete business error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete business" },
      { status: 500 }
    );
  }
}
