import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function getSessionUser() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  return { session, userId };
}

export async function GET(request: NextRequest) {
  const { userId } = await getSessionUser();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const query = new URL(request.url).searchParams.get("query")?.trim() || "";
  const products = await prisma.product.findMany({
    where: {
      businessId: null,
      ...(query ? { OR: [
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ] } : {}),
    },
    include: { category: true, creator: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  const { session, userId } = await getSessionUser();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await request.json();
  const action = body.action || "create";

  if (action === "attach") {
    const businessId = String(body.businessId || "");
    const categoryId = String(body.categoryId || "");
    const productIds = Array.isArray(body.productIds) ? body.productIds.map(String) : [];
    if (!businessId || !categoryId || productIds.length === 0) {
      return NextResponse.json({ error: "Business, category, and products are required" }, { status: 400 });
    }

    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business || (String(business.ownerId) !== String(userId) && (session as any)?.user?.role !== "admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const category = await prisma.category.findFirst({ where: { id: categoryId, businessId } });
    if (!category) return NextResponse.json({ error: "Category does not belong to this business" }, { status: 400 });

    const result = await prisma.product.updateMany({
      where: { id: { in: productIds }, businessId: null },
      data: { businessId, categoryId },
    });
    return NextResponse.json({ attached: result.count });
  }

  const name = String(body.name || "").trim();
  const price = Number(body.price);
  if (!name || !Number.isFinite(price) || price < 0) {
    return NextResponse.json({ error: "Name and valid price are required" }, { status: 400 });
  }

  if (body.categoryId) {
    const category = await prisma.category.findUnique({ where: { id: String(body.categoryId) } });
    if (!category) return NextResponse.json({ error: "Selected category was not found" }, { status: 400 });
  }

  const product = await prisma.product.create({
    data: {
      name,
      description: body.description ? String(body.description) : null,
      price,
      costPrice: body.costPrice === "" || body.costPrice == null ? null : Number(body.costPrice),
      images: Array.isArray(body.images) ? body.images.map(String) : [],
      activeIngredients: [],
      for: [],
      creatorId: userId,
      ...(body.categoryId ? { categoryId: String(body.categoryId) } : {}),
    },
  });
  return NextResponse.json(product, { status: 201 });
}