import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  buildComponentSummary,
  EeePayloadTooLargeError,
  getApiTokenUserId,
  isRecord,
  MAX_EEE_CONTENT_BYTES,
  optionalText,
  readBoundedJson,
} from "@/lib/eee-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const JSON_HEADERS = { "Cache-Control": "no-store" };

export async function GET() {
  try {
    const examples = await prisma.communityExample.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        title: true,
        category: true,
        icon: true,
        formula: true,
        description: true,
        componentSummary: true,
        contentJson: true,
        user: { select: { name: true } },
      },
    });
    return NextResponse.json(examples.map((example) => ({
      id: example.id,
      title: example.title,
      category: example.category,
      icon: example.icon,
      formula: example.formula,
      description: example.description,
      componentSummary: example.componentSummary,
      contentJson: example.contentJson,
      ownerName: example.user.name?.trim() || "Community member",
    })), { headers: JSON_HEADERS });
  } catch (error) {
    console.error("Community examples GET failed:", error instanceof Error ? error.name : "unknown error");
    return NextResponse.json({ error: "Community examples are temporarily unavailable." }, { status: 503, headers: JSON_HEADERS });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getApiTokenUserId(request);
    if (!userId) return NextResponse.json({ error: "A valid user API bearer token is required." }, { status: 401, headers: JSON_HEADERS });

    const body = await readBoundedJson(request);
    if (!isRecord(body)) return NextResponse.json({ error: "The request body must be a JSON object." }, { status: 400 });

    const title = optionalText(body.title, 80);
    const category = optionalText(body.category, 40) ?? "Community";
    const description = optionalText(body.description, 5_000);
    const icon = optionalText(body.icon, 24);
    const formula = optionalText(body.formula, 300);
    const suppliedSummary = optionalText(body.componentSummary, 500);
    const contentJson = optionalText(body.contentJson, MAX_EEE_CONTENT_BYTES);
    if (!title) return NextResponse.json({ error: "A non-empty title is required (maximum 80 characters)." }, { status: 400 });
    if (!contentJson || Buffer.byteLength(contentJson, "utf8") > MAX_EEE_CONTENT_BYTES) {
      return NextResponse.json({ error: "A valid schematic is required (maximum 1 MB)." }, { status: 400 });
    }

    let schematic: unknown;
    try { schematic = JSON.parse(contentJson) as unknown; }
    catch { return NextResponse.json({ error: "contentJson must contain valid JSON." }, { status: 400 }); }
    if (!isRecord(schematic) || typeof schematic.FileType !== "string" ||
        schematic.FileType.toUpperCase() !== "EEE_PLATFORM_SCHEMATIC" ||
        !Array.isArray(schematic.Components) || !Array.isArray(schematic.Connections)) {
      return NextResponse.json({ error: "contentJson must be a native EEE platform schematic." }, { status: 400 });
    }
    if (schematic.Components.length > 1_000 || schematic.Connections.length > 5_000) {
      return NextResponse.json({ error: "The schematic exceeds the component or connection limit." }, { status: 400 });
    }

    const dailyCount = await prisma.communityExample.count({
      where: { userId, createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1_000) } },
    });
    if (dailyCount >= 10) return NextResponse.json({ error: "The daily limit of 10 published examples has been reached." }, { status: 429 });

    const example = await prisma.communityExample.create({
      data: {
        title,
        category,
        description,
        icon,
        formula,
        componentSummary: suppliedSummary ?? buildComponentSummary(schematic.Components),
        contentJson,
        userId,
        isPublished: true,
      },
      select: {
        id: true,
        title: true,
        category: true,
        icon: true,
        formula: true,
        description: true,
        componentSummary: true,
        contentJson: true,
        user: { select: { name: true } },
      },
    });
    return NextResponse.json({
      id: example.id,
      title: example.title,
      category: example.category,
      icon: example.icon,
      formula: example.formula,
      description: example.description,
      componentSummary: example.componentSummary,
      contentJson: example.contentJson,
      ownerName: example.user.name?.trim() || "Community member",
    }, { status: 201, headers: JSON_HEADERS });
  } catch (error) {
    if (error instanceof EeePayloadTooLargeError) return NextResponse.json({ error: error.message }, { status: 413 });
    if (error instanceof SyntaxError) return NextResponse.json({ error: "The request body must contain valid JSON." }, { status: 400 });
    if (error instanceof TypeError || error instanceof RangeError) return NextResponse.json({ error: error.message }, { status: 400 });
    console.error("Community examples POST failed:", error instanceof Error ? error.name : "unknown error");
    return NextResponse.json({ error: "The example could not be saved." }, { status: 500 });
  }
}
