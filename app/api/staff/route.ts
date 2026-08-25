import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function currentUser() {
  const session = await auth();
  const user = session?.user as any;
  return user?.id ? { userId: String(user.id), role: user.role } : null;
}

async function ownsBusiness(userId: string, businessId: string) {
  const business = await prisma.business.findUnique({ where: { id: businessId }, select: { ownerId: true } });
  return Boolean(business && String(business.ownerId) === userId);
}

export async function GET(request: NextRequest) {
  const current = await currentUser();
  if (!current) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const businessId = new URL(request.url).searchParams.get("businessId");
  if (!businessId) return NextResponse.json({ error: "Business ID is required" }, { status: 400 });
  const owner = current.role === "admin" || await ownsBusiness(current.userId, businessId);
  if (!owner) {
    const membership = await prisma.staff.findFirst({ where: { businessId, userId: current.userId, status: "accepted" } });
    return NextResponse.json(membership ? [membership] : []);
  }

  return NextResponse.json(await prisma.staff.findMany({
    where: { businessId },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { id: true, name: true, email: true, image: true, contact: true } } },
  }));
}

export async function POST(request: NextRequest) {
  const current = await currentUser();
  if (!current) return NextResponse.json({ error: "Please sign in before applying" }, { status: 401 });
  const body = await request.json();
  const businessId = String(body.businessId || "");
  const role = String(body.role || "").trim();
  if (!businessId || !role) return NextResponse.json({ error: "Business and desired role are required" }, { status: 400 });
  if (await ownsBusiness(current.userId, businessId)) return NextResponse.json({ error: "Business owners cannot apply to their own business" }, { status: 400 });

  const existing = await prisma.staff.findFirst({ where: { businessId, userId: current.userId, status: { in: ["pending", "accepted"] } } });
  if (existing) return NextResponse.json({ error: "You already have an active application for this business" }, { status: 400 });
  const applicant = await prisma.user.findUnique({ where: { id: current.userId }, select: { name: true, image: true } });
  const application = await prisma.staff.create({
    data: { businessId, userId: current.userId, name: String(body.name || applicant?.name || "Applicant"), role, bio: body.bio ? String(body.bio).trim() : null, image: applicant?.image || null, status: "pending" },
    include: { user: { select: { id: true, name: true, email: true, image: true, contact: true } } },
  });
  return NextResponse.json(application, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const current = await currentUser();
  if (!current) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const body = await request.json();
  const application = await prisma.staff.findUnique({ where: { id: String(body.id) } });
  if (!application) return NextResponse.json({ error: "Application not found" }, { status: 404 });
  if (current.role !== "admin" && !(await ownsBusiness(current.userId, application.businessId))) return NextResponse.json({ error: "Only the business owner can decide applications" }, { status: 403 });
  if (!["accepted", "rejected", "pending"].includes(body.status)) return NextResponse.json({ error: "Invalid application status" }, { status: 400 });

  const updated = await prisma.staff.update({ where: { id: application.id }, data: { status: body.status } });
  if (application.userId && body.status === "accepted") await prisma.user.update({ where: { id: application.userId }, data: { role: "staff" } });
  return NextResponse.json(updated);
}
