import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getApiTokenUserId } from "@/lib/eee-api";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await auth();
  const sessionUser = session?.user as ({ id?: unknown; name?: string | null; email?: string | null } | undefined);
  const userId = await getApiTokenUserId(request)
    ?? (typeof sessionUser?.id === "string" ? sessionUser.id : null);
  if (!userId) {
    return NextResponse.json({ signedIn: false, apiKeyConfigured: false, tokenConfigured: false }, { headers: { "Cache-Control": "no-store" } });
  }

  const [user, key, token] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true } }),
    prisma.eeeUserApiKey.findUnique({
      where: { userId_provider: { userId, provider: "gemini" } },
      select: { id: true },
    }),
    prisma.apiAccessToken.findFirst({
      where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
      select: { expiresAt: true },
    }),
  ]);
  return NextResponse.json({
    signedIn: true,
    user: { name: user?.name ?? sessionUser?.name ?? null, email: user?.email ?? sessionUser?.email ?? null },
    apiKeyConfigured: Boolean(key),
    tokenConfigured: Boolean(token),
    tokenExpiresAt: token?.expiresAt ?? null,
  }, { headers: { "Cache-Control": "no-store" } });
}
