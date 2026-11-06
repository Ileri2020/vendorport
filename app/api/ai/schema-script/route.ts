import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  return NextResponse.json({
    error: "AI generation is performed by the EEE app. Request Gemini keys from /api/eee/ai-key/client.",
  }, {
    status: 410,
    headers: { "Cache-Control": "no-store" },
  });
}
