import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createApiToken, hashApiToken } from "@/lib/eee-api";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function currentUserId() {
  const session = await auth();
  const id = (session?.user as { id?: unknown } | undefined)?.id;
  return typeof id === "string" && id.length > 0 ? id : null;
}

export async function GET() {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ error: "Sign in to manage your EEE app token." }, { status: 401 });

  const token = await prisma.apiAccessToken.findFirst({
    where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true, expiresAt: true, lastUsedAt: true },
  });
  return NextResponse.json({ configured: Boolean(token), expiresAt: token?.expiresAt ?? null, lastUsedAt: token?.lastUsedAt ?? null });
}

export async function POST() {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ error: "Sign in to create your EEE app token." }, { status: 401 });

  const now = new Date();
  await prisma.apiAccessToken.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: now } });
  const token = createApiToken();
  await prisma.apiAccessToken.create({
    data: {
      userId,
      name: "EEE Simulator",
      tokenHash: hashApiToken(token),
      expiresAt: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1_000),
    },
  });
  return NextResponse.json({ token, expiresAt: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1_000) }, { status: 201, headers: { "Cache-Control": "no-store" } });
}

export async function DELETE() {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ error: "Sign in to revoke your EEE app token." }, { status: 401 });
  await prisma.apiAccessToken.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } });
  return NextResponse.json({ configured: false });
}
