import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  const user = session?.user as ({ id?: unknown; name?: string | null; email?: string | null } | undefined);
  if (!user || typeof user.id !== "string") {
    return NextResponse.json({ signedIn: false, apiKeyConfigured: false, tokenConfigured: false }, { headers: { "Cache-Control": "no-store" } });
  }

  const [key, token] = await Promise.all([
    prisma.eeeUserApiKey.findUnique({
      where: { userId_provider: { userId: user.id, provider: "gemini" } },
      select: { id: true },
    }),
    prisma.apiAccessToken.findFirst({
      where: { userId: user.id, revokedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
      select: { expiresAt: true },
    }),
  ]);
  return NextResponse.json({
    signedIn: true,
    user: { name: user.name, email: user.email },
    apiKeyConfigured: Boolean(key),
    tokenConfigured: Boolean(token),
    tokenExpiresAt: token?.expiresAt ?? null,
  }, { headers: { "Cache-Control": "no-store" } });
}
