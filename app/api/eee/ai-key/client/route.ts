import { NextRequest, NextResponse } from "next/server";
import { decryptUserApiKey, getApiTokenUserId } from "@/lib/eee-api";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

let nextServerKeyIndex = 0;

function getServerGeminiKeys(): string[] {
  const configured = Object.entries(process.env)
    .flatMap(([name, value]) => {
      const match = /^GEMINI_API_KEY(?:_(\d+))?$/.exec(name);
      return match && value ? [{ order: match[1] ? Number(match[1]) + 1 : 0, value }] : [];
    })
    .sort((left, right) => left.order - right.order)
    .flatMap(({ value }) => value.split(/[\s,;]+/).filter(Boolean));
  return [...new Set(configured)];
}

function rotateServerGeminiKeys(keys: string[]): string[] {
  if (keys.length < 2) return keys;
  const start = nextServerKeyIndex % keys.length;
  nextServerKeyIndex = (start + 1) % keys.length;
  return [...keys.slice(start), ...keys.slice(0, start)];
}

export async function GET(request: NextRequest) {
  const userId = await getApiTokenUserId(request);
  const keys: string[] = [];

  if (userId) {
    try {
      const savedKey = await prisma.eeeUserApiKey.findUnique({
        where: { userId_provider: { userId, provider: "gemini" } },
        select: { ciphertext: true, iv: true, authTag: true },
      });
      if (savedKey) {
        keys.push(decryptUserApiKey(savedKey));
      }
    } catch (error) {
      console.error("EEE saved Gemini key could not be loaded:", error instanceof Error ? error.name : "unknown error");
    }
  }

  keys.push(...rotateServerGeminiKeys(getServerGeminiKeys()));
  const apiKeys = [...new Set(keys)];
  const headers = { "Cache-Control": "no-store, private", Pragma: "no-cache" };
  if (apiKeys.length === 0) {
    return NextResponse.json({ error: "No Gemini API keys are configured." }, { status: 503, headers });
  }

  return NextResponse.json({
    apiKeys,
    model: process.env.EEE_GEMINI_MODEL || "gemini-2.5-flash",
  }, { headers });
}
