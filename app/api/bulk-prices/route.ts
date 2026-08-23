import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function getOwnerBusiness(request: NextRequest) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  const businessId = new URL(request.url).searchParams.get("businessId");
  if (!userId || !businessId) return null;
  const business = await prisma.business.findUnique({ where: { id: businessId }, select: { id: true, ownerId: true } });
  return business && String(business.ownerId) === String(userId) ? business : null;
}

export async function GET(request: NextRequest) {
  const business = await getOwnerBusiness(request);
  if (!business) return NextResponse.json({ error: "Only the store owner can edit prices" }, { status: 403 });
  const params = new URL(request.url).searchParams;
  const page = Math.max(1, Number(params.get("page")) || 1);
  const limit = 20;
  const categoryId = params.get("categoryId");
  const where = { businessId: business.id, ...(categoryId ? { categoryId } : {}) };
  const [products, total] = await Promise.all([
    prisma.product.findMany({ where, include: { category: true, productCategories: { include: { category: true } }, variants: { include: { prices: true } }, stock: true }, orderBy: { name: "asc" }, skip: (page - 1) * limit, take: limit }),
    prisma.product.count({ where }),
  ]);
  return NextResponse.json({ products, total, page, limit, totalPages: Math.ceil(total / limit) });
}

export async function PUT(request: NextRequest) {
  const business = await getOwnerBusiness(request);
  if (!business) return NextResponse.json({ error: "Only the store owner can edit prices" }, { status: 403 });
  const body = await request.json();
  if (!Array.isArray(body.products)) return NextResponse.json({ error: "Products are required" }, { status: 400 });

  try {
    await prisma.$transaction(async (transaction) => {
      for (const item of body.products) {
        const product = await transaction.product.findFirst({ where: { id: String(item.id), businessId: business.id }, select: { id: true } });
        if (!product) throw new Error("Invalid product for this business");
        if (item.price !== undefined && Number.isFinite(Number(item.price))) {
          await transaction.product.update({ where: { id: product.id }, data: { price: Math.max(0, Number(item.price)) } });
        }
        if (Array.isArray(item.variants)) {
          for (const variant of item.variants) {
            if (!variant.id || !Number.isFinite(Number(variant.price))) continue;
            await transaction.productVariant.update({ where: { id: String(variant.id), productId: product.id }, data: { prices: { updateMany: { where: {}, data: { amount: Math.max(0, Number(variant.price)), calculatedAmount: Math.max(0, Number(variant.price)) } } } } });
          }
        }
      }
    });
    return NextResponse.json({ success: true, count: body.products.length });
  } catch (error) {
    console.error("bulk prices PUT error", error);
    return NextResponse.json({ error: "Could not save prices" }, { status: 400 });
  }
}
