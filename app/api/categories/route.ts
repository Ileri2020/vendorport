import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await request.json();
  const name = String(body.name || "").trim();
  const description = String(body.description || "").trim() || null;
  const businessId = body.businessId ? String(body.businessId) : null;

  if (!name) return NextResponse.json({ error: "Category name is required" }, { status: 400 });

  if (businessId) {
    const business = await prisma.business.findUnique({ where: { id: businessId } });
    const isAdmin = (session as any)?.user?.role === "admin";
    if (!business || (String(business.ownerId) !== String(userId) && !isAdmin)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const existing = await prisma.category.findFirst({
    where: businessId
      ? { businessId, name: { equals: name, mode: "insensitive" } }
      : { name: { equals: name, mode: "insensitive" } },
  });
  if (existing) return NextResponse.json(existing);

  try {
    const category = await prisma.category.create({
      data: { name, description, ...(businessId ? { businessId } : {}) },
    });
    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    if (error?.code === "P2002") {
      const category = await prisma.category.findFirst({
        where: businessId
          ? { businessId, name: { equals: name, mode: "insensitive" } }
          : { name: { equals: name, mode: "insensitive" } },
      });
      if (category) return NextResponse.json(category);
    }
    console.error("category creation error", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
