import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { error: "This endpoint was retired. Gemini keys are managed per user in the EESimulator account settings." },
    { status: 410, headers: { "Cache-Control": "no-store" } },
  );
}
