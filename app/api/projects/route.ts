import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  EeePayloadTooLargeError,
  getApiTokenUserId,
  getSessionUserId,
  isRecord,
  MAX_EEE_CONTENT_BYTES,
  optionalText,
  readBoundedJson,
} from "@/lib/eee-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const JSON_HEADERS = { "Cache-Control": "no-store" };
const MAX_PROJECT_REQUESTS_PER_DAY = 10;
const anonymousRateLimit = new Map<string, { startedAt: number; count: number }>();
const DAY_MS = 24 * 60 * 60 * 1_000;

function getClientKey(request: NextRequest): string {
  // Use the first proxy-provided client address only when the deployment's edge
  // overwrites this header. Hash it so raw IP addresses are not retained in memory.
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const address = forwardedFor || request.headers.get("x-real-ip") || "unknown-client";
  return createHash("sha256").update(address).digest("hex");
}

function checkAnonymousRateLimit(request: NextRequest): boolean {
  const now = Date.now();
  const key = getClientKey(request);
  const current = anonymousRateLimit.get(key);
  if (!current || now - current.startedAt >= DAY_MS) {
    anonymousRateLimit.set(key, { startedAt: now, count: 1 });
    if (anonymousRateLimit.size > 5_000) {
      for (const [entry, value] of anonymousRateLimit) {
        if (now - value.startedAt >= DAY_MS) anonymousRateLimit.delete(entry);
      }
    }
    return true;
  }
  if (current.count >= MAX_PROJECT_REQUESTS_PER_DAY) return false;
  current.count++;
  return true;
}

function getBearerToken(request: NextRequest): string | null {
  const authorization = request.headers.get("authorization") ?? "";
  const match = /^Bearer\s+([A-Za-z0-9_-]{32,})$/i.exec(authorization);
  return match?.[1] ?? null;
}

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization");
    const token = getBearerToken(request);
    if (authorization && !token) {
      return NextResponse.json({ error: "The bearer token is malformed." }, { status: 401, headers: JSON_HEADERS });
    }

    // If a bearer token was supplied, it must be a valid, unexpired EEE app
    // token. Otherwise use the HCVP browser session, if present. Never accept
    // an account ID supplied in the request body.
    let userId: string | null = null;
    if (token) {
      userId = await getApiTokenUserId(request);
      if (!userId) {
        return NextResponse.json({ error: "The user API bearer token is invalid or expired." }, { status: 401, headers: JSON_HEADERS });
      }
    } else {
      userId = await getSessionUserId();
    }

    if (!userId && !checkAnonymousRateLimit(request)) {
      return NextResponse.json({ error: "Anonymous save limit reached. Sign in or try again tomorrow." }, { status: 429, headers: JSON_HEADERS });
    }

    const body = await readBoundedJson(request);
    if (!isRecord(body)) {
      return NextResponse.json({ error: "The request body must be a JSON object." }, { status: 400, headers: JSON_HEADERS });
    }

    const title = optionalText(body.title, 120);
    const description = optionalText(body.description, 5_000);
    const contentJson = optionalText(body.contentJson, MAX_EEE_CONTENT_BYTES);
    if (!title) {
      return NextResponse.json({ error: "A non-empty title is required (maximum 120 characters)." }, { status: 400, headers: JSON_HEADERS });
    }
    if (!contentJson || Buffer.byteLength(contentJson, "utf8") > MAX_EEE_CONTENT_BYTES) {
      return NextResponse.json({ error: "A project schematic is required (maximum 1 MB)." }, { status: 400, headers: JSON_HEADERS });
    }

    let schematic: unknown;
    try {
      schematic = JSON.parse(contentJson) as unknown;
    } catch {
      return NextResponse.json({ error: "contentJson must contain valid JSON." }, { status: 400, headers: JSON_HEADERS });
    }
    if (!isRecord(schematic) || typeof schematic.FileType !== "string" ||
        schematic.FileType.toUpperCase() !== "EEE_PLATFORM_SCHEMATIC" ||
        !Array.isArray(schematic.Components) || !Array.isArray(schematic.Connections)) {
      return NextResponse.json({ error: "contentJson must be a native EEE platform schematic." }, { status: 400, headers: JSON_HEADERS });
    }
    if (schematic.Components.length > 1_000 || schematic.Connections.length > 5_000) {
      return NextResponse.json({ error: "The schematic exceeds the component or connection limit." }, { status: 400, headers: JSON_HEADERS });
    }

    if (userId) {
      const recentSaves = await prisma.savedEeeProject.count({
        where: { userId, createdAt: { gte: new Date(Date.now() - DAY_MS) } },
      });
      if (recentSaves >= 100) {
        return NextResponse.json({ error: "The daily project save limit has been reached." }, { status: 429, headers: JSON_HEADERS });
      }
    }

    const project = await prisma.savedEeeProject.create({
      data: { title, description, contentJson, ...(userId ? { user: { connect: { id: userId } } } : {}) },
      select: {
        id: true,
        title: true,
        createdAt: true,
        user: { select: { name: true } },
      },
    });

    return NextResponse.json({
      id: project.id,
      title: project.title,
      ownerName: project.user?.name?.trim() || null,
      savedAt: project.createdAt.toISOString(),
    }, { status: 201, headers: JSON_HEADERS });
  } catch (error) {
    if (error instanceof EeePayloadTooLargeError) {
      return NextResponse.json({ error: error.message }, { status: 413, headers: JSON_HEADERS });
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "The request body must contain valid JSON." }, { status: 400, headers: JSON_HEADERS });
    }
    if (error instanceof TypeError || error instanceof RangeError) {
      return NextResponse.json({ error: error.message }, { status: 400, headers: JSON_HEADERS });
    }
    console.error("EEE project save failed:", error instanceof Error ? error.name : "unknown error");
    return NextResponse.json({ error: "The project could not be saved." }, { status: 500, headers: JSON_HEADERS });
  }
}
