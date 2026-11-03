import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { encryptUserApiKey, isRecord, readBoundedJson } from "@/lib/eee-api";
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
  if (!userId) return NextResponse.json({ error: "Sign in to manage your Gemini API key." }, { status: 401 });

  const key = await prisma.eeeUserApiKey.findUnique({
    where: { userId_provider: { userId, provider: "gemini" } },
    select: { updatedAt: true },
  });
  return NextResponse.json({ configured: Boolean(key), updatedAt: key?.updatedAt ?? null }, { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(request: NextRequest) {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ error: "Sign in to save your Gemini API key." }, { status: 401 });

  try {
    const body = await readBoundedJson(request, 4_096);
    if (!isRecord(body) || typeof body.apiKey !== "string") {
      return NextResponse.json({ error: "Provide a Gemini API key." }, { status: 400 });
    }
    const apiKey = body.apiKey.trim();
    if (apiKey.length < 20 || apiKey.length > 512 || /\s/.test(apiKey)) {
      return NextResponse.json({ error: "The API key format is invalid." }, { status: 400 });
    }

    const encrypted = encryptUserApiKey(apiKey);
    await prisma.eeeUserApiKey.upsert({
      where: { userId_provider: { userId, provider: "gemini" } },
      create: { userId, provider: "gemini", ...encrypted },
      update: encrypted,
    });
    return NextResponse.json({ configured: true, updatedAt: new Date().toISOString() }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ error: "The request body must be valid JSON." }, { status: 400 });
    if (error instanceof Error && error.message.includes("encryption")) {
      return NextResponse.json({ error: "Encrypted API key storage is not configured on this server." }, { status: 503 });
    }
    console.error("EEE user API key save failed:", error instanceof Error ? error.name : "unknown error");
    return NextResponse.json({ error: "Could not save your API key." }, { status: 500 });
  }
}

export async function DELETE() {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ error: "Sign in to remove your Gemini API key." }, { status: 401 });
  await prisma.eeeUserApiKey.deleteMany({ where: { userId, provider: "gemini" } });
  return NextResponse.json({ configured: false });
}
