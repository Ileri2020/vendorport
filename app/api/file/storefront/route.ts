import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { handleUpload } from "@/app/api/file/cloudinary";
import { prisma } from "@/lib/prisma";

const MAX_STOREFRONT_SIZE = 50 * 1024;

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const userId = (session?.user as { id?: string } | undefined)?.id;
    if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const formData = await request.formData();
    const businessId = formData.get("businessId");
    const file = formData.get("file");
    if (typeof businessId !== "string" || !businessId) return NextResponse.json({ error: "Missing businessId" }, { status: 400 });
    if (!(file instanceof File)) return NextResponse.json({ error: "Missing storefront image" }, { status: 400 });
    if (!file.type.startsWith("image/")) return NextResponse.json({ error: "Storefront image must be an image" }, { status: 400 });
    if (file.size >= MAX_STOREFRONT_SIZE) return NextResponse.json({ error: "Storefront image must be smaller than 50 KB" }, { status: 413 });

    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 });
    if (String(business.ownerId) !== String(userId) && (session as { user?: { role?: string } } | null)?.user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const dataUri = `data:${file.type};base64,${bytes.toString("base64")}`;
    const uploaded = await handleUpload(dataUri);
    return NextResponse.json({ url: uploaded.secure_url });
  } catch (error) {
    console.error("storefront image upload error", error);
    return NextResponse.json({ error: "Failed to upload storefront image" }, { status: 500 });
  }
}